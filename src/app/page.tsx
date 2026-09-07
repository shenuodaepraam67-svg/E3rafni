'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'
import { AdPlaceholder } from '@/components/ui/AdPlaceholder'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'

function HomeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const user = useAuthStore((state) => state.user)
  const [shareCode, setShareCode] = useState('')
  const [inputError, setInputError] = useState('')

  // Track referral visit if ref parameter exists
  useEffect(() => {
    const refCode = searchParams.get('ref')
    if (refCode && !user) {
      // Generate a visitor identifier (stored in sessionStorage for persistence)
      let visitorId = sessionStorage.getItem('e3rafni_visitor_id')
      if (!visitorId) {
        visitorId = crypto.randomUUID()
        sessionStorage.setItem('e3rafni_visitor_id', visitorId)
      }
      
      // Track the referral visit
      api.trackReferralVisit(refCode, visitorId).catch(err => {
        console.error('Failed to track referral visit:', err)
      })
    }
  }, [searchParams, user])

  const normalizeQuizInput = (input: string): string | null => {
    const raw = input.trim()

    if (!raw) {
      return null
    }

    // Reject overly long inputs (prevent injection attacks)
    if (raw.length > 200) {
      return null
    }

    let extractedCode = raw

    try {
      // If the user pasted a complete URL
      if (/^https?:\/\//i.test(raw)) {
        const url = new URL(raw)
        const match = url.pathname.match(/^\/t\/([^/]+)\/?$/i)

        if (match) {
          extractedCode = decodeURIComponent(match[1])
        } else {
          return null
        }
      } else {
        // If only the code was entered
        // Also support accidentally entering /t/CODE
        const match = raw.match(/^\/?t\/([^/]+)\/?$/i)

        if (match) {
          extractedCode = decodeURIComponent(match[1])
        }
      }
    } catch {
      return null
    }

    extractedCode = extractedCode.trim()

    // Validate the extracted code
    // Share codes should be alphanumeric, reasonable length
    if (!extractedCode || extractedCode.length > 50 || !/^[a-zA-Z0-9_-]+$/.test(extractedCode)) {
      return null
    }

    return extractedCode
  }

  const handleJoinQuiz = () => {
    setInputError('')

    const code = normalizeQuizInput(shareCode)

    if (!code) {
      setInputError('رابط الاختبار أو كود الاختبار غير صحيح')
      return
    }

    router.push(`/t/${encodeURIComponent(code)}`)
  }

  const handleCreateTest = () => {
    if (user) {
      router.push('/create')
    } else {
      router.push('/login?callbackUrl=/create')
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            قد إيه أنت تعرفني؟
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            اختبر أصحابك وشوف مين يعرفك أكتر من غيره
          </p>
          
          {/* Main CTA */}
          <div className="mb-12">
            <Button 
              type="button"
              variant="primary" 
              onClick={handleCreateTest}
              className="w-full sm:w-auto px-8 py-4 text-lg"
            >
              اعمل اختبار
            </Button>
          </div>
        </div>

        {/* Secondary Action - Join Quiz */}
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">جاوب على اختبار</h1>
              <div className="space-y-4">
                <Input
                  placeholder="أدخل كود الاختبار أو رابط الاختبار، مثال: Ab12Cd34"
                  value={shareCode}
                  onChange={(e) => {
                    setShareCode(e.target.value)
                    setInputError('')
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && handleJoinQuiz()}
                />
                {inputError && (
                  <p className="text-red-600 text-sm">{inputError}</p>
                )}
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleJoinQuiz}
                  className="w-full"
                  disabled={!shareCode.trim()}
                >
                  انضم للاختبار
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ad Placement */}
        <div className="mt-12">
          <AdPlaceholder placement="home_bottom" />
        </div>
      </div>
    </main>
  )
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">جاري التحميل...</div>}>
      <HomeContent />
    </Suspense>
  )
}
