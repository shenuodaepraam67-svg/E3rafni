'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { api } from '@/lib/api'

export default function TestAnalyticsPage() {
  const params = useParams()
  const testId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [analytics, setAnalytics] = useState<any>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const analyticsData = await api.getTestAnalytics(testId)
        setAnalytics(analyticsData)
        setLoading(false)
      } catch (err: any) {
        setError(err.message || 'حدث خطأ أثناء تحميل البيانات')
        setLoading(false)
      }
    }

    loadData()
  }, [testId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Link href="/dashboard">
              <Button variant="secondary">العودة للوحة التحكم</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const participants = Array.isArray(analytics?.participants) ? analytics.participants : []
  const questionAnalytics = Array.isArray(analytics?.question_analytics) ? analytics.question_analytics : []
  const hardestQuestion = analytics?.hardest_question || null
  const easiestQuestion = analytics?.easiest_question || null
  const completedCount = Number(analytics?.completed ?? 0)

  // Calculate result distribution from real data
  const resultDistribution = [
    { level: 'ممتاز', percentage: 0, color: 'bg-green-500' },
    { level: 'جيد', percentage: 0, color: 'bg-blue-500' },
    { level: 'متوسط', percentage: 0, color: 'bg-yellow-500' },
    { level: 'ضعيف', percentage: 0, color: 'bg-red-500' }
  ]

  if (completedCount > 0 && participants.length > 0) {
    const percentages = participants.map((p: any) => p.percentage || 0)
    const excellent = percentages.filter((p: number) => p >= 80).length
    const good = percentages.filter((p: number) => p >= 60 && p < 80).length
    const average = percentages.filter((p: number) => p >= 40 && p < 60).length
    const poor = percentages.filter((p: number) => p < 40).length

    resultDistribution[0].percentage = Math.round((excellent / completedCount) * 100)
    resultDistribution[1].percentage = Math.round((good / completedCount) * 100)
    resultDistribution[2].percentage = Math.round((average / completedCount) * 100)
    resultDistribution[3].percentage = Math.round((poor / completedCount) * 100)
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="secondary" className="mb-4">العودة للوحة التحكم</Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">تحليلات الاختبار</h1>
          <p className="text-gray-600">تحليلات أداء الاختبار</p>
        </div>

        {/* Result Distribution */}
        <Card className="mb-8">
          <CardHeader>
            <h3 className="text-xl font-bold text-gray-900">توزيع النتائج</h3>
          </CardHeader>
          <CardContent>
            {completedCount === 0 ? (
              <p className="text-gray-600 text-center py-8">لا توجد نتائج حتى الآن</p>
            ) : (
              <div className="space-y-4">
                {resultDistribution.map((item) => (
                  <div key={item.level}>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium text-gray-900">{item.level}</span>
                      <span className="text-gray-600">{item.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div 
                        className={`${item.color} h-4 rounded-full transition-all duration-500`}
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Question Analytics */}
        <Card>
          <CardHeader>
            <h3 className="text-xl font-bold text-gray-900">معدل الإجابات الصحيحة لكل سؤال</h3>
          </CardHeader>
          <CardContent>
            {questionAnalytics.length === 0 ? (
              <p className="text-gray-600 text-center py-8">لا توجد بيانات كافية</p>
            ) : (
              <div className="space-y-4">
                {questionAnalytics.map((question: any) => (
                  <div key={question.id}>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium text-gray-900 flex-1 ml-4">{question.prompt}</span>
                      <span className={`font-bold ${
                        question.accuracy >= 80 ? 'text-green-600' :
                        question.accuracy >= 60 ? 'text-blue-600' :
                        question.accuracy >= 40 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {question.accuracy || 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all duration-500 ${
                          question.accuracy >= 80 ? 'bg-green-500' :
                          question.accuracy >= 60 ? 'bg-blue-500' :
                          question.accuracy >= 40 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${question.accuracy || 0}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Hardest and Easiest Questions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">أصعب سؤال</h3>
            </CardHeader>
            <CardContent>
              {hardestQuestion ? (
                <>
                  <p className="text-gray-700 mb-2">{hardestQuestion.prompt}</p>
                  <div className="flex items-center">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                      <div 
                        className="bg-red-500 h-2 rounded-full" 
                        style={{ width: `${hardestQuestion.accuracy}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700">{hardestQuestion.accuracy}% صحيحة</span>
                  </div>
                </>
              ) : (
                <p className="text-gray-700 mb-2">لا توجد بيانات كافية</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">أسهل سؤال</h3>
            </CardHeader>
            <CardContent>
              {easiestQuestion ? (
                <>
                  <p className="text-gray-700 mb-2">{easiestQuestion.prompt}</p>
                  <div className="flex items-center">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${easiestQuestion.accuracy}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700">{easiestQuestion.accuracy}% صحيحة</span>
                  </div>
                </>
              ) : (
                <p className="text-gray-700 mb-2">لا توجد بيانات كافية</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">أعلى معدل إجابة صحيحة</p>
                <p className="text-2xl font-bold text-green-600">
                  {analytics?.highest_percentage ? `${analytics.highest_percentage}%` : '—'}
                </p>
                <p className="text-sm text-gray-600 mt-1">{hardestQuestion ? hardestQuestion.prompt : 'لا توجد بيانات كافية'}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">متوسط معدل الإجابة الصحيحة</p>
                <p className="text-2xl font-bold text-blue-600">
                  {analytics?.average_percentage ? `${analytics.average_percentage}%` : '—'}
                </p>
                <p className="text-sm text-gray-600 mt-1">على جميع الأسئلة</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">أقل معدل إجابة صحيحة</p>
                <p className="text-2xl font-bold text-red-600">
                  {analytics?.lowest_percentage ? `${analytics.lowest_percentage}%` : '—'}
                </p>
                <p className="text-sm text-gray-600 mt-1">{easiestQuestion ? easiestQuestion.prompt : 'لا توجد بيانات كافية'}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
