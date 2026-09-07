# Project Overview: E3rafni (اعرفني)

## Concept
A registered user (Creator) creates a quiz about themselves (e.g., "قد إيه أنت تعرفني؟"), publishes it, and gets a shareable link (e.g., `/t/Ab12Cd34`). A Participant opens the link, answers anonymously (or authenticated), and the backend calculates the score, rank, and percentage.

## Architecture
Frontend (Next.js App Router, React, Tailwind, Zustand) → HTTPS → Supabase Auth → Supabase Edge Function (`quiz-api`) → PostgreSQL (Supabase).

## Users

### Creator
- Needs account
- Creates test
- Adds questions
- Sets correct answers
- Publishes
- Gets link
- Views results/analytics

### Participant
- No account needed (if allowed)
- Opens link
- Answers
- Submits
- Sees result

## Monetization
Ads are the ONLY revenue source.
