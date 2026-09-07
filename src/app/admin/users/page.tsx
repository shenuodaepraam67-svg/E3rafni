'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { api } from '@/lib/api'

export default function AdminUsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(0)
  const limit = 50

  useEffect(() => {
    loadData()
  }, [search, sortBy, sortOrder, page])

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')

      // Load stats
      const statsData = await api.adminGetStats()
      setStats(statsData)

      // Load users
      const usersData = await api.adminGetUsers({
        search,
        sort_by: sortBy,
        sort_order: sortOrder,
        limit,
        offset: page * limit
      })

      setUsers(usersData.users || [])
    } catch (err: any) {
      console.error('[Admin Users] Error:', err)
      if (err.message?.includes('Admin access required') || err.status === 403) {
        setError('ليس لديك صلاحية الوصول إلى هذه الصفحة')
      } else {
        setError('حدث خطأ أثناء تحميل البيانات')
      }
    } finally {
      setLoading(false)
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadData()
  }, [search, sortBy, sortOrder, page])

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

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
            <Button onClick={() => router.push('/')}>العودة للرئيسية</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة المستخدمين</h1>
          <p className="text-gray-600">عرض وإدارة جميع المستخدمين المسجلين</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-gray-600 mb-1">إجمالي المستخدمين</p>
                <p className="text-3xl font-bold text-blue-600">{stats.total_users}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-gray-600 mb-1">إجمالي الاختبارات</p>
                <p className="text-3xl font-bold text-green-600">{stats.total_tests}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-gray-600 mb-1">إجمالي المشاركين</p>
                <p className="text-3xl font-bold text-purple-600">{stats.total_participants}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-gray-600 mb-1">الاكمالات</p>
                <p className="text-3xl font-bold text-orange-600">{stats.total_completed}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-gray-600 mb-1">المستخدمون النشطون</p>
                <p className="text-3xl font-bold text-teal-600">{stats.active_users}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <Input
              placeholder="بحث بالاسم أو اسم المستخدم..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(0)
              }}
            />
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">المستخدمون</h2>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50" onClick={() => handleSort('display_name')}>
                      الاسم {sortBy === 'display_name' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50" onClick={() => handleSort('username')}>
                      اسم المستخدم {sortBy === 'username' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">البريد الإلكتروني</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50" onClick={() => handleSort('test_count')}>
                      الاختبارات {sortBy === 'test_count' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50" onClick={() => handleSort('participant_count')}>
                      المشاركين {sortBy === 'participant_count' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50" onClick={() => handleSort('qualified_referrals')}>
                      الإحالات المؤهلة {sortBy === 'qualified_referrals' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">زيارات الإحالة</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">الاختبارات الإضافية</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">المكافأة اليدوية</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">إجمالي المسموح</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">المتبقي</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50" onClick={() => handleSort('created_at')}>
                      تاريخ التسجيل {sortBy === 'created_at' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">الحالة</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={13} className="text-center py-8 text-gray-500">
                        لا يوجد مستخدمين
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm">{user.display_name || '-'}</td>
                        <td className="py-3 px-4 text-sm">{user.username || '-'}</td>
                        <td className="py-3 px-4 text-sm">{user.email || '-'}</td>
                        <td className="py-3 px-4 text-sm">{user.test_count}</td>
                        <td className="py-3 px-4 text-sm">{user.participant_count}</td>
                        <td className="py-3 px-4 text-sm font-medium text-green-600">{user.qualified_referrals}</td>
                        <td className="py-3 px-4 text-sm">{user.referral_visits}</td>
                        <td className="py-3 px-4 text-sm">
                          <div className="text-xs">
                            <div>مكتسبة: {user.earned_extra_tests}</div>
                            <div>مستخدمة: {user.used_extra_tests}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm font-medium text-orange-600">{user.manual_bonus_tests || 0}</td>
                        <td className="py-3 px-4 text-sm font-bold">{(stats?.base_test_limit || 5) + (user.earned_extra_tests || 0) + (user.manual_bonus_tests || 0)}</td>
                        <td className="py-3 px-4 text-sm font-bold text-blue-600">{user.remaining_extra_tests}</td>
                        <td className="py-3 px-4 text-sm">
                          {new Date(user.created_at).toLocaleDateString('ar-EG')}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.is_active ? 'نشط' : 'غير نشط'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <Button
                            variant="secondary"
                            onClick={() => router.push(`/admin/users/${user.id}`)}
                          >
                            التفاصيل
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
              <Button
                variant="secondary"
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                السابق
              </Button>
              <span className="text-sm text-gray-600">صفحة {page + 1}</span>
              <Button
                variant="secondary"
                onClick={() => setPage(p => p + 1)}
                disabled={users.length < limit}
              >
                التالي
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
