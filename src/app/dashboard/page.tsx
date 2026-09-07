'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { api } from '@/lib/api'

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [tests, setTests] = useState<any[]>([])
  const [referralData, setReferralData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [copiedTestId, setCopiedTestId] = useState<string | null>(null)
  const [deleteTestId, setDeleteTestId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const handleCopyLink = async (link: string, testId?: string) => {
    try {
      await navigator.clipboard.writeText(link)
      if (testId) {
        setCopiedTestId(testId)
        setTimeout(() => setCopiedTestId(null), 2000)
      } else {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleShare = async (link: string, title: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          url: link
        })
      } catch (err) {
        console.error('Share failed:', err)
        await handleCopyLink(link)
      }
    } else {
      await handleCopyLink(link)
    }
  }

  const handleDeleteTest = async () => {
    if (!deleteTestId) return

    setIsDeleting(true)
    setError('')

    try {
      await api.deleteTest(deleteTestId)

      // Remove test from list
      setTests(tests.filter(t => t.id !== deleteTestId))

      // Reload stats
      const statsData = await api.getDashboardStats()
      setStats(statsData)

      setSuccessMessage('تم حذف الاختبار بنجاح')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err: any) {
      setError(`فشل حذف الاختبار: ${err.message || 'حدث خطأ'}`)
    } finally {
      setIsDeleting(false)
      setDeleteTestId(null)
    }
  }

  const loadDashboardData = async () => {
    try {
      const [statsData, testsData, referralCodeData] = await Promise.all([
        api.getDashboardStats(),
        api.getTests(),
        api.getReferralCode()
      ])
      setStats(statsData)
      setTests(testsData.tests || [])
      setReferralData(referralCodeData)
      setError('')
      setLoading(false)
    } catch (err: any) {
      setError(`فشل تحميل البيانات: ${err.message || 'حدث خطأ في الاتصال بالسيرفر'}`)
      setLoading(false)
    }
  }

  const handleCopyReferralLink = async () => {
    if (referralData?.referral_code) {
      const referralLink = `${window.location.origin}/register?ref=${referralData.referral_code}`
      try {
        await navigator.clipboard.writeText(referralLink)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        console.error('Failed to copy:', err)
      }
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">لوحة التحكم</h1>
          <p className="text-gray-600">مرحباً بك في لوحة التحكم</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4" dir="rtl">
            <p className="text-red-700 mb-3">{error}</p>
            <Button
              type="button"
              variant="outline"
              onClick={loadDashboardData}
              className="text-sm"
            >
              إعادة المحاولة
            </Button>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-4" dir="rtl">
            <p className="text-green-700">{successMessage}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Stats Cards */}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">إجمالي الاختبارات</p>
                    <p className="text-3xl font-bold text-gray-900">{stats?.total_tests || 0}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">إجمالي المشاركين</p>
                    <p className="text-3xl font-bold text-gray-900">{stats?.total_participants || 0}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">إجمالي الإجابات</p>
                    <p className="text-3xl font-bold text-gray-900">{stats?.total_answers || 0}</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">متوسط نسبة المعرفة</p>
                    <p className="text-3xl font-bold text-gray-900">{stats?.average_percentage || 0}%</p>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-full">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Referral Section */}
        {!loading && !error && referralData && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">دعوة أصدقاء</h2>
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Referral Link */}
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600 mb-2">رابط الإحالة الخاص بك</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 rounded-lg px-4 py-2 text-sm break-all">
                        {referralData.referral_code ? `${window.location.origin}/register?ref=${referralData.referral_code}` : 'جاري التحميل...'}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleCopyReferralLink()}
                        disabled={!referralData.referral_code}
                      >
                        {copied ? 'تم النسخ!' : 'نسخ'}
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => handleShare(`${window.location.origin}/register?ref=${referralData.referral_code}`, 'رابط الإحالة')}
                        disabled={!referralData.referral_code}
                      >
                        مشاركة
                      </Button>
                    </div>
                  </div>

                  {/* Qualified Referrals */}
                  <div>
                    <p className="text-sm text-gray-600 mb-1">الإحالات المؤهلة</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {referralData.qualified_referrals_count || 0}
                    </p>
                  </div>

                  {/* Earned Extra Tests */}
                  <div>
                    <p className="text-sm text-gray-600 mb-1">الاختبارات المكتسبة</p>
                    <p className="text-3xl font-bold text-green-600">
                      +{referralData.earned_extra_tests || 0}
                    </p>
                  </div>
                </div>

                {/* Test Limit Info */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">الحد الأساسي:</span>
                      <span className="font-medium">{referralData.base_test_limit || 5}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">المكافآت اليدوية:</span>
                      <span className="font-medium">+{referralData.manual_bonus_tests || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">إجمالي المسموح:</span>
                      <span className="font-bold text-blue-600">
                        {referralData.total_test_limit || 5}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">المستخدم:</span>
                      <span className="font-medium">{stats?.total_tests || 0}</span>
                    </div>
                    <div className="flex justify-between md:col-span-2">
                      <span className="text-gray-600">المتبقي:</span>
                      <span className={`font-bold ${referralData.remaining_tests > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {referralData.remaining_tests || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* My Tests Section */}
        {!loading && !error && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">اختباراتي</h2>
              <Link href="/create">
                <Button
                  type="button"
                  variant="primary"
                >
                  إنشاء اختبار جديد
                </Button>
              </Link>
            </div>

            {tests.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-gray-600 mb-4">لا توجد اختبارات حتى الآن</p>
                  <Link href="/create">
                    <Button type="button" variant="primary">
                      إنشاء أول اختبار
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tests.map((test: any) => (
                <Card key={test.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{test.title}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        test.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {test.status === 'active' ? 'نشط' : test.status}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">المشاركين:</span>
                        <span className="font-medium text-gray-900">{test.attempt_count || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">المكتمل:</span>
                        <span className="font-medium text-gray-900">{test.completed_count || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">الأسئلة:</span>
                        <span className="font-medium text-gray-900">{test.total_questions || 0}</span>
                      </div>
                    </div>
                    {test.share_code && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-600 mb-2">رابط الامتحان:</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-white rounded px-2 py-1 text-xs break-all">
                            {`${window.location.origin}/t/${test.share_code}`}
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleCopyLink(`${window.location.origin}/t/${test.share_code}`, test.id)}
                          >
                            {copiedTestId === test.id ? 'تم!' : 'نسخ'}
                          </Button>
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => handleShare(`${window.location.origin}/t/${test.share_code}`, test.title)}
                          >
                            مشاركة
                          </Button>
                        </div>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                      <Link href={`/dashboard/tests/${test.id}/results`}>
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1 text-sm"
                        >
                          النتائج
                        </Button>
                      </Link>
                      <Link href={`/dashboard/tests/${test.id}/analytics`}>
                        <Button
                          type="button"
                          variant="secondary"
                          className="flex-1 text-sm"
                        >
                          التحليلات
                        </Button>
                      </Link>
                      <Button
                        type="button"
                        variant="outline"
                        className="text-red-600 hover:text-red-700 hover:border-red-300 text-sm"
                        onClick={() => setDeleteTestId(test.id)}
                      >
                        حذف
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              </div>
            )}
          </div>
        )}

        {/* Share Site Section */}
        {!loading && !error && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">شارك موقع اعرفني</h2>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-100 rounded-lg px-4 py-2">
                    {window.location.origin}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleCopyLink(window.location.origin)}
                  >
                    {copied ? 'تم النسخ!' : 'نسخ رابط الموقع'}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => handleShare(window.location.origin, 'موقع اعرفني')}
                  >
                    مشاركة الموقع
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        {deleteTestId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4" dir="rtl">
              <h3 className="text-xl font-bold mb-4">تأكيد حذف الاختبار</h3>
              <p className="text-gray-600 mb-6">
                هل أنت متأكد من حذف هذا الاختبار؟
                <br />
                سيتم إخفاؤه من اختباراتك ولن يكون متاحًا للمشاركة.
              </p>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDeleteTestId(null)}
                  className="flex-1"
                >
                  إلغاء
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleDeleteTest}
                  isLoading={isDeleting}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  حذف
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
