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
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setLoading(false)
    }

    getUser()
  }, [])

  const handleLogout = async () => {
    if (isLoggingOut) return
    
    setIsLoggingOut(true)
    try {
      await supabase.auth.signOut()
      setUser(null)
      router.push('/')
    } catch (error) {
      console.error('[Navbar] Logout error:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  const handleLoginClick = () => {
    router.push('/login?callbackUrl=/dashboard')
    setIsMenuOpen(false)
  }

  const handleRegisterClick = () => {
    router.push('/register?callbackUrl=/dashboard')
    setIsMenuOpen(false)
  }

  const handleLinkClick = () => {
    setIsMenuOpen(false)
  }

  const navLinks = [
    { href: '/', label: 'الرئيسية' },
    { href: '/about', label: 'عن الموقع' },
    { href: '/contact', label: 'اتصل بنا' },
    { href: '/privacy-policy', label: 'سياسة الخصوصية' },
    { href: '/terms', label: 'الشروط والأحكام' },
  ]

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-blue-600">اعرفني</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 space-x-reverse">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-4 space-x-reverse">
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
                  isLoading={isLoggingOut}
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

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className="sr-only">{isMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}</span>
            {isMenuOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 pt-2 pb-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                onClick={handleLinkClick}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="px-4 pt-2 pb-4 border-t border-gray-200">
            {loading ? (
              <div className="animate-pulse h-8 w-24 bg-gray-200 rounded"></div>
            ) : user ? (
              <div className="space-y-2">
                <Link
                  href="/dashboard"
                  className="block w-full text-center"
                  onClick={handleLinkClick}
                >
                  <Button 
                    type="button"
                    variant="secondary"
                    className="w-full"
                  >
                    لوحة التحكم
                  </Button>
                </Link>
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={handleLogout}
                  isLoading={isLoggingOut}
                  className="w-full"
                >
                  تسجيل الخروج
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Button 
                  type="button"
                  variant="secondary"
                  onClick={handleLoginClick}
                  className="w-full"
                >
                  تسجيل الدخول
                </Button>
                <Button 
                  type="button"
                  variant="primary"
                  onClick={handleRegisterClick}
                  className="w-full"
                >
                  إنشاء حساب
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
