'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/Button'

export default function Navbar() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const setUser = useAuthStore((state) => state.setUser)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setLoading(false)
    }

    getUser()
  }, [])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      router.push('/')
    } catch (error) {
      console.error('[Navbar] Logout error:', error)
    }
  }

  const handleLoginClick = () => {
    router.push('/login?callbackUrl=/dashboard')
  }

  const handleRegisterClick = () => {
    router.push('/register?callbackUrl=/dashboard')
  }

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-blue-600">اعرفني</span>
          </Link>

          <div className="flex items-center space-x-4 space-x-reverse">
            {loading ? (
              <div className="animate-pulse h-8 w-24 bg-gray-200 rounded"></div>
            ) : user ? (
              <>
                <Link href="/dashboard">
                  <Button 
                    type="button"
                    variant="secondary"
                  >
                    لوحة التحكم
                  </Button>
                </Link>
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={handleLogout}
                >
                  تسجيل الخروج
                </Button>
              </>
            ) : (
              <>
                <Button 
                  type="button"
                  variant="secondary"
                  onClick={handleLoginClick}
                >
                  تسجيل الدخول
                </Button>
                <Button 
                  type="button"
                  variant="primary"
                  onClick={handleRegisterClick}
                >
                  إنشاء حساب
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
