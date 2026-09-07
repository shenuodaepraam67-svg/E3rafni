'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { AdPlaceholder } from '@/components/ui/AdPlaceholder'

function SuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [copied, setCopied] = useState(false)
  
  // Get share code from URL parameter
  const shareCode = searchParams.get('code')
  
  if (!shareCode) {
    router.push('/dashboard')
    return null
  }
  
  const shareLink = `${window.location.origin}/t/${shareCode}`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleWhatsAppShare = () => {
    const message = `قد إيه أنت تعرفني؟ جاوب على اختباري: ${shareLink}`
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <div className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h1 className="text-2xl font-bold mb-2">تم نشر الاختبار بنجاح!</h1>
              <p className="text-gray-600">إليك رابط المشاركة</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Share Link Display */}
              <div className="bg-gray-100 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">رابط الاختبار:</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={shareLink}
                    readOnly
                    className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    dir="ltr"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCopyLink}
                    className="whitespace-nowrap"
                  >
                    {copied ? 'تم النسخ!' : 'نسخ الرابط'}
                  </Button>
                </div>
              </div>

              {/* Share Buttons */}
              <div className="space-y-3">
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleWhatsAppShare}
                  className="w-full"
                >
                  مشاركة على واتساب
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCopyLink}
                  className="w-full"
                >
                  نسخ الرابط
                </Button>
              </div>

              {/* Ad Placement */}
              <AdPlaceholder placement="success_page" />

              {/* Dashboard Button */}
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard')}
                className="w-full"
              >
                الذهاب إلى لوحة التحكم
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">جاري التحميل...</div>}>
      <SuccessContent />
    </Suspense>
  )
}
