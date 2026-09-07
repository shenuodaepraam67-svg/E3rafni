'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="text-2xl font-bold text-center mb-2">حدث خطأ</h1>
          <p className="text-gray-600 text-center">حدث خطأ غير متوقع</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600 text-center">
              {error.message || 'حدث خطأ أثناء تحميل الصفحة'}
            </p>
            <Button
              variant="primary"
              onClick={reset}
              className="w-full"
            >
              إعادة المحاولة
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
