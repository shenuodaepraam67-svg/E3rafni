'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { useQuizBuilderStore } from '@/store/quizBuilderStore'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'

export default function ReviewPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { title, description, questions, theme, reset } = useQuizBuilderStore()
  const { user } = useAuthStore()
  const [isPublishing, setIsPublishing] = useState(false)
  const [error, setError] = useState('')
  const [autoPublish, setAutoPublish] = useState(false)

  useEffect(() => {
    // Check if user was redirected here after login for auto-publish
    if (searchParams.get('auto_publish') === 'true') {
      setAutoPublish(true)
    }
  }, [searchParams])

  const handlePublish = useCallback(async () => {
    // Check authentication
    if (!user) {
      // Store current URL to return after login
      const returnUrl = encodeURIComponent(window.location.pathname + '?auto_publish=true')
      router.push(`/login?callbackUrl=${returnUrl}`)
      return
    }

    setIsPublishing(true)
    setError('')

    try {
      // Step 1: Create the test
      const createdTest = await api.createTest(title, description, theme)

      console.log('[Publish] create_test response:', createdTest)

      const testId =
        createdTest?.id ??
        createdTest?.test?.id ??
        null

      console.log('[Publish] resolved testId:', testId)

      if (!testId) {
        console.error('[Publish] create_test returned:', createdTest)
        throw new Error('Failed to create test: No test ID returned')
      }

      // Step 2: Add questions to the test
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i]

        const questionPayload = {
          question_type: 'multiple_choice',
          prompt: question.prompt,
          position: i + 1,
          required: question.required !== false,
          points: question.points ?? 1,
          options: question.options || [],
        }

        console.log('[Publish] creating question:', questionPayload)

        await api.createQuestion(testId, questionPayload)
      }

      // Step 3: Publish the test
      const publishResponse = await api.publishTest(testId)
      const shareCode = publishResponse.share_code

      if (!shareCode) {
        throw new Error('Failed to publish test: No share code returned')
      }

      // Clear the store after successful publish
      reset()

      // Redirect to success page with share code
      router.push(`/create/success?code=${shareCode}`)
    } catch (err: any) {
      console.error('[Publish] Error:', err)
      setError(err.message || 'حدث خطأ أثناء نشر الاختبار. يرجى المحاولة مرة أخرى.')
    } finally {
      setIsPublishing(false)
    }
  }, [user, title, description, theme, questions, reset, router])

  useEffect(() => {
    // Auto-publish if flag is set and user is authenticated
    if (autoPublish && user && !isPublishing) {
      handlePublish()
    }
  }, [autoPublish, user, isPublishing, handlePublish])

  const handleEdit = (section: string) => {
    switch (section) {
      case 'basic':
        router.push('/create')
        break
      case 'questions':
        router.push('/create/questions')
        break
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <h1 className="text-2xl font-bold text-center mb-2">مراجعة الاختبار قبل النشر</h1>
            <p className="text-gray-600 text-center">تأكد من جميع المعلومات قبل النشر</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-lg font-semibold">معلومات أساسية</h2>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleEdit('basic')}
                    className="text-sm px-3 py-1"
                  >
                    تعديل
                  </Button>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-600">العنوان:</span>
                    <p className="font-medium">{title || 'غير محدد'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">الوصف:</span>
                    <p className="font-medium">{description || 'غير محدد'}</p>
                  </div>
                  {theme?.cover_image_url && (
                    <div>
                      <span className="text-sm text-gray-600">صورة الغلاف:</span>
                      <p className="font-medium text-sm break-all">{theme.cover_image_url}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Questions Summary */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-lg font-semibold">الأسئلة ({questions.length})</h2>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleEdit('questions')}
                    className="text-sm px-3 py-1"
                  >
                    تعديل
                  </Button>
                </div>
                <div className="space-y-3">
                  {questions.map((question, index) => (
                    <div key={question.id} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          {index + 1}
                        </span>
                        <span className="text-sm text-gray-600">
                          {question.question_type === 'multiple_choice' ? 'اختيار من متعدد' : 'مقال'}
                        </span>
                        <span className="text-sm text-gray-600">
                          {question.points} نقطة
                        </span>
                        {question.required && (
                          <span className="text-sm text-red-600">مطلوب</span>
                        )}
                      </div>
                      <p className="font-medium text-sm">{question.prompt}</p>
                      {question.question_type === 'multiple_choice' && question.options && (
                        <div className="mt-2 text-sm text-gray-600">
                          <p className="text-xs text-gray-500 mb-1">الخيارات:</p>
                          <ul className="space-y-1">
                            {question.options.map((option) => (
                              <li key={option.id} className="flex items-center gap-2">
                                {option.is_correct && <span className="text-green-600">✓</span>}
                                <span className={option.is_correct ? 'font-medium' : ''}>
                                  {option.option_text}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg" dir="rtl">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/create/questions')}
                  className="flex-1"
                >
                  السابق
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={handlePublish}
                  isLoading={isPublishing}
                  className="flex-1"
                >
                  نشر الاختبار
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
