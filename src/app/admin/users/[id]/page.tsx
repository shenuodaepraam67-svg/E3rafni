'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { api } from '@/lib/api'

export default function AdminUserDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string

  const [userDetails, setUserDetails] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadUserDetails()
  }, [userId])

  const loadUserDetails = async () => {
    try {
      setLoading(true)
      setError('')

      const data = await api.adminGetUserDetails(userId)
      setUserDetails(data)
    } catch (err: any) {
      console.error('[Admin User Details] Error:', err)
      if (err.message?.includes('Admin access required') || err.status === 403) {
        setError('ليس لديك صلاحية الوصول إلى هذه الصفحة')
      } else if (err.message?.includes('User not found') || err.status === 404) {
        setError('المستخدم غير موجود')
      } else {
        setError('حدث خطأ أثناء تحميل البيانات')
      }
    } finally {
      setLoading(false)
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadUserDetails()
  }, [userId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => router.push('/admin/users')}>العودة للمستخدمين</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const user = userDetails?.user
  const rewards = userDetails?.rewards
  const tests = userDetails?.tests || []
  const referralVisits = userDetails?.referral_visits || []

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button variant="secondary" onClick={() => router.push('/admin/users')}>
            ← العودة للمستخدمين
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">تفاصيل المستخدم</h1>
          <p className="text-gray-600">{user?.display_name || user?.username}</p>
        </div>

        {/* User Basic Info */}
        <Card className="mb-6">
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">المعلومات الأساسية</h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">الاسم</p>
                <p className="font-medium">{user?.display_name || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">اسم المستخدم</p>
                <p className="font-medium">{user?.username || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">البريد الإلكتروني</p>
                <p className="font-medium">{user?.email || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">كود الإحالة</p>
                <p className="font-medium font-mono">{user?.referral_code || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">تاريخ التسجيل</p>
                <p className="font-medium">{user?.created_at ? new Date(user.created_at).toLocaleDateString('ar-EG') : '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">الحالة</p>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  user?.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {user?.is_active ? 'نشط' : 'غير نشط'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Referral Rewards */}
        <Card className="mb-6">
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">مكافآت الإحالة</h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">الإحالات المؤهلة</p>
                <p className="text-2xl font-bold text-blue-600">{rewards?.qualified_referrals_count || 0}</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">الاختبارات المكتسبة</p>
                <p className="text-2xl font-bold text-green-600">{rewards?.earned_extra_tests || 0}</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">المكافأة اليدوية</p>
                <p className="text-2xl font-bold text-orange-600">{rewards?.manual_bonus_tests || 0}</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">الاختبارات المستخدمة</p>
                <p className="text-2xl font-bold text-purple-600">{rewards?.used_extra_tests || 0}</p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">الحد الأساسي</p>
                  <p className="font-bold">5</p>
                </div>
                <div>
                  <p className="text-gray-600">مكافأة الإحالة</p>
                  <p className="font-bold text-green-600">{rewards?.earned_extra_tests || 0}</p>
                </div>
                <div>
                  <p className="text-gray-600">المكافأة اليدوية</p>
                  <p className="font-bold text-orange-600">{rewards?.manual_bonus_tests || 0}</p>
                </div>
                <div>
                  <p className="text-gray-600">إجمالي المسموح</p>
                  <p className="font-bold text-blue-600">{5 + (rewards?.earned_extra_tests || 0) + (rewards?.manual_bonus_tests || 0)}</p>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">الاختبارات المتبقية:</span>
                  <span className="font-bold text-blue-600">{(rewards?.earned_extra_tests || 0) + (rewards?.manual_bonus_tests || 0) - (rewards?.used_extra_tests || 0)}</span>
                </div>
              </div>
            </div>
            {rewards?.last_calculated_at && (
              <p className="text-xs text-gray-500 mt-4 text-center">
                آخر تحديث: {new Date(rewards.last_calculated_at).toLocaleString('ar-EG')}
              </p>
            )}
          </CardContent>
        </Card>

        {/* User's Tests */}
        <Card className="mb-6">
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">اختبارات المستخدم</h2>
          </CardHeader>
          <CardContent>
            {tests.length === 0 ? (
              <p className="text-gray-500 text-center py-4">لا يوجد اختبارات</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">العنوان</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">الحالة</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">الأسئلة</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">المشاركين</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">الإكمالات</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">متوسط النتيجة</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">أعلى نتيجة</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">أقل نتيجة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tests.map((test: any) => (
                      <tr key={test.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm">{test.title}</td>
                        <td className="py-3 px-4 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            test.status === 'active' ? 'bg-green-100 text-green-800' :
                            test.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {test.status === 'active' ? 'نشط' : test.status === 'draft' ? 'مسودة' : test.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm">{test.total_questions || 0}</td>
                        <td className="py-3 px-4 text-sm">{test.participants || 0}</td>
                        <td className="py-3 px-4 text-sm">{test.completed || 0}</td>
                        <td className="py-3 px-4 text-sm">{test.average_score || 0}%</td>
                        <td className="py-3 px-4 text-sm">{test.highest_score || 0}%</td>
                        <td className="py-3 px-4 text-sm">{test.lowest_score || 0}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Referral Visits */}
        <Card className="mb-6">
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">زيارات الإحالة</h2>
          </CardHeader>
          <CardContent>
            {referralVisits.length === 0 ? (
              <p className="text-gray-500 text-center py-4">لا يوجد زيارات إحالة</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">أول زيارة</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">آخر زيارة</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">عدد الزيارات</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">المستخدم المحول</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {referralVisits.map((visit: any) => (
                      <tr key={visit.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm">
                          {new Date(visit.first_visit_at).toLocaleString('ar-EG')}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {new Date(visit.last_visit_at).toLocaleString('ar-EG')}
                        </td>
                        <td className="py-3 px-4 text-sm">{visit.visit_count}</td>
                        <td className="py-3 px-4 text-sm">
                          {visit.profiles ? (
                            <div>
                              <div>{visit.profiles.display_name || visit.profiles.username}</div>
                            </div>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {visit.is_qualified ? (
                            <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                              مؤهل
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                              غير مؤهل
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
