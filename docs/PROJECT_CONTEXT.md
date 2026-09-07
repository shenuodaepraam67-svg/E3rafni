أيوه. لو هدفك تدي Claude Code مواصفات واضحة بحيث يبني الـFrontend كامل ويربطه بالـSupabase Backend الموجود، فالأفضل ما تديلوش مجرد وصف؛ اديله Architecture + Database Contract + User Flows + API Contract + UI Pages.
دي الـSchema/Blueprint اللي أقترح تبعتها له كما هي:
1. فكرة المشروع
اسم مؤقت: اعرفني — E3rafni
الموقع عبارة عن منصة لإنشاء اختبارات شخصية.
المنشئ يعمل اختبار عن نفسه، مثل:
"قد إيه أنت تعرفني؟"
ثم يحصل على رابط مثل:
/t/Ab12Cd34
يرسله لأصدقائه.
الشخص الذي يستلم الرابط يستطيع الإجابة بدون إنشاء حساب، ثم يحصل على نتيجته.
مثال:
🧠 نسبة معرفتك بشنودة: 87%
إجابات صحيحة: 13 / 15
ترتيبك: #2
مستوى المعرفة: ممتاز
2. Architecture
                    ┌─────────────────────┐
                    │      Frontend       │
                    │ React / Next.js     │
                    └──────────┬──────────┘
                               │
                               │ HTTPS
                               ▼
                    ┌─────────────────────┐
                    │   Supabase Auth     │
                    │ Login / Register    │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Supabase Edge       │
                    │ Function: quiz-api  │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │     PostgreSQL      │
                    │       Supabase      │
                    └──────────┬──────────┘
                               │
            ┌──────────────────┼──────────────────┐
            ▼                  ▼                  ▼
       profiles             tests             attempts
            │                  │                  │
            │                  ▼                  ▼
            │             questions            answers
            │                  │
            │                  ▼
            │               options
            │
            ├──────── achievements
            ├──────── notifications
            └──────── dashboard
3. المستخدمون
لدينا نوعان رئيسيان:
Creator
الشخص الذي ينشئ الاختبار.
يحتاج:
تسجيل حساب
إنشاء اختبار
إضافة أسئلة
تحديد الإجابات الصحيحة
نشر الاختبار
الحصول على الرابط
مشاهدة النتائج
مشاهدة الإحصائيات
Participant
الشخص الذي يدخل الاختبار.
لا يحتاج حسابًا إذا كان الاختبار يسمح بالإجابة المجهولة.
يحتاج:
فتح الرابط
الإجابة
إرسال الاختبار
رؤية النتيجة
4. Database Schema
profiles
profiles
├── id UUID PK → auth.users.id
├── username TEXT UNIQUE
├── display_name TEXT
├── avatar_url TEXT
├── bio TEXT
├── role ENUM
├── is_active BOOLEAN
├── created_at
└── updated_at
tests
tests
├── id UUID PK
├── owner_id UUID → profiles.id
├── title TEXT
├── description TEXT
├── status ENUM
├── visibility ENUM
├── allow_anonymous BOOLEAN
├── show_score_to_participant BOOLEAN
├── show_rank_to_participant BOOLEAN
├── allow_result_sharing BOOLEAN
├── allow_create_own_test_prompt BOOLEAN
├── theme JSONB
├── cover_image_url TEXT
├── share_code TEXT UNIQUE
├── total_questions INTEGER
├── attempt_count INTEGER
├── completed_count INTEGER
├── created_at
├── updated_at
├── published_at
└── deleted_at
العلاقة:
profiles 1 ──────── N tests
5. Questions
test_questions
test_questions
├── id UUID PK
├── test_id UUID → tests.id
├── question_type ENUM
│      ├── essay
│      └── multiple_choice
├── prompt TEXT
├── position INTEGER
├── required BOOLEAN
├── points INTEGER
├── created_at
└── updated_at
العلاقة:
tests 1 ──────── N test_questions
6. Multiple Choice Options
question_options
question_options
├── id UUID PK
├── question_id UUID → test_questions.id
├── option_text TEXT
├── position INTEGER
├── created_at
└── updated_at
مثال:
Question:
"ما أكلي المفضل؟"

Options:

1 → Pizza
2 → Burger
3 → Pasta
4 → Chicken
7. Answer Key
الإجابة الصحيحة لا يجب أن تظهر للـFrontend.
لذلك:
private.question_answer_keys
├── question_id
└── correct_option_id
وتظل داخل:
private schema
وليس في API العام.
8. Attempts
كل مرة شخص يحل الاختبار = Attempt.
test_attempts
├── id UUID PK
├── test_id UUID
├── participant_user_id UUID NULL
├── participant_name TEXT
├── participant_token UUID
├── status ENUM
├── score INTEGER
├── max_score INTEGER
├── percentage NUMERIC
├── rank INTEGER
├── submitted_at
├── created_at
└── updated_at
العلاقة:
tests 1 ──────── N attempts
9. Answers
test_answers
├── id UUID PK
├── attempt_id UUID
├── question_id UUID
├── selected_option_id UUID NULL
├── answer_text TEXT NULL
├── is_correct BOOLEAN
├── points_awarded INTEGER
├── reviewed BOOLEAN
├── reviewed_by UUID
├── reviewed_at
├── created_at
└── updated_at
مثال:
Attempt
   │
   ├── Question 1 → Pizza → Correct
   ├── Question 2 → Cairo → Correct
   ├── Question 3 → "..." → Essay
   └── Question 4 → Chicken → Wrong
10. Achievements
achievements
├── id UUID
├── code
├── name
├── description
└── icon
والربط:
user_achievements
├── user_id
├── achievement_id
└── earned_at
أمثلة:
first_test
first_response
popular_100
popular_1000
knowledge_master
quiz_creator_10
top_score_10
streak_7
11. Notifications
notifications
├── id UUID
├── user_id UUID
├── type TEXT
├── title TEXT
├── body TEXT
├── data JSONB
├── is_read BOOLEAN
├── read_at
└── created_at
مثال:
🎉 شخص جديد أكمل اختبارك!
12. Reports
reports
├── id UUID
├── reporter_id UUID
├── test_id UUID
├── attempt_id UUID
├── reason ENUM
├── details TEXT
├── status ENUM
├── moderator_id UUID
├── resolution TEXT
└── created_at
13. Ads
بما أن الإعلانات هي مصدر الربح الوحيد:
ad_placements
ad_placements
├── id UUID
├── placement_key
├── name
├── description
├── enabled
├── max_per_session
└── cooldown
أماكن الإعلانات:
home_top
home_bottom
builder_step
result_top
result_bottom
success_page
ولا نضع إعلانًا داخل سؤال أثناء الإجابة.
ad_events_daily
ad_events_daily
├── event_date
├── placement_id
├── event_type
├── impressions
├── clicks
├── unique_users
└── estimated_revenue
14. App Settings
app_settings
├── key
├── value
└── updated_at
الإعدادات الحالية:
registration.enabled
tests.max_questions
tests.max_options
ads.enabled
ads.source
maintenance.enabled
15. العلاقات الكاملة
Claude Code لازم يفهم الـERD بالشكل ده:
AUTH USERS
    │
    ▼
PROFILES
    │
    ├──────────────┐
    ▼              ▼
  TESTS       USER_ACHIEVEMENTS
    │
    ├──────────────► TEST_QUESTIONS
    │                     │
    │                     ▼
    │              QUESTION_OPTIONS
    │                     │
    │                     ▼
    │              PRIVATE ANSWER KEY
    │
    └──────────────► TEST_ATTEMPTS
                           │
                           ▼
                      TEST_ANSWERS


PROFILES
    │
    └──────────────► NOTIFICATIONS


TESTS
    │
    └──────────────► REPORTS


AD_PLACEMENTS
    │
    └──────────────► AD_EVENTS_DAILY
16. Frontend Pages
Claude Code يبني الصفحات التالية:
/
├── Home
│
├── /login
│
├── /register
│
├── /create
│
├── /create/questions
│
├── /create/review
│
├── /create/success
│
├── /dashboard
│
├── /dashboard/tests
│
├── /dashboard/tests/:id
│
├── /dashboard/tests/:id/results
│
├── /dashboard/tests/:id/analytics
│
├── /settings
│
├── /notifications
│
└── /t/:shareCode
      │
      ├── Quiz
      └── Result
17. Homepage
┌─────────────────────────────────┐
│              Logo               │
│                                 │
│        قد إيه أنت تعرفني؟       │
│                                 │
│  اختبر أصحابك وشوف مين يعرفك    │
│          أكتر من غيره           │
│                                 │
│      [ اعمل اختبار ]            │
│                                 │
│      [ جاوب على اختبار ]        │
│                                 │
│              AD                 │
└─────────────────────────────────┘
18. Create Test Flow
Home
 │
 ▼
اعمل اختبار
 │
 ▼
Login/Register
 │
 ▼
Test Information
 │
 ├── Title
 ├── Description
 ├── Cover
 └── Theme
 │
 ▼
Add Questions
 │
 ├── Multiple Choice
 │
 │     ├── Question
 │     ├── Option A
 │     ├── Option B
 │     ├── Option C
 │     └── Correct Answer
 │
 └── Essay
       │
       └── Question
 │
 ▼
Review
 │
 ▼
Publish
 │
 ▼
Generate Share Link
 │
 ├── Copy
 └── WhatsApp Share
19. Quiz Page
الرابط:
/t/:shareCode
الصفحة:
┌─────────────────────────────┐
│       قد إيه تعرفني؟        │
│                             │
│ السؤال 3 من 15              │
│ ███████░░░░░░░              │
│                             │
│ ما هو أكلي المفضل؟          │
│                             │
│ ○ Pizza                     │
│                             │
│ ○ Burger                    │
│                             │
│ ○ Pasta                     │
│                             │
│ ○ Chicken                   │
│                             │
│          [ التالي ]         │
└─────────────────────────────┘
ممنوع وضع إعلان بين الأسئلة.
20. Result Page
مثلاً:
┌─────────────────────────────┐
│        🎉 النتيجة           │
│                             │
│          87%                │
│                             │
│       معرفة ممتازة          │
│                             │
│     13 / 15 صحيح            │
│                             │
│       🏆 الترتيب #2         │
│                             │
│ ███████████████░░           │
│                             │
│            AD               │
│                             │
│ [ شارك النتيجة ]            │
│                             │
│ [ اعمل اختبارك أنت ]        │
└─────────────────────────────┘
21. مستويات نسبة المعرفة
الـFrontend يعمل classification:
0 - 20%     لا تعرفني خالص 😂
21 - 40%    معرفة ضعيفة
41 - 60%    معرفة متوسطة
61 - 80%    تعرفني كويس
81 - 95%    معرفة ممتازة
96 - 100%   أنت حافظني 😂🏆
هذه Presentation Logic وليست قاعدة بيانات.
22. Dashboard
الـCreator يشاهد:
Dashboard
│
├── إجمالي الاختبارات
├── إجمالي المشاركين
├── إجمالي الإجابات
└── متوسط نسبة المعرفة
ثم:
My Tests

┌─────────────────────────────────────┐
│ قد إيه تعرفني؟                      │
│                                     │
│ 👥 127 مشارك                        │
│ ✅ 114 مكتمل                        │
│ 📊 متوسط المعرفة 78%                │
│                                     │
│ [ النتائج ] [ التحليلات ] [ تعديل ]│
└─────────────────────────────────────┘
23. Results Dashboard
النتائج

#1  أحمد       97%
#2  مينا       93%
#3  يوسف       87%
#4  مارك       80%
#5  جورج       73%
مع:
أصعب سؤال
أسهل سؤال
متوسط الإجابات
عدد المشاركين
أعلى نتيجة
أقل نتيجة
24. API Contract
Claude Code لا يتعامل مباشرة مع الجداول الحساسة.
يستخدم:
quiz-api
والـactions:
POST /quiz-api
Body:
{
  "action": "create_test"
}
create_test
{
  "action": "create_test",
  "title": "قد إيه تعرفني؟",
  "description": "اختبار لأصحابي",
  "theme": {}
}
يتطلب:
Authenticated User
publish_test
{
  "action": "publish_test",
  "test_id": "UUID"
}
الـBackend يتحقق من:
owner
questions >= 1
MCQ has options
MCQ has correct answer
question limits
test not deleted
ثم:
status = active
share_code = ...
published_at = now()
25. Start Quiz
POST /quiz-api

{
  "action": "start_attempt",
  "share_code": "Ab12Cd34",
  "participant_name": "أحمد"
}
الـBackend يرجع:
{
  "attempt_id": "...",
  "participant_token": "...",
  "test": {},
  "questions": [],
  "options": []
}
لا يرجع correct answers.
26. Save Answer
{
  "action": "save_answer",
  "attempt_id": "...",
  "participant_token": "...",
  "question_id": "...",
  "selected_option_id": "..."
}
أو:
{
  "action": "save_answer",
  "attempt_id": "...",
  "participant_token": "...",
  "question_id": "...",
  "answer_text": "..."
}
27. Submit
{
  "action": "submit",
  "attempt_id": "...",
  "participant_token": "..."
}
الـBackend فقط هو الذي يقوم بـ:
validate answers
        ↓
load private answer keys
        ↓
calculate score
        ↓
calculate percentage
        ↓
update attempt
        ↓
update test counters
        ↓
calculate rank
        ↓
create notification
        ↓
return result
28. Security Model
دي نقطة مهمة جدًا لـClaude Code:
ممنوع:
Frontend → test_answer_keys
ممنوع:
Frontend → UPDATE test_attempts.score
ممنوع:
Frontend → UPDATE test_answers.is_correct
ممنوع:
Frontend → INSERT fake completed attempt
الصحيح:
Frontend
   ↓
Edge Function
   ↓
Validated RPC
   ↓
PostgreSQL
29. Auth
استخدم Supabase Auth.
Register
   ↓
Supabase Auth
   ↓
profiles created automatically
Login:
email/password
ولا تسمح للـFrontend بتغيير:
role
is_active
30. Anonymous Participant
المشارك لا يحتاج Account.
يتم إعطاؤه:
attempt_id
+
participant_token
الـtoken يستخدم فقط للوصول لمحاولته.
مثلاً:
Browser
   │
   ├── attempt_id
   └── participant_token
ولا يتم تخزينه في URL.
31. WhatsApp
بعد إنشاء الاختبار:
https://your-domain.com/t/Ab12Cd34
زر:
شارك على WhatsApp
يجهز رسالة مشاركة تحتوي على رابط الاختبار.
32. Ads Strategy
الإعلانات تكون في:
Home
   ↓
Builder transition
   ↓
Success page
   ↓
Result page
وليس:
Question 1
Question 2
Question 3
لأن هذا يضر تجربة الاختبار.
33. Responsive Design
يجب أن يكون:
Mobile First
ويعمل على:
Android
iPhone
Tablet
Desktop
خصوصًا لأن أغلب المشاركين سيصلون من رابط يتم إرساله عبر WhatsApp.
34. State Management
الـFrontend يحتاج حالات مثل:
auth
currentUser

quizBuilder
 ├── title
 ├── description
 ├── questions
 └── theme

activeQuiz
 ├── test
 ├── questions
 └── options

attempt
 ├── attemptId
 ├── token
 └── answers

result
 ├── score
 ├── percentage
 └── rank
ولا تجعل كل شيء في localStorage.
الـlocalStorage يمكن استخدامه فقط كـdraft مؤقت للـBuilder.
35. Loading / Error States
كل عملية تحتاج:
Loading
Success
Error
Empty
Retry
مثلاً:
جارٍ تحميل الاختبار...
ولو الرابط خطأ:
الاختبار غير موجود أو تم إغلاقه.
[ العودة للرئيسية ]
36. أهم قاعدة لـClaude Code
أضف له هذه التعليمات حرفيًا:
Do not invent database tables, columns, RPCs, or API endpoints. Inspect the existing Supabase project/schema first and use the existing production database contract. If something is missing, explicitly identify it and create it through a migration before using it in the frontend. Never expose answer keys, participant tokens, admin roles, server-side scores, or private schema data to the client.
37. ترتيب التنفيذ الذي أريده من Claude Code
خليه ينفذ بالترتيب:
PHASE 1
│
├── Inspect Supabase
├── Inspect database schema
├── Inspect Edge Functions
└── Generate typed API/database types

PHASE 2
│
├── Project setup
├── Routing
├── Supabase client
├── Auth
└── Global UI

PHASE 3
│
├── Homepage
├── Login
└── Register

PHASE 4
│
├── Create Test
├── Questions Builder
├── MCQ
├── Essay
├── Reordering
├── Review
└── Publish

PHASE 5
│
├── Share page
├── WhatsApp
└── Copy link

PHASE 6
│
├── Public Quiz
├── Start Attempt
├── Save Answers
├── Submit
└── Result

PHASE 7
│
├── Dashboard
├── Tests
├── Results
├── Analytics
└── Notifications

PHASE 8
│
├── Achievements
├── Settings
├── Reports
└── Ads

PHASE 9
│
├── Security audit
├── RLS testing
├── API testing
├── Mobile testing
└── Production build
والجزء الأهم: Prompt واحد لـClaude Code
انسخ له الآتي:
الكتابة
Build the Frontend for the Quiz Platform
You are building the production frontend for a personal-quiz platform called "E3rafni".
The backend is already implemented in Supabase. Do NOT invent a new backend architecture.
Core concept
A registered user creates a quiz about themselves.
Example:
"How well do you know me?"
The creator adds multiple-choice and/or essay questions, publishes the quiz, and receives a shareable link.
Example:
/t/Ab12Cd34
The creator can send this link through WhatsApp.
A participant opens the link and can answer anonymously unless the quiz requires authentication.
After submission, the backend calculates:
score
maximum score
percentage
correct answers
rank
completion status
The participant then sees a result page.
The creator has a dashboard containing participants, results, statistics, and analytics.
The only monetization method is advertising.
Backend source of truth
Supabase is the source of truth.
Before writing frontend code:
Inspect the existing Supabase database schema.
Inspect existing tables.
Inspect RLS policies.
Inspect existing functions/RPCs.
Inspect the deployed quiz-api Edge Function.
Do not invent table names or API contracts.
If a required backend capability is missing, report it and create a migration/backend change before depending on it.
The existing major entities are:
profiles
tests
test_questions
question_options
test_attempts
test_answers
achievements
user_achievements
notifications
reports
ad_placements
ad_events_daily
app_settings
There is also a private schema containing answer keys and protected backend logic.
Security requirements
NEVER expose:
correct answer keys
private schema data
participant capability tokens in URLs
server-calculated scores as client-writable fields
user roles as client-writable fields
admin/moderator functionality to normal users
The frontend must never directly modify:
score
percentage
rank
is_correct
points_awarded
answer keys
All result calculation must happen on the backend.
Anonymous participants authenticate their attempt using the server-generated attempt credentials.
Do not store participant tokens in URLs.
Do not bypass RLS.
Do not use service-role credentials in frontend code.
Main routes
Implement:
/
/login
/register
/create
/create/questions
/create/review
/create/success
/dashboard
/dashboard/tests
/dashboard/tests/:id
/dashboard/tests/:id/results
/dashboard/tests/:id/analytics
/notifications
/settings
/t/:shareCode
The /t/:shareCode route is public.
Homepage
Create a modern mobile-first landing page.
Main CTA:
"اعمل اختبار"
Secondary CTA:
"جاوب على اختبار"
Explain the concept briefly.
Include advertising placement without interrupting the main interaction.
Authentication
Use Supabase Auth.
Support:
registration
login
logout
authenticated session
protected creator dashboard
redirect unauthenticated users to login when required
Never allow the client to change:
role
is_active
Quiz Builder
The creator can create:
title
description
cover image
theme/customization
Questions can be:
Multiple choice
Essay
Multiple-choice questions require:
question text
2+ options
one correct option
Essay questions require:
question text
Allow:
adding questions
deleting questions
editing questions
reordering questions
marking required questions
setting points
Provide a clean review step before publishing.
Publishing
Before publishing, validate:
title exists
at least one question exists
question limits
multiple-choice questions have enough options
every multiple-choice question has a valid correct answer
all questions are valid
Publishing must go through the backend.
After successful publishing:
Show:
generated share link
Copy button
WhatsApp share button
success message
Public Quiz
Route:
/t/:shareCode
When opened:
Fetch the public quiz through the backend API.
Do not fetch answer keys.
Show title and description.
Ask participant name if appropriate.
Start an attempt through the backend.
Receive attempt ID and participant credential.
Display questions.
Question UI:
progress indicator
current question
multiple-choice selection
essay text input
previous/next navigation
final submit button
Do NOT display ads between questions.
Answer handling
Answers must be submitted through the backend API.
Multiple-choice:
{
  "selected_option_id": "..."
}
Essay:
{
  "answer_text": "..."
}
The frontend must never calculate correctness.
The frontend must never send:
is_correct
score
percentage
rank
points_awarded
as authoritative values.
Result
After submission show:
percentage
score
max score
correct answers
rank
grading status
Only show score/rank if the backend says the quiz allows the participant to see them.
Use these presentation levels:
0–20: "لا تعرفني خالص 😂"
21–40: "معرفة ضعيفة"
41–60: "معرفة متوسطة"
61–80: "تعرفني كويس"
81–95: "معرفة ممتازة"
96–100: "أنت حافظني 😂🏆"
These labels are presentation logic only.
Show an advertising placement on the result page, but never obstruct the result.
Add:
Share result
Create your own quiz
Dashboard
Create a creator dashboard.
Show:
total tests
total attempts
completed attempts
average knowledge percentage
Test cards should show:
title
status
participant count
completed count
average percentage
actions
Actions:
edit
view results
analytics
publish/pause where permitted
share
Results
For each test show:
participant name
score
percentage
rank
submission date
Add:
highest score
average score
lowest score
hardest question
easiest question
answer statistics
Do not expose participant capability tokens.
Analytics
Use backend analytics.
Display useful charts/statistics such as:
attempts over time
completed attempts
average percentage
score distribution
question correctness rates
Keep the UI simple and mobile-friendly.
Notifications
Create a notifications page.
Examples:
"شخص جديد أكمل اختبارك"
"حصلت على إنجاز جديد"
Support:
read/unread
mark as read
timestamp
Achievements
Display earned achievements.
Examples:
أول اختبار
أول إجابة
100 مشارك
1000 مشارك
خبير المعرفة
صانع الاختبارات
أعلى النتائج
Achievements are awarded by the backend.
Ads
Advertising is the only monetization system.
Use existing ad placement configuration.
Allowed locations:
home_top
home_bottom
builder_step
result_top
result_bottom
success_page
Never put ads between quiz questions.
Never make ads block quiz submission.
Never trust client-provided revenue values.
UI/UX
Design requirements:
mobile-first
responsive
modern
fast
accessible
Arabic RTL
clean typography
clear hierarchy
subtle animations
excellent loading states
excellent error states
empty states
retry states
The most important UX is the public quiz flow.
A participant should be able to open a WhatsApp link and start answering immediately.
State management
Keep authentication state separate from quiz state.
Suggested state:
auth
currentUser

quizBuilder
  title
  description
  questions
  theme

activeQuiz
  test
  questions
  options

attempt
  attemptId
  participantToken
  answers

result
  score
  maxScore
  percentage
  rank
Use localStorage only for temporary builder drafts where useful.
Do not use localStorage as the authoritative database.
API abstraction
Create one frontend API layer.
For example:
src/lib/api/
Do not scatter raw Supabase calls throughout components.
Create typed functions such as:
createTest()
updateTest()
addQuestion()
updateQuestion()
deleteQuestion()
publishTest()

startAttempt()
saveAnswer()
submitAttempt()
getAttemptResult()

getDashboardStats()
getTestResults()
getTestAnalytics()

getNotifications()
markNotificationRead()
The exact implementation must follow the actual deployed Supabase backend contract.
Error handling
Every API operation must handle:
loading
success
validation error
authorization error
not found
network failure
unexpected server error
Never silently fail.
Use user-friendly Arabic messages.
Performance
Optimize for mobile networks.
Requirements:
lazy-load heavy dashboard components
avoid unnecessary database requests
cache stable public quiz data where appropriate
debounce search/filtering
avoid refetching the same data repeatedly
paginate large result lists
Production requirements
Before finishing:
Run type checking.
Run linting.
Run build.
Test authentication.
Test quiz creation.
Test publishing.
Test anonymous quiz participation.
Test multiple-choice scoring.
Test essay handling.
Test result visibility.
Test dashboard.
Test RLS-related failure cases.
Verify answer keys are never sent to the browser.
Verify participant tokens are never placed in URLs.
Verify normal users cannot modify scores.
Verify ads do not interrupt questions.
Test mobile responsive layouts.
Do not declare the project production-ready until these checks pass.
Development order
Implement in this exact order:
Inspect backend.
Generate types.
Configure Supabase client.
Authentication.
Global layout/navigation.
Homepage.
Quiz builder.
Publish flow.
Public quiz.
Attempt handling.
Result page.
Dashboard.
Results.
Analytics.
Notifications.
Achievements.
Settings.
Ads.
Error handling.
Testing.
Production build.
Do not skip backend inspection. Do not invent backend behavior. Do not expose protected data. Do not duplicate server-side business logic in the frontend.