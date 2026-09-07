import { createServerClient as createSupabaseSSRClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getSupabaseEnv } from './env'

type CookieToSet = {
  name: string
  value: string
  options: CookieOptions
}

export async function createServerClient() {
  const cookieStore = await cookies()
  const { url, anonKey } = getSupabaseEnv()

  return createSupabaseSSRClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet: CookieToSet[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch {
          // setAll may be called from a Server Component where cookies
          // cannot be mutated; safe to ignore when middleware refreshes sessions.
        }
      },
    },
  })
}
