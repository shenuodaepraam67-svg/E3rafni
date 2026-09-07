// API Layer - Centralized API calls to quiz-api Edge Function Version 3
// All sensitive operations must go through this layer
// NO direct Supabase table writes for sensitive data

import { supabase } from '@/lib/supabase/client'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

async function getAccessToken() {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) throw error
  return session?.access_token ?? null
}

async function callEdgeFunction(action: string, data: any, requireAuth = false) {
  const url = `${SUPABASE_URL}/functions/v1/quiz-api`
  
  // Check if environment variables are set
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    const error = new Error('Missing environment variables: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
    console.error('[API ERROR]', error.message)
    throw error
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON_KEY
  }

  let hasToken = false

  // For creator operations, use the user's auth token
  if (requireAuth) {
    const accessToken = await getAccessToken()
    if (!accessToken) {
      throw new Error('Authentication required')
    }
    headers['Authorization'] = `Bearer ${accessToken}`
    hasToken = true
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/quiz-api`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ action, ...data })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`)
    }

    const result = await response.json()
    return result
  } catch (err: any) {
    console.error(`[API FETCH ERROR] in ${action}:`, err)
    throw err
  }
}

export const api = {
  // Creator Test operations (require auth)
  createTest: async (title: string, description: string, theme?: any) => {
    return callEdgeFunction('create_test', { title, description, theme }, true)
  },
  
  createQuestion: async (testId: string, question: any) => {
    return callEdgeFunction('create_question', { test_id: testId, question }, true)
  },
  
  publishTest: async (testId: string) => {
    return callEdgeFunction('publish_test', { test_id: testId }, true)
  },

  deleteTest: async (testId: string) => {
    return callEdgeFunction('delete_test', { test_id: testId }, true)
  },
  
  getTests: async () => {
    return callEdgeFunction('get_tests', {}, true)
  },
  
  getDashboardStats: async () => {
    return callEdgeFunction('get_dashboard_stats', {}, true)
  },
  
  getTestAnalytics: async (testId: string) => {
    return callEdgeFunction('get_test_analytics', { test_id: testId }, true)
  },
  
  // Participant operations (no auth required, use participant_token)
  getQuizByShareCode: async (shareCode: string) => {
    return callEdgeFunction('get_quiz_by_share_code', { share_code: shareCode }, false)
  },
  
  startAttempt: async (shareCode: string, participantName: string) => {
    return callEdgeFunction('start_attempt', { share_code: shareCode, participant_name: participantName }, false)
  },
  
  saveAnswer: async (attemptId: string, questionId: string, answer: any, participantToken: string) => {
    return callEdgeFunction('save_answer', { 
      attempt_id: attemptId, 
      question_id: questionId, 
      answer,
      participant_token: participantToken 
    }, false)
  },
  
  submitQuiz: async (attemptId: string, participantToken: string) => {
    return callEdgeFunction('submit', { 
      attempt_id: attemptId, 
      participant_token: participantToken 
    }, false)
  },
  
  getAttemptResult: async (attemptId: string, participantToken: string) => {
    return callEdgeFunction('result', { 
      attempt_id: attemptId, 
      participant_token: participantToken 
    }, false)
  },

  // Admin operations (require admin role)
  adminGetStats: async () => {
    return callEdgeFunction('admin_get_stats', {}, true)
  },

  adminGetUsers: async (params: { search?: string; sort_by?: string; sort_order?: 'asc' | 'desc'; limit?: number; offset?: number }) => {
    return callEdgeFunction('admin_get_users', params, true)
  },

  adminGetUserDetails: async (userId: string) => {
    return callEdgeFunction('admin_get_user_details', { user_id: userId }, true)
  },

  adminGetRewardSettings: async () => {
    return callEdgeFunction('admin_get_reward_settings', {}, true)
  },

  adminUpdateRewardSettings: async (params: { milestones: Array<{ referrals: number; extra_tests: number }>; base_test_limit: number }) => {
    return callEdgeFunction('admin_update_reward_settings', params, true)
  },

  adminAddManualBonus: async (userId: string, bonusAmount: number) => {
    return callEdgeFunction('admin_add_manual_bonus', { user_id: userId, bonus_amount: bonusAmount }, true)
  },

  adminRemoveManualBonus: async (userId: string, bonusAmount: number) => {
    return callEdgeFunction('admin_remove_manual_bonus', { user_id: userId, bonus_amount: bonusAmount }, true)
  },

  adminUpdateUser: async (userId: string, params: { display_name?: string; username?: string }) => {
    return callEdgeFunction('admin_update_user', { user_id: userId, ...params }, true)
  },

  adminDeleteTest: async (testId: string) => {
    return callEdgeFunction('admin_delete_test', { test_id: testId }, true)
  },

  adminDeleteUser: async (userId: string) => {
    return callEdgeFunction('admin_delete_user', { user_id: userId }, true)
  },

  // Referral operations
  trackReferralVisit: async (referralCode: string, visitorIdentifier: string) => {
    return callEdgeFunction('track_referral_visit', { referral_code: referralCode, visitor_identifier: visitorIdentifier }, false)
  },

  convertReferral: async (visitorIdentifier: string, userId: string) => {
    return callEdgeFunction('convert_referral', { visitor_identifier: visitorIdentifier, user_id: userId }, true)
  },

  getReferralCode: async () => {
    return callEdgeFunction('get_referral_code', {}, true)
  }
}
