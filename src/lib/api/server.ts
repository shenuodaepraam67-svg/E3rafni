// Server-side API calls for quiz data fetching
// Used in Server Components to fetch public quiz data without authentication

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

async function callEdgeFunctionServer(action: string, data: any) {
  const url = `${SUPABASE_URL}/functions/v1/quiz-api`
  
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Missing environment variables: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON_KEY
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/quiz-api`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ action, ...data }),
      cache: 'no-store' // Always fetch fresh quiz data
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`)
    }

    const result = await response.json()
    return result
  } catch (err: any) {
    console.error(`[SERVER API ERROR] in ${action}:`, err)
    throw err
  }
}

/**
 * Fetch quiz data by share code for server-side rendering
 * Returns public quiz data without sensitive information
 */
export async function getQuizByShareCodeServer(shareCode: string) {
  const data = await callEdgeFunctionServer('get_quiz_by_share_code', { share_code: shareCode })
  
  // Check if quiz exists and is active
  if (!data.test) {
    return null
  }

  if (data.test.status !== 'active') {
    return null
  }

  // Merge options into questions
  const questionsWithOptions = (data.questions || []).map((q: any) => ({
    ...q,
    options: (data.options || []).filter((o: any) => o.question_id === q.id)
  }))

  // Return public quiz data
  // Note: We do NOT include correct answers in the options
  // The client will receive options without is_correct field
  const publicQuestions = questionsWithOptions.map((q: any) => ({
    id: q.id,
    prompt: q.prompt,
    question_type: q.question_type,
    points: q.points,
    required: q.required,
    position: q.order || q.position, // Map order to position for store compatibility
    // Options without is_correct field to prevent cheating
    options: q.options.map((o: any) => ({
      id: o.id,
      option_text: o.option_text,
      position: o.order || o.position // Map order to position for store compatibility
    }))
  }))

  return {
    test: data.test,
    questions: publicQuestions
  }
}
