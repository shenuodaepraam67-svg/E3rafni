# Development Phases

Execute in this exact order:

## PHASE 1: Inspect Supabase and Initialize Project
- Inspect existing Supabase project
- Inspect database schema
- Inspect Edge Functions
- Inspect RLS policies
- Generate typed API/database types
- Configure Supabase client

## PHASE 2: Project Setup and Global UI
- Project setup (Next.js, Tailwind, dependencies)
- Routing structure
- Supabase client configuration
- Authentication system
- Global UI components
- Layout and navigation

## PHASE 3: Homepage and Authentication
- Homepage landing page
- Login page
- Register page
- Authentication flows
- Error handling for auth

## PHASE 4: Quiz Builder
- Create Test wizard
- Questions Builder (MCQ/Essay)
- Question editing and validation
- Question reordering
- Review step
- Publish flow
- Validation before publishing

## PHASE 5: Share and Distribution
- Share page after publishing
- WhatsApp integration
- Copy link functionality
- Success page

## PHASE 6: Public Quiz Experience
- Public quiz page (/t/[shareCode])
- Start Attempt flow
- Answer saving (MCQ/Essay)
- Quiz submission
- Result page
- Result level display

## PHASE 7: Dashboard and Analytics
- Dashboard main page
- Tests list and management
- Test results view
- Test analytics
- Notifications system

## PHASE 8: Additional Features
- Achievements system
- User settings
- Reports system
- Ad placements integration

## PHASE 9: Testing and Production
- Security audit
- RLS testing
- API testing
- Mobile testing
- Production build
- Performance optimization
- Error handling verification

## Critical Rules
- Do not skip backend inspection
- Do not invent backend behavior
- Do not expose protected data
- Do not duplicate server-side business logic in the frontend
- Follow exact phase order
- Complete each phase before moving to the next
