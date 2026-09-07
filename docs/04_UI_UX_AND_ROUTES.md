# UI/UX and Routes

## Language
Arabic (RTL) for ALL user-facing text, errors, and loading states.

## Design
- Mobile-first
- Modern
- Clean typography
- Subtle animations
- Fast
- Accessible
- Clear hierarchy
- Excellent loading states
- Excellent error states
- Empty states
- Retry states

## Routes

### Public Routes
- `/` - Homepage
- `/login` - Login page
- `/register` - Registration page
- `/t/[shareCode]` - Public quiz page (participant view)

### Creator Routes (Authenticated)
- `/create` - Create test wizard start
- `/create/questions` - Questions builder
- `/create/review` - Review test before publishing
- `/create/success` - Success page after publishing
- `/dashboard` - Main dashboard
- `/dashboard/tests` - Tests list
- `/dashboard/tests/[id]` - Test details
- `/dashboard/tests/[id]/results` - Test results
- `/dashboard/tests/[id]/analytics` - Test analytics
- `/notifications` - Notifications page
- `/settings` - User settings

## Ad Placements
ALLOWED ONLY in:
- `home_top`
- `home_bottom`
- `builder_step`
- `result_top`
- `result_bottom`
- `success_page`

NEVER between quiz questions.

## Result Levels (Presentation Logic Only)
- 0-20%: "لا تعرفني خالص 😂"
- 21-40%: "معرفة ضعيفة"
- 41-60%: "معرفة متوسطة"
- 61-80%: "تعرفني كويس"
- 81-95%: "معرفة ممتازة"
- 96-100%: "أنت حافظني 😂🏆"

## Wireframe Descriptions

### Homepage
- Hero section with main CTA: "اعمل اختبار"
- Secondary CTA: "جاوب على اختبار"
- Brief explanation of the concept
- Modern, clean design
- Ad placement: home_top, home_bottom
- Mobile-first responsive layout

### Quiz Page (Public Quiz)
- Test title and description
- Participant name input (if anonymous)
- Progress indicator
- Current question display
- Multiple-choice selection UI
- Essay text input UI
- Previous/Next navigation
- Final submit button
- NO ads between questions
- Clean, focused interface

### Result Page
- Percentage display
- Score and max score
- Correct answers count
- Rank display
- Result level message (based on percentage)
- Share result button
- Create your own quiz button
- Ad placement: result_top, result_bottom
- Mobile-friendly layout

## Loading States
All operations must have proper loading states in Arabic:
- "جارٍ تحميل الاختبار..."
- "جارٍ إنشاء الحساب..."
- "جارٍ حفظ الإجابات..."
- "جارٍ حساب النتيجة..."

## Error States
User-friendly Arabic error messages:
- "الاختبار غير موجود أو تم إغلاقه. [ العودة للرئيسية ]"
- "حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى."
- "يجب تسجيل الدخول للوصول إلى هذه الصفحة."

## Empty States
- "لا توجد اختبارات بعد. ابدأ بإنشاء أول اختبار!"
- "لا توجد نتائج حتى الآن."
- "لا توجد إشعارات جديدة."

## State Management
Use Zustand for state management with these stores:
- `auth` - Authentication state
- `currentUser` - Current user data
- `quizBuilder` - Test creation state (title, description, questions, theme)
- `activeQuiz` - Active quiz state (test, questions, options)
- `attempt` - Attempt state (attemptId, participantToken, answers)
- `result` - Result state (score, maxScore, percentage, rank)

localStorage should only be used for temporary builder drafts where useful. Do not use localStorage as the authoritative database.
