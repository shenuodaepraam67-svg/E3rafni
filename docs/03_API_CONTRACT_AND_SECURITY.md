# API Contract and Security

## API Layer
Frontend MUST use a centralized API layer (`src/lib/api/`) calling the `quiz-api` Edge Function. NO direct raw Supabase table writes for sensitive data.

## Actions
- `create_test`
- `publish_test`
- `start_attempt`
- `save_answer`
- `submit`

## STRICT SECURITY RULES (NEVER VIOLATE)

1. **NEVER expose correct answer keys, private schema data, or server-calculated scores to the client.**
   - The `private.question_answer_keys` table must never be accessible from the frontend
   - Score, percentage, and rank calculations must happen server-side only
   - Frontend should only display results that are explicitly returned by the backend

2. **NEVER allow frontend to directly modify score, percentage, rank, is_correct, or points_awarded.**
   - These fields are server-calculated and must be read-only from the frontend perspective
   - Only the Edge Function can update these fields based on validated answer submission

3. **NEVER store participant_token in URLs. Keep it in memory/Zustand only.**
   - The participant_token is sensitive and should only exist in client-side memory
   - Never include it in query parameters, URLs, or localStorage
   - Use Zustand store for temporary session management

4. **NEVER bypass RLS or use service-role keys in frontend.**
   - All database access must go through proper RLS policies
   - Service-role keys are for backend use only (Edge Functions)
   - Frontend should only use the anon/public Supabase client

5. **Frontend only sends { selected_option_id } or { answer_text }. Backend validates, loads private keys, calculates score, updates attempt, calculates rank, creates notification, and returns result.**
   - Frontend submission format:
     ```typescript
     // For multiple choice
     { selected_option_id: UUID }
     
     // For essay
     { answer_text: string }
     ```
   - Backend responsibilities:
     - Validate the submission
     - Load correct answer from private.question_answer_keys
     - Calculate if answer is correct
     - Award points based on question.points
     - Update test_attempts with score, percentage, rank
     - Update test_answers with is_correct, points_awarded
     - Calculate rank among all attempts
     - Create notification for test owner
     - Return final result to frontend

## API Flow Example

### Start Attempt
```typescript
// Frontend sends
POST /api/quiz-api/start_attempt
{
  test_id: UUID,
  participant_name?: string, // if anonymous
}

// Backend returns
{
  attempt_id: UUID,
  participant_token: UUID,
  questions: [
    {
      id: UUID,
      question_type: "multiple_choice" | "essay",
      prompt: string,
      position: number,
      required: boolean,
      points: number,
      options: [
        {
          id: UUID,
          option_text: string,
          position: number
        }
      ]
      // NO correct_option_id or answer key
    }
  ]
}
```

### Submit Answer
```typescript
// Frontend sends
POST /api/quiz-api/submit_answer
{
  attempt_id: UUID,
  question_id: UUID,
  selected_option_id?: UUID, // for MCQ
  answer_text?: string // for essay
}

// Backend returns
{
  success: boolean,
  // NO score, is_correct, or points returned during quiz
  // Only final submission returns full results
}
```

### Submit Quiz
```typescript
// Frontend sends
POST /api/quiz-api/submit_quiz
{
  attempt_id: UUID
}

// Backend returns
{
  success: boolean,
  score: number,
  max_score: number,
  percentage: number,
  rank: number,
  total_participants: number,
  result_level: string,
  answers: [
    {
      question_id: UUID,
      is_correct: boolean,
      points_awarded: number,
      correct_option_id?: UUID // only shown if test owner allows
    }
  ]
}
```
