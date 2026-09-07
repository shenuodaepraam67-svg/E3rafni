# quiz-api Edge Function Documentation

## Overview
The `quiz-api` Edge Function handles all backend operations for the E3rafni application. It provides a secure API layer that enforces authentication, authorization, and data validation.

## Base URL
```
https://[PROJECT_REF].supabase.co/functions/v1/quiz-api
```

## Authentication
- uses Supabase Auth JWT tokens
- Creator operations require valid JWT in `Authorization: Bearer <token>` header
- Participant operations can be anonymous if `allow_anonymous` is enabled on the test

## Actions

### create_test
Creates a new test in draft status.

**Authentication:** Required (Creator only)

**Request Body:**
```json
{
  "title": string,
  "description": string,
  "theme": object
}
```

**Response:**
```json
{
  "test": {
    "id": UUID,
    "owner_id": UUID,
    "title": string,
    "description": string,
    "theme": object,
    "status": "draft",
    "total_questions": 0,
    "attempt_count": 0,
    "completed_count": 0,
    "created_at": timestamp,
    "updated_at": timestamp
  }
}
```

**Security:**
- Validates JWT and extracts user ID
- Sets `owner_id` from authenticated user (never from request)
- Initializes counters to 0

---

### create_question
Adds a question to an existing test.

**Authentication:** Required (Creator only)

**Request Body:**
```json
{
  "test_id": UUID,
  "question": {
    "type": "multiple_choice" | "essay",
    "prompt": string,
    "position": number,
    "required": boolean,
    "points": number,
    "options": [
      {
        "text": string,
        "is_correct": boolean
      }
    ]
  }
}
```

**Response:**
```json
{
  "success": true,
  "question_id": UUID
}
```

**Security:**
- Validates JWT and extracts user ID
- Verifies user owns the test (checks `owner_id`)
- Uses service role key to write to `private.question_answer_keys`
- Stores correct answer in private schema (never exposed to frontend)
- Increments `total_questions` counter

---

### publish_test
Publishes a test, making it available to participants.

**Authentication:** Required (Creator only)

**Request Body:**
```json
{
  "test_id": UUID
}
```

**Response:**
```json
{
  "test": {
    "id": UUID,
    "status": "active",
    "share_code": string
  },
  "share_code": string
}
```

**Security:**
- Validates JWT and extracts user ID
- Verifies user owns the test
- Validates test is in `draft` status
- Validates test has at least one question
- Generates unique `share_code` with collision detection
- Changes status to `active`

---

### get_quiz_by_share_code
Retrieves quiz data for participants.

**Authentication:** Not required (Public)

**Request Body:**
```json
{
  "share_code": string
}
```

**Response:**
```json
{
  "test": {
    "id": UUID,
    "title": string,
    "description": string,
    "theme": object,
    "show_score_to_participant": boolean,
    "show_rank_to_participant": boolean,
    "test_questions": [
      {
        "id": UUID,
        "question_type": string,
        "prompt": string,
        "position": number,
        "required": boolean,
        "points": number,
        "question_options": [
          {
            "id": UUID,
            "option_text": string,
            "position": number
          }
        ]
      }
    ]
  }
}
```

**Security:**
- Only returns active tests
- Never exposes correct answers
- Never exposes answer keys
- Uses anon key (no service role)

---

### start_attempt
Starts a new quiz attempt.

**Authentication:** Optional (if `allow_anonymous` is true)

**Request Body:**
```json
{
  "share_code": string,
  "participant_name": string
}
```

**Response:**
```json
{
  "attempt": {
    "id": UUID,
    "participant_token": UUID
  },
  "questions": [
    {
      "id": UUID,
      "question_type": string,
      "prompt": string,
      "position": number,
      "required": boolean,
      "points": number,
      "question_options": [
        {
          "id": UUID,
          "option_text": string,
          "position": number
        }
      ]
    }
  ]
}
```

**Security:**
- Checks if test allows anonymous access
- If authenticated, links attempt to user via `participant_user_id`
- Generates secure `participant_token`
- Increments test's `attempt_count`
- Returns questions without correct answers

---

### save_answer
Saves a participant's answer temporarily.

**Authentication:** Not required (uses participant token validation)

**Request Body:**
```json
{
  "attempt_id": UUID,
  "question_id": UUID,
  "answer": {
    "selected_option_id": UUID | null,
    "answer_text": string | null
  },
  "participant_token": UUID
}
```

**Response:**
```json
{
  "success": true
}
```

**Security:**
- Validates participant_token matches the attempt's token
- Validates attempt is in `in_progress` status
- Uses service role key for upsert
- Does not calculate score (deferred to submission)

---

### submit
Submits the quiz for scoring.

**Authentication:** Not required (uses participant token validation)

**Request Body:**
```json
{
  "attempt_id": UUID,
  "participant_token": UUID
}
```

**Response:**
```json
{
  "success": true,
  "score": number,
  "max_score": number,
  "percentage": number,
  "rank": number,
  "total_participants": number,
  "answers": [
    {
      "question_id": UUID,
      "is_correct": boolean,
      "points_awarded": number
    }
  ]
}
```

**Security:**
- Validates participant_token matches the attempt's token
- Validates attempt is in `in_progress` status
- Uses service role key to access `private.question_answer_keys`
- Calculates score server-side (never trusts client)
- Calculates rank among all completed attempts
- Updates all answer records with `is_correct` and `points_awarded`
- Increments test's `completed_count`

---

### get_dashboard_stats
Retrieves dashboard statistics for a creator.

**Authentication:** Required (Creator only)

**Request Body:**
```json
{}
```

**Response:**
```json
{
  "total_tests": number,
  "total_participants": number,
  "total_answers": number,
  "average_percentage": number
}
```

**Security:**
- Validates JWT and extracts user ID
- Only returns statistics for user's own tests
- Uses `owner_id` filter
- Calculates real average percentage from completed attempts
- Calculates total answers from actual attempt data

---

### get_tests
Retrieves list of tests for a creator.

**Authentication:** Required (Creator only)

**Request Body:**
```json
{}
```

**Response:**
```json
{
  "tests": [
    {
      "id": UUID,
      "title": string,
      "description": string,
      "status": string,
      "share_code": string,
      "total_questions": number,
      "attempt_count": number,
      "completed_count": number,
      "created_at": timestamp,
      "updated_at": timestamp
    }
  ]
}
```

**Security:**
- Validates JWT and extracts user ID
- Only returns user's own tests
- Uses `owner_id` filter
- Does not use `select('*')` to avoid exposing sensitive fields

---

## Error Responses
All errors return:
```json
{
  "error": string
}
```
With HTTP status code 400.

## Security Notes

### Never Exposed to Frontend
- `private.question_answer_keys` table
- Correct answer IDs
- Service role keys
- Participant tokens (stored in memory only)
- Other users' test data

### Server-Side Only
- Score calculation
- Percentage calculation
- Rank calculation
- Answer validation
- `is_correct` determination
- `points_awarded` determination

### Authorization Checks
- Creator operations verify `owner_id` matches authenticated user
- Participant operations validate attempt status
- Anonymous access respects `allow_anonymous` setting

### Service Role Usage
- Only used for:
  - Writing to `private.question_answer_keys`
  - Updating `is_correct` and `points_awarded`
  - Accessing private schema for scoring
- Never exposed to frontend
- Never used to bypass ownership checks

## Database Schema References
All operations use the schema defined in `docs/02_DATABASE_SCHEMA.md`:
- `tests`
- `test_questions`
- `question_options`
- `private.question_answer_keys`
- `test_attempts`
- `test_answers`
- `profiles`
