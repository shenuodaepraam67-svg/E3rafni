'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const ADMIN_SESSION_COOKIE = 'admin_session'
const ADMIN_SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export async function adminLogin(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const adminEmail = process.env.ADMIN_LOGIN_EMAIL
  const adminPassword = process.env.ADMIN_LOGIN_PASSWORD

  if (!adminEmail || !adminPassword) {
    return { error: 'Admin credentials not configured' }
  }

  if (email !== adminEmail || password !== adminPassword) {
    return { error: 'Invalid credentials' }
  }

  // Create secure HTTP-only cookie
  const cookieStore = await cookies()
  cookieStore.set(ADMIN_SESSION_COOKIE, 'authenticated', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: ADMIN_SESSION_MAX_AGE,
  })

  redirect('/dashboard/leader')
}

export async function adminLogout() {
  const cookieStore = await cookies()
  cookieStore.delete(ADMIN_SESSION_COOKIE)
  redirect('/dashboard/leader/login')
}

export async function getAdminSession() {
  const cookieStore = await cookies()
  const session = cookieStore.get(ADMIN_SESSION_COOKIE)
  return session?.value === 'authenticated'
}
