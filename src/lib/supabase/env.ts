/**
 * Validates Supabase public env vars at runtime.
 */
export function getSupabaseEnv(): {
  url: string;
  anonKey: string;
} {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Add them to .env.local and restart the dev server."
    );
  }

  try {
    new URL(url);
  } catch {
    throw new Error(
      `NEXT_PUBLIC_SUPABASE_URL is malformed: "${url}". Expected https://<project-ref>.supabase.co`
    );
  }

  return { url, anonKey };
}

/**
 * Matches Supabase SSR cookie names for any project ref.
 */
export const SUPABASE_AUTH_COOKIE_PATTERN =
  /^sb-[a-z0-9-]+-auth-token(?:\.\d+|-code-verifier)?$/i;

export function isSupabaseAuthCookieName(name: string): boolean {
  return SUPABASE_AUTH_COOKIE_PATTERN.test(name);
}

/** True when the request carries Supabase auth cookies (avoids needless Auth API calls). */
export function hasSupabaseAuthCookies(
  cookies: { name: string }[]
): boolean {
  return cookies.some((cookie) => isSupabaseAuthCookieName(cookie.name));
}
