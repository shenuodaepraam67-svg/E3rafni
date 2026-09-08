import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import Link from 'next/link'

export default function QuizNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              هذا الرابط غير صحيح
            </h2>
            <p className="text-gray-600 mb-6">
              الاختبار غير موجود أو تم إيقافه من قبل صاحبه. يرجى التحقق من الرابط والمحاولة مرة أخرى.
            </p>
          </div>
          <Link href="/">
            <Button className="w-full">
              العودة للرئيسية
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
