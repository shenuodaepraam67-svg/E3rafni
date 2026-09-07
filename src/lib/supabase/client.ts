import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import { getSupabaseEnv } from './env'

let browserClient: SupabaseClient | null = null

/**
 * Single browser Supabase instance (matches @supabase/ssr singleton default).
 * WHY: Multiple instances race on cookie storage and cause stale session after logout.
 */
export function createClient(): SupabaseClient {
  if (browserClient) {
    return browserClient
  }

  const { url, anonKey } = getSupabaseEnv()
  browserClient = createBrowserClient(url, anonKey, { isSingleton: true })
  return browserClient
}

/** WHY: After logout, drop cached client so the next login does not reuse stale in-memory session. */
export function resetBrowserSupabaseClient(): void {
  browserClient = null
}

// Export as default for backward compatibility
export const supabase = createClient()
