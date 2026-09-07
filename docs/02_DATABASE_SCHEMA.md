# Database Schema

This is the SINGLE SOURCE OF TRUTH for the Supabase database schema.

## Tables

### profiles
- `id` (UUID, PRIMARY KEY, references auth.users)
- `username` (TEXT)
- `display_name` (TEXT)
- `avatar_url` (TEXT)
- `bio` (TEXT)
- `role` (TEXT)
- `is_active` (BOOLEAN)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### tests
- `id` (UUID, PRIMARY KEY)
- `owner_id` (UUID, references profiles.id)
- `title` (TEXT)
- `description` (TEXT)
- `status` (TEXT: draft/active/paused)
- `visibility` (TEXT)
- `allow_anonymous` (BOOLEAN)
- `show_score_to_participant` (BOOLEAN)
- `show_rank_to_participant` (BOOLEAN)
- `allow_result_sharing` (BOOLEAN)
- `theme` (JSONB)
- `cover_image_url` (TEXT)
- `share_code` (TEXT, UNIQUE)
- `total_questions` (INTEGER)
- `attempt_count` (INTEGER)
- `completed_count` (INTEGER)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### test_questions
- `id` (UUID, PRIMARY KEY)
- `test_id` (UUID, references tests.id)
- `question_type` (TEXT: essay/multiple_choice)
- `prompt` (TEXT)
- `position` (INTEGER)
- `required` (BOOLEAN)
- `points` (INTEGER)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### question_options
- `id` (UUID, PRIMARY KEY)
- `question_id` (UUID, references test_questions.id)
- `option_text` (TEXT)
- `position` (INTEGER)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### private.question_answer_keys
- `question_id` (UUID, references test_questions.id)
- `correct_option_id` (UUID, references question_options.id)

**NEVER EXPOSED TO FRONTEND**

### test_attempts
- `id` (UUID, PRIMARY KEY)
- `test_id` (UUID, references tests.id)
- `participant_user_id` (UUID, references profiles.id, NULLABLE)
- `participant_name` (TEXT)
- `participant_token` (UUID)
- `status` (TEXT)
- `score` (INTEGER)
- `max_score` (INTEGER)
- `percentage` (INTEGER)
- `rank` (INTEGER)
- `submitted_at` (TIMESTAMP)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### test_answers
- `id` (UUID, PRIMARY KEY)
- `attempt_id` (UUID, references test_attempts.id)
- `question_id` (UUID, references test_questions.id)
- `selected_option_id` (UUID, references question_options.id, NULLABLE)
- `answer_text` (TEXT, NULLABLE)
- `is_correct` (BOOLEAN)
- `points_awarded` (INTEGER)
- `reviewed` (BOOLEAN)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### achievements
- `id` (UUID, PRIMARY KEY)
- `name` (TEXT)
- `description` (TEXT)
- `icon` (TEXT)
- `criteria` (JSONB)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### user_achievements
- `id` (UUID, PRIMARY KEY)
- `user_id` (UUID, references profiles.id)
- `achievement_id` (UUID, references achievements.id)
- `earned_at` (TIMESTAMP)

### notifications
- `id` (UUID, PRIMARY KEY)
- `user_id` (UUID, references profiles.id)
- `type` (TEXT)
- `title` (TEXT)
- `message` (TEXT)
- `data` (JSONB)
- `read` (BOOLEAN)
- `created_at` (TIMESTAMP)

### reports
- `id` (UUID, PRIMARY KEY)
- `reporter_id` (UUID, references profiles.id)
- `target_type` (TEXT)
- `target_id` (UUID)
- `reason` (TEXT)
- `status` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### ad_placements
- `id` (UUID, PRIMARY KEY)
- `placement_name` (TEXT)
- `ad_code` (TEXT)
- `is_active` (BOOLEAN)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### ad_events_daily
- `id` (UUID, PRIMARY KEY)
- `date` (DATE)
- `placement_name` (TEXT)
- `impressions` (INTEGER)
- `clicks` (INTEGER)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### app_settings
- `id` (UUID, PRIMARY KEY)
- `key` (TEXT, UNIQUE)
- `value` (JSONB)
- `updated_at` (TIMESTAMP)

## ERD Relationships
- profiles.id ← auth.users.id
- tests.owner_id → profiles.id
- test_questions.test_id → tests.id
- question_options.question_id → test_questions.id
- private.question_answer_keys.question_id → test_questions.id
- private.question_answer_keys.correct_option_id → question_options.id
- test_attempts.test_id → tests.id
- test_attempts.participant_user_id → profiles.id
- test_answers.attempt_id → test_attempts.id
- test_answers.question_id → test_questions.id
- test_answers.selected_option_id → question_options.id
- user_achievements.user_id → profiles.id
- user_achievements.achievement_id → achievements.id
- notifications.user_id → profiles.id
- reports.reporter_id → profiles.id
