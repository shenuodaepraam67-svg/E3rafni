import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { getSupabaseEnv, hasSupabaseAuthCookies } from '@/lib/supabase/env'

type CookieToSet = {
  name: string
  value: string
  options: CookieOptions
}

const protectedRoutes = ['/dashboard']
const authRoutes = ['/', '/login', '/register', '/reset-password']
const publicRoutes = ['/t']

function isProtectedPath(pathname: string): boolean {
  return protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )
}

function isAuthPath(pathname: string): boolean {
  return authRoutes.includes(pathname)
}

function isPublicPath(pathname: string): boolean {
  return publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )
}

/**
 * WHY: Copying only name/value drops httpOnly/secure/sameSite and breaks Supabase session cookies on redirect.
 */
function copyCookies(source: NextResponse, target: NextResponse): void {
  source.cookies.getAll().forEach((cookie) => {
    target.cookies.set({
      name: cookie.name,
      value: cookie.value,
      path: cookie.path,
      domain: cookie.domain,
      maxAge: cookie.maxAge,
      expires: cookie.expires,
      httpOnly: cookie.httpOnly,
      secure: cookie.secure,
      sameSite: cookie.sameSite,
    })
  })
}

function isNetworkAuthError(message: string | undefined): boolean {
  if (!message) return false
  const normalized = message.toLowerCase()
  return (
    normalized.includes('fetch failed') ||
    normalized.includes('failed to fetch') ||
    normalized.includes('network')
  )
}

/**
 * Resolves the current user for route guards.
 * WHY: Edge middleware often logs "fetch failed" on getUser(); fall back to cookie session so
 * a valid login is not treated as logged out.
 */
async function resolveMiddlewareUser(
  supabase: ReturnType<typeof createServerClient>
): Promise<{ id: string } | null> {
  const {
    data: { user },
    error: getUserError,
  } = await supabase.auth.getUser()

  if (user) {
    return user
  }

  if (getUserError && isNetworkAuthError(getUserError.message)) {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    return session?.user ?? null
  }

  return null
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  let supabaseResponse = NextResponse.next({ request })

  const { url, anonKey } = getSupabaseEnv()

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value)
        })
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options)
        })
      },
    },
  })

  let user: { id: string } | null = null

  // WHY: Skip Auth API when there is no session cookie (stops fetch-failed noise on /login for guests)
  if (hasSupabaseAuthCookies(request.cookies.getAll())) {
    user = await resolveMiddlewareUser(supabase)
  }

  if (!user && isProtectedPath(pathname)) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('next', pathname)
    const redirectResponse = NextResponse.redirect(loginUrl)
    copyCookies(supabaseResponse, redirectResponse)
    return redirectResponse
  }

  if (user && isAuthPath(pathname) && !isPublicPath(pathname)) {
    const dashboardUrl = request.nextUrl.clone()
    dashboardUrl.pathname = '/dashboard'
    const redirectResponse = NextResponse.redirect(dashboardUrl)
    copyCookies(supabaseResponse, redirectResponse)
    return redirectResponse
  }

  // Leader dashboard - require admin session (not Supabase auth)
  if (pathname === '/dashboard/leader' || pathname === '/dashboard/leader/login') {
    // Allow access to login page
    if (pathname === '/dashboard/leader/login') {
      return supabaseResponse
    }

    // Check admin session cookie
    const adminSession = request.cookies.get('admin_session')
    if (!adminSession || adminSession.value !== 'authenticated') {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/dashboard/leader/login'
      const redirectResponse = NextResponse.redirect(loginUrl)
      copyCookies(supabaseResponse, redirectResponse)
      return redirectResponse
    }

    return supabaseResponse
  }

  // Admin routes - require admin role
  if (pathname.startsWith('/admin')) {
    if (!user) {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/login'
      loginUrl.searchParams.set('next', pathname)
      const redirectResponse = NextResponse.redirect(loginUrl)
      copyCookies(supabaseResponse, redirectResponse)
      return redirectResponse
    }

    // Check admin role and active status
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, is_active')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin' || !profile.is_active) {
      return new NextResponse('Not Found', { status: 404 })
    }

    return supabaseResponse
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
