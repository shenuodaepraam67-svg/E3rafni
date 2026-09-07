'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import Link from 'next/link'
import { api } from '@/lib/api'

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const setUser = useAuthStore((state) => state.setUser)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [referralCode, setReferralCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const ref = searchParams.get('ref')
    if (ref) {
      setReferralCode(ref)
    }
  }, [searchParams])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
            referral_code: referralCode || undefined,
          },
        },
      })

      if (error) throw error

      if (data.user) {
        setUser(data.user)

        // Handle referral attribution if visitor ID exists
        const visitorId = sessionStorage.getItem('e3rafni_visitor_id')
        if (visitorId) {
          try {
            await api.convertReferral(visitorId, data.user.id)
            sessionStorage.removeItem('e3rafni_visitor_id')
          } catch (refErr) {
            console.error('Failed to convert referral:', refErr)
            // Don't block registration if referral conversion fails
          }
        }

        router.push('/dashboard')
      }
    } catch (err: any) {
      console.error('Registration error:', err)
      if (err.message === 'User already registered') {
        setError('البريد الإلكتروني مستخدم بالفعل')
      } else if (err.message.includes('Password')) {
        setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
      } else {
        setError('حدث خطأ أثناء إنشاء الحساب. يرجى المحاولة مرة أخرى.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="text-2xl font-bold text-center mb-2">إنشاء حساب جديد</h1>
          <p className="text-gray-600 text-center">انضم إلى اعرفني وابدأ بإنشاء اختباراتك</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <Input
              label="الاسم المعروض"
              type="text"
              placeholder="أدخل اسمك"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              autoComplete="name"
            />
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
              autoComplete="new-password"
              minLength={6}
            />
            <Input
              label="كود الإحالة (اختياري)"
              type="text"
              placeholder="أدخل كود الإحالة"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              autoComplete="off"
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
              إنشاء الحساب
            </Button>
          </form>
          <div className="mt-4 text-center">
            <p className="text-gray-600">
              لديك حساب بالفعل؟{' '}
              <Link href="/login" className="text-blue-600 hover:underline font-medium">
                تسجيل الدخول
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50">جاري التحميل...</div>}>
      <RegisterForm />
    </Suspense>
  )
}
