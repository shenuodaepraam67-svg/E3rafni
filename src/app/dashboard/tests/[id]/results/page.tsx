'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { api } from '@/lib/api'

export default function TestResultsPage() {
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
  const hardestQuestion = analytics?.hardest_question || null
  const easiestQuestion = analytics?.easiest_question || null
  
  // Get max_score from first participant or API response
  const maxScore = participants.length > 0 ? participants[0].max_score : 0
  
  const aggregateStats = {
    highestScore: analytics?.highest_percentage ? Math.round((analytics.highest_percentage / 100) * maxScore) : 0,
    highestPercentage: analytics?.highest_percentage || 0,
    averageScore: analytics?.average_percentage ? Math.round((analytics.average_percentage / 100) * maxScore) : 0,
    averagePercentage: analytics?.average_percentage || 0,
    lowestScore: analytics?.lowest_percentage ? Math.round((analytics.lowest_percentage / 100) * maxScore) : 0,
    lowestPercentage: analytics?.lowest_percentage || 0
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="secondary" className="mb-4">العودة للوحة التحكم</Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">نتائج الاختبار</h1>
          <p className="text-gray-600">نتائج المشاركين في الاختبار</p>
        </div>

        {/* Aggregate Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">أعلى نتيجة</p>
                <p className="text-3xl font-bold text-green-600">
                  {aggregateStats.highestPercentage > 0 ? `${aggregateStats.highestScore}/${maxScore}` : '—'}
                </p>
                <p className="text-lg text-gray-700">
                  {aggregateStats.highestPercentage > 0 ? `${aggregateStats.highestPercentage}%` : '—'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">متوسط النتائج</p>
                <p className="text-3xl font-bold text-blue-600">
                  {aggregateStats.averagePercentage > 0 ? `${aggregateStats.averageScore}/${maxScore}` : '—'}
                </p>
                <p className="text-lg text-gray-700">
                  {aggregateStats.averagePercentage > 0 ? `${aggregateStats.averagePercentage}%` : '—'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">أقل نتيجة</p>
                <p className="text-3xl font-bold text-red-600">
                  {aggregateStats.lowestPercentage > 0 ? `${aggregateStats.lowestScore}/${maxScore}` : '—'}
                </p>
                <p className="text-lg text-gray-700">
                  {aggregateStats.lowestPercentage > 0 ? `${aggregateStats.lowestPercentage}%` : '—'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Hardest and Easiest Questions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
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

        {/* Participants Leaderboard */}
        <Card>
          <CardHeader>
            <h3 className="text-xl font-bold text-gray-900">قائمة المشاركين</h3>
          </CardHeader>
          <CardContent>
            {participants.length === 0 ? (
              <p className="text-gray-600 text-center py-8">لا توجد نتائج حتى الآن</p>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-right py-3 px-4 font-semibold text-gray-900">الترتيب</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-900">اسم المشارك</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-900">النتيجة</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-900">النسبة</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-900">تاريخ الإرسال</th>
                      </tr>
                    </thead>
                    <tbody>
                      {participants.map((participant: any, index: number) => (
                        <tr key={participant.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                              index === 0 ? 'bg-yellow-100 text-yellow-800' :
                              index === 1 ? 'bg-gray-100 text-gray-800' :
                              index === 2 ? 'bg-orange-100 text-orange-800' :
                              'bg-gray-50 text-gray-600'
                            }`}>
                              {participant.rank || index + 1}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-medium text-gray-900">{participant.name || 'مجهول'}</td>
                          <td className="py-3 px-4 text-gray-700">{participant.score || 0}/{participant.max_score || 0}</td>
                          <td className="py-3 px-4">
                            <span className={`font-medium ${
                              (participant.percentage || 0) >= 80 ? 'text-green-600' :
                              (participant.percentage || 0) >= 60 ? 'text-blue-600' :
                              (participant.percentage || 0) >= 40 ? 'text-yellow-600' :
                              'text-red-600'
                            }`}>
                              {participant.percentage || 0}%
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {participant.submitted_at ? new Date(participant.submitted_at).toLocaleDateString('ar-EG') : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-4">
                  {participants.map((participant: any, index: number) => (
                    <div key={participant.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ml-3 ${
                            index === 0 ? 'bg-yellow-100 text-yellow-800' :
                            index === 1 ? 'bg-gray-100 text-gray-800' :
                            index === 2 ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-50 text-gray-600'
                          }`}>
                            {participant.rank || index + 1}
                          </span>
                          <span className="font-semibold text-gray-900">{participant.name || 'مجهول'}</span>
                        </div>
                        <span className={`font-bold ${
                          (participant.percentage || 0) >= 80 ? 'text-green-600' :
                          (participant.percentage || 0) >= 60 ? 'text-blue-600' :
                          (participant.percentage || 0) >= 40 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {participant.percentage || 0}%
                        </span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>النتيجة: {participant.score || 0}/{participant.max_score || 0}</span>
                        <span>{participant.submitted_at ? new Date(participant.submitted_at).toLocaleDateString('ar-EG') : '—'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
