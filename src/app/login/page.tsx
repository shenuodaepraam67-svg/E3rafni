'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Head from 'next/head'
import { supabase } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import Link from 'next/link'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const setUser = useAuthStore((state) => state.setUser)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        setUser(data.user)
        // Check for callbackUrl in URL parameters
        const callbackUrl = searchParams.get('callbackUrl')
        router.push(callbackUrl || '/dashboard')
      }
    } catch (err: any) {
      console.error('Login error:', err)
      if (err.message === 'Invalid login credentials') {
        setError('البريد الإلكتروني أو كلمة المرور غير صحيحة')
      } else if (err.message === 'Email not confirmed') {
        setError('يرجى تأكيد بريدك الإلكتروني أولاً عبر الرابط المرسل لك، أو تواصل مع الدعم.')
      } else {
        setError('حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!email) {
      setError('أدخل بريدك الإلكتروني أولاً')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) throw error

      setError('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني')
    } catch (err: any) {
      console.error('Reset password error:', err)
      setError('حدث خطأ أثناء إرسال رابط إعادة التعيين. يرجى المحاولة مرة أخرى.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Head>
        <meta name="robots" content="noindex,follow" />
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <h1 className="text-2xl font-bold text-center mb-2">تسجيل الدخول</h1>
            <p className="text-gray-600 text-center">أهلاً بك مجدداً في اعرفني</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                label="البريد الإلكتروني"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
              <Input
                label="كلمة المرور"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg" dir="rtl">
                  {error}
                </div>
              )}
              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                className="w-full"
              >
                تسجيل الدخول
              </Button>
            </form>
            <div className="mt-4 text-center space-y-2">
              <p className="text-gray-600">
                ليس لديك حساب؟{' '}
                <Link href="/register" className="text-blue-600 hover:underline font-medium">
                  إنشاء حساب جديد
                </Link>
              </p>
              <p>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-gray-500 hover:text-blue-600"
                >
                  نسيت كلمة المرور؟
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">جاري التحميل...</div>}>
      <LoginContent />
    </Suspense>
  )
}
