'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { useQuizBuilderStore } from '@/store/quizBuilderStore'

export default function CreatePage() {
  const router = useRouter()
  const { setTitle, setDescription, setTheme, reset } = useQuizBuilderStore()
  const [title, setTitleInput] = useState('')
  const [description, setDescriptionInput] = useState('')
  const [coverImageUrl, setCoverImageUrl] = useState('')
  const [error, setError] = useState('')

  const handleNext = () => {
    if (!title.trim()) {
      setError('عنوان الاختبار مطلوب')
      return
    }

    setError('')
    setTitle(title.trim())
    setDescription(description.trim())
    setTheme({ cover_image_url: coverImageUrl.trim() || null })
    
    router.push('/create/questions')
  }

  const handleBack = () => {
    reset()
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <h1 className="text-2xl font-bold text-center mb-2">إنشاء اختبار جديد</h1>
          <p className="text-gray-600 text-center">معلومات أساسية</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              label="عنوان الاختبار"
              placeholder="مثال: قد إيه أنت تعرفني؟"
              value={title}
              onChange={(e) => setTitleInput(e.target.value)}
              required
            />
            <Input
              label="وصف الاختبار"
              placeholder="وصف مختصر للاختبار"
              value={description}
              onChange={(e) => setDescriptionInput(e.target.value)}
            />
            <Input
              label="رابط صورة الغلاف (اختياري)"
              placeholder="https://example.com/image.jpg"
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
            />
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg" dir="rtl">
                {error}
              </div>
            )}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="flex-1"
              >
                إلغاء
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleNext}
                className="flex-1"
              >
                التالي
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
