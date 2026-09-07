'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { api } from '@/lib/api'
import { adminLogout } from './login/actions'

interface Milestone {
  referrals: number
  extra_tests: number
}

export default function LeaderDashboardClient() {
  const router = useRouter()
  const [stats, setStats] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [rewardSettings, setRewardSettings] = useState<{ milestones: Milestone[]; base_test_limit: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Search and filters
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  
  // Pagination
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [total, setTotal] = useState(0)
  
  // User details modal
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [showUserDetails, setShowUserDetails] = useState(false)
  const [userDetails, setUserDetails] = useState<any>(null)
  const [loadingUserDetails, setLoadingUserDetails] = useState(false)
  const [bonusAmount, setBonusAmount] = useState('')
  const [bonusAction, setBonusAction] = useState<'add' | 'remove'>('add')
  const [savingBonus, setSavingBonus] = useState(false)
  
  // User edit
  const [editingUser, setEditingUser] = useState(false)
  const [editDisplayName, setEditDisplayName] = useState('')
  const [editUsername, setEditUsername] = useState('')
  const [savingUser, setSavingUser] = useState(false)
  
  // Test delete confirmation
  const [testToDelete, setTestToDelete] = useState<any>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletingTest, setDeletingTest] = useState(false)
  
  // User delete confirmation
  const [userToDelete, setUserToDelete] = useState<any>(null)
  const [showUserDeleteConfirm, setShowUserDeleteConfirm] = useState(false)
  const [deletingUser, setDeletingUser] = useState(false)
  
  // Reward settings editing
  const [editingSettings, setEditingSettings] = useState(false)
  const [tempSettings, setTempSettings] = useState<{ milestones: Milestone[]; base_test_limit: number } | null>(null)
  const [savingSettings, setSavingSettings] = useState(false)

  useEffect(() => {
    loadDashboardData()
  }, [])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadUsers()
  }, [page, search, filter, sortBy, sortOrder])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError('')
      
      const [statsData, settingsData] = await Promise.all([
        api.adminGetStats(),
        api.adminGetRewardSettings()
      ])
      
      setStats(statsData)
      setRewardSettings(settingsData)
    } catch (err: any) {
      console.error('[Leader Dashboard] Error:', err)
      setError('حدث خطأ أثناء تحميل البيانات')
    } finally {
      setLoading(false)
    }
  }

  const loadUsers = async () => {
    try {
      setError('')
      
      const data = await api.adminGetUsers({
        search,
        sort_by: sortBy,
        sort_order: sortOrder,
        limit,
        offset: (page - 1) * limit
      })
      
      setUsers(data.users || [])
      setTotal(data.total || 0)
    } catch (err: any) {
      console.error('[Leader Dashboard] Load users error:', err)
      setError('حدث خطأ أثناء تحميل المستخدمين')
    }
  }

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('desc')
    }
  }

  const handleLogout = async () => {
    await adminLogout()
  }

  const handleViewDetails = async (user: any) => {
    setSelectedUser(user)
    setShowUserDetails(true)
    setUserDetails(null)
    setLoadingUserDetails(true)
    
    try {
      const details = await api.adminGetUserDetails(user.id)
      setUserDetails(details)
    } catch (err: any) {
      console.error('[Leader Dashboard] Load user details error:', err)
      setError('حدث خطأ أثناء تحميل تفاصيل المستخدم')
    } finally {
      setLoadingUserDetails(false)
    }
  }

  const handleBonusAction = async () => {
    if (!selectedUser || !bonusAmount) return

    try {
      setSavingBonus(true)
      setError('')
      
      const amount = Number(bonusAmount)
      if (isNaN(amount) || amount <= 0) {
        setError('القيمة يجب أن تكون رقماً موجباً')
        return
      }

      if (bonusAction === 'add') {
        await api.adminAddManualBonus(selectedUser.id, amount)
      } else {
        await api.adminRemoveManualBonus(selectedUser.id, amount)
      }

      // Refresh data
      await loadUsers()
      await loadDashboardData()
      await handleViewDetails(selectedUser)
      
      setBonusAmount('')
      alert(bonusAction === 'add' ? 'تم إضافة البونص بنجاح' : 'تم إزالة البونص بنجاح')
    } catch (err: any) {
      console.error('[Leader Dashboard] Bonus action error:', err)
      setError('حدث خطأ أثناء تنفيذ العملية')
    } finally {
      setSavingBonus(false)
    }
  }

  const handleSaveSettings = async () => {
    if (!tempSettings) return

    try {
      setSavingSettings(true)
      setError('')

      await api.adminUpdateRewardSettings({
        milestones: tempSettings.milestones,
        base_test_limit: tempSettings.base_test_limit
      })

      setRewardSettings(tempSettings)
      setEditingSettings(false)
      setTempSettings(null)
      
      // Refresh users to recalculate limits
      await loadUsers()
      
      alert('تم حفظ الإعدادات بنجاح')
    } catch (err: any) {
      console.error('[Leader Dashboard] Save settings error:', err)
      setError('حدث خطأ أثناء حفظ الإعدادات')
    } finally {
      setSavingSettings(false)
    }
  }

  const handleStartEditSettings = () => {
    if (rewardSettings) {
      setTempSettings({
        milestones: [...rewardSettings.milestones],
        base_test_limit: rewardSettings.base_test_limit
      })
      setEditingSettings(true)
    }
  }

  const handleCancelEditSettings = () => {
    setTempSettings(null)
    setEditingSettings(false)
  }

  const handleStartEditUser = () => {
    if (selectedUser) {
      setEditDisplayName(selectedUser.display_name || '')
      setEditUsername(selectedUser.username || '')
      setEditingUser(true)
    }
  }

  const handleCancelEditUser = () => {
    setEditingUser(false)
    setEditDisplayName('')
    setEditUsername('')
  }

  const handleSaveUser = async () => {
    if (!selectedUser) return

    try {
      setSavingUser(true)
      setError('')

      if (!editUsername.trim()) {
        setError('اسم المستخدم مطلوب')
        return
      }

      if (editUsername.length < 3) {
        setError('اسم المستخدم يجب أن يكون 3 أحرف على الأقل')
        return
      }

      await api.adminUpdateUser(selectedUser.id, {
        display_name: editDisplayName.trim() || undefined,
        username: editUsername
      })

      // Refresh data
      await loadUsers()
      await handleViewDetails(selectedUser)
      
      setEditingUser(false)
      alert('تم تحديث بيانات المستخدم بنجاح')
    } catch (err: any) {
      console.error('[Leader Dashboard] Save user error:', err)
      if (err.message?.includes('Username already taken')) {
        setError('اسم المستخدم مستخدم بالفعل')
      } else {
        setError('حدث خطأ أثناء تحديث البيانات')
      }
    } finally {
      setSavingUser(false)
    }
  }

  const handleDeleteTest = (test: any) => {
    setTestToDelete(test)
    setShowDeleteConfirm(true)
  }

  const handleConfirmDeleteTest = async () => {
    if (!testToDelete) return

    try {
      setDeletingTest(true)
      setError('')

      await api.adminDeleteTest(testToDelete.id)

      // Refresh data
      await loadUsers()
      await handleViewDetails(selectedUser)
      
      setShowDeleteConfirm(false)
      setTestToDelete(null)
      alert('تم حذف الاختبار بنجاح')
    } catch (err: any) {
      console.error('[Leader Dashboard] Delete test error:', err)
      setError('حدث خطأ أثناء حذف الاختبار')
    } finally {
      setDeletingTest(false)
    }
  }

  const handleCancelDeleteTest = () => {
    setShowDeleteConfirm(false)
    setTestToDelete(null)
  }

  const handleDeleteUser = (user: any) => {
    setUserToDelete(user)
    setShowUserDeleteConfirm(true)
  }

  const handleConfirmDeleteUser = async () => {
    if (!userToDelete) return

    try {
      setDeletingUser(true)
      setError('')

      await api.adminDeleteUser(userToDelete.id)

      // Remove user from the list
      setUsers(users.filter(u => u.id !== userToDelete.id))
      setTotal(prev => Math.max(0, prev - 1))
      
      // If the current page becomes empty and not on first page, go back
      if (users.length === 1 && page > 1) {
        setPage(page - 1)
      }

      // Close modal
      setShowUserDeleteConfirm(false)
      setUserToDelete(null)
      
      // Refresh dashboard stats
      await loadDashboardData()
      
      alert('تم حذف الحساب بنجاح')
    } catch (err: any) {
      console.error('[Leader Dashboard] Delete user error:', err)
      if (err.message?.includes('User not found') || err.message?.includes('404')) {
        // User already deleted, refresh the list
        await loadUsers()
        setShowUserDeleteConfirm(false)
        setUserToDelete(null)
        alert('الحساب غير موجود أو تم حذفه بالفعل')
      } else {
        setError('حدث خطأ أثناء حذف الحساب')
      }
    } finally {
      setDeletingUser(false)
    }
  }

  const handleCancelDeleteUser = () => {
    setShowUserDeleteConfirm(false)
    setUserToDelete(null)
  }

  const handleAddMilestone = () => {
    if (!tempSettings) return
    
    setTempSettings({
      ...tempSettings,
      milestones: [...tempSettings.milestones, { referrals: 0, extra_tests: 0 }]
    })
  }

  const handleUpdateMilestone = (index: number, field: 'referrals' | 'extra_tests', value: number) => {
    if (!tempSettings) return
    
    const newMilestones = [...tempSettings.milestones]
    newMilestones[index] = { ...newMilestones[index], [field]: value }
    newMilestones.sort((a, b) => a.referrals - b.referrals)
    
    setTempSettings({
      ...tempSettings,
      milestones: newMilestones
    })
  }

  const handleRemoveMilestone = (index: number) => {
    if (!tempSettings) return
    
    setTempSettings({
      ...tempSettings,
      milestones: tempSettings.milestones.filter((_, i) => i !== index)
    })
  }

  // Filter users
  const filteredUsers = users.filter(user => {
    if (filter === 'all') return true
    if (filter === 'active') return user.is_active
    if (filter === 'inactive') return !user.is_active
    if (filter === 'has_referrals') return user.qualified_referrals > 0
    if (filter === 'no_referrals') return user.qualified_referrals === 0
    if (filter === 'limit_reached') return user.remaining_extra_tests <= 0
    if (filter === 'has_capacity') return user.remaining_extra_tests > 0
    return true
  })

  const totalPages = Math.ceil(total / limit)

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

  if (error && !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => router.push('/dashboard')}>العودة للرئيسية</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">منصة اعرفني</h1>
              <p className="text-gray-600">لوحة الإدارة - متابعة المستخدمين والاختبارات والإحالات</p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => router.push('/dashboard')}>
                العودة للرئيسية
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                تسجيل الخروج
              </Button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">إجمالي المستخدمين</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.users}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">إجمالي الاختبارات</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.tests}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    <p className="text-3xl font-bold text-gray-900">{stats.attempts}</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    <p className="text-sm text-gray-600 mb-1">زوار الإحالات</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.referral_unique_visitors}</p>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-full">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">الإحالات المؤهلة</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.qualified_referrals}</p>
                  </div>
                  <div className="bg-indigo-100 p-3 rounded-full">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    <p className="text-sm text-gray-600 mb-1">الاختبارات الإضافية المكتسبة</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.earned_extra_tests}</p>
                  </div>
                  <div className="bg-teal-100 p-3 rounded-full">
                    <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">البونص اليدوي</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.manual_bonus_tests}</p>
                  </div>
                  <div className="bg-orange-100 p-3 rounded-full">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">المستخدمين النشطين</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.active_users}</p>
                  </div>
                  <div className="bg-pink-100 p-3 rounded-full">
                    <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Referral Settings */}
        {rewardSettings && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">إعدادات المكافآت</h2>
                {!editingSettings && (
                  <Button variant="secondary" onClick={handleStartEditSettings}>
                    تعديل الإعدادات
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {editingSettings && tempSettings ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">الحد الأساسي للاختبارات</label>
                    <Input
                      type="number"
                      value={tempSettings.base_test_limit}
                      onChange={(e) => setTempSettings({ ...tempSettings, base_test_limit: Number(e.target.value) })}
                      min="0"
                      className="w-32"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">مراحل مكافآت الإحالة</label>
                    <div className="space-y-2">
                      {tempSettings.milestones.map((milestone, index) => (
                        <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <Input
                              type="number"
                              value={milestone.referrals}
                              onChange={(e) => handleUpdateMilestone(index, 'referrals', Number(e.target.value))}
                              min="0"
                              placeholder="عدد الإحالات"
                            />
                          </div>
                          <span className="text-gray-500">→</span>
                          <div className="flex-1">
                            <Input
                              type="number"
                              value={milestone.extra_tests}
                              onChange={(e) => handleUpdateMilestone(index, 'extra_tests', Number(e.target.value))}
                              min="0"
                              placeholder="الاختبارات الإضافية"
                            />
                          </div>
                          <Button
                            variant="secondary"
                            onClick={() => handleRemoveMilestone(index)}
                          >
                            حذف
                          </Button>
                        </div>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      onClick={handleAddMilestone}
                      className="mt-2"
                    >
                      إضافة مرحلة
                    </Button>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={handleSaveSettings} disabled={savingSettings}>
                      {savingSettings ? 'جاري الحفظ...' : 'حفظ'}
                    </Button>
                    <Button variant="secondary" onClick={handleCancelEditSettings}>
                      إلغاء
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="text-gray-600">الحد الأساسي:</span>
                    <span className="font-bold text-lg">{rewardSettings.base_test_limit} اختبارات</span>
                  </div>
                  
                  <div>
                    <p className="text-gray-600 mb-2">المراحل:</p>
                    <div className="space-y-1">
                      {rewardSettings.milestones.map((milestone, index) => (
                        <div key={index} className="text-sm">
                          <span className="font-medium">{milestone.referrals} إحالات</span>
                          <span className="text-gray-500 mx-2">→</span>
                          <span className="font-medium text-green-600">+{milestone.extra_tests} اختبارات</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Users Table */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">المستخدمين</h2>
          </CardHeader>
          <CardContent>
            {/* Search and Filters */}
            <div className="mb-4 flex flex-wrap gap-4">
              <Input
                type="text"
                placeholder="بحث بالاسم أو اسم المستخدم..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                className="flex-1 min-w-[200px]"
              />
              
              <select
                value={filter}
                onChange={(e) => { setFilter(e.target.value); setPage(1) }}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
              >
                <option value="all">جميع المستخدمين</option>
                <option value="active">نشط</option>
                <option value="inactive">غير نشط</option>
                <option value="has_referrals">لديه إحالات</option>
                <option value="no_referrals">بدون إحالات</option>
                <option value="limit_reached">وصل للحد</option>
                <option value="has_capacity">لديه سعة متبقية</option>
              </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">المستخدم</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">البريد الإلكتروني</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50" onClick={() => handleSort('created_at')}>
                      تاريخ التسجيل {sortBy === 'created_at' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50" onClick={() => handleSort('test_count')}>
                      الاختبارات {sortBy === 'test_count' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50" onClick={() => handleSort('participant_count')}>
                      المشاركين {sortBy === 'participant_count' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">زوار الإحالة</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50" onClick={() => handleSort('qualified_referrals')}>
                      الإحالات المؤهلة {sortBy === 'qualified_referrals' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">الاختبارات الإضافية</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">البونص اليدوي</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">الحد الإجمالي</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">المتبقي</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">الحالة</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={13} className="text-center py-8 text-gray-500">
                        لا يوجد مستخدمين
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm">
                          <div>
                            <div className="font-medium">{user.display_name || '-'}</div>
                            <div className="text-xs text-gray-500">@{user.username || '-'}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm">{user.email || '-'}</td>
                        <td className="py-3 px-4 text-sm">
                          {new Date(user.created_at).toLocaleDateString('ar-EG')}
                        </td>
                        <td className="py-3 px-4 text-sm">{user.test_count ?? 0}</td>
                        <td className="py-3 px-4 text-sm">{user.participant_count}</td>
                        <td className="py-3 px-4 text-sm">{user.referral_visits}</td>
                        <td className="py-3 px-4 text-sm font-medium text-green-600">{user.qualified_referrals}</td>
                        <td className="py-3 px-4 text-sm">
                          <div className="text-xs">
                            <div>مكتسبة: {user.earned_extra_tests}</div>
                            <div>مستخدمة: {user.used_extra_tests}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm font-medium text-orange-600">{user.manual_bonus_tests || 0}</td>
                        <td className="py-3 px-4 text-sm font-bold">{user.total_limit || 0}</td>
                        <td className="py-3 px-4 text-sm font-bold text-blue-600">{user.remaining_extra_tests || 0}</td>
                        <td className="py-3 px-4 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.is_active ? 'نشط' : 'غير نشط'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <div className="flex gap-2">
                            <Button
                              variant="secondary"
                              onClick={() => handleViewDetails(user)}
                            >
                              عرض التفاصيل
                            </Button>
                            {user.role !== 'admin' && (
                              <Button
                                variant="outline"
                                onClick={() => handleDeleteUser(user)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                حذف الحساب
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  صفحة {page} من {totalPages} ({total} مستخدم)
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    السابق
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    التالي
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* User Details Modal */}
      {showUserDetails && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">تفاصيل المستخدم</h2>
                <Button variant="secondary" onClick={() => setShowUserDetails(false)}>
                  إغلاق
                </Button>
              </div>

              {loadingUserDetails ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">جاري التحميل...</p>
                </div>
              ) : userDetails ? (
                <div className="space-y-6">
                  {/* User Info */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-3">معلومات المستخدم</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">الاسم:</span>
                        <span className="ml-2 font-medium">{userDetails.user.display_name || '-'}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">اسم المستخدم:</span>
                        <span className="ml-2 font-medium">@{userDetails.user.username || '-'}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">البريد الإلكتروني:</span>
                        <span className="ml-2 font-medium">{userDetails.user.email || '-'}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">تاريخ التسجيل:</span>
                        <span className="ml-2 font-medium">{new Date(userDetails.user.created_at).toLocaleDateString('ar-EG')}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">الحالة:</span>
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                          userDetails.user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {userDetails.user.is_active ? 'نشط' : 'غير نشط'}
                        </span>
                      </div>
                    </div>

                    {/* Edit User Form */}
                    {editingUser ? (
                      <div className="mt-4 pt-4 border-t">
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">الاسم</label>
                            <Input
                              type="text"
                              value={editDisplayName}
                              onChange={(e) => setEditDisplayName(e.target.value)}
                              placeholder="الاسم"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">اسم المستخدم</label>
                            <Input
                              type="text"
                              value={editUsername}
                              onChange={(e) => setEditUsername(e.target.value)}
                              placeholder="اسم المستخدم"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={handleSaveUser} disabled={savingUser}>
                              {savingUser ? 'جاري الحفظ...' : 'حفظ'}
                            </Button>
                            <Button variant="secondary" onClick={handleCancelEditUser}>
                              إلغاء
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 pt-4 border-t">
                        <Button variant="outline" onClick={handleStartEditUser}>
                          تعديل بيانات المستخدم
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Test Statistics */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-3">إحصائيات الاختبارات</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">عدد الاختبارات:</span>
                        <span className="ml-2 font-medium">{userDetails.test_stats?.test_count ?? userDetails.stats?.test_count ?? 0}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">عدد المشاركين:</span>
                        <span className="ml-2 font-medium">{userDetails.test_stats?.participant_count ?? userDetails.stats?.participants ?? 0}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">الحد الأساسي:</span>
                        <span className="ml-2 font-medium">{userDetails.test_stats?.base_limit ?? 5}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">الحد الإجمالي:</span>
                        <span className="ml-2 font-medium">{userDetails.test_stats?.total_limit ?? 5}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">المتبقي:</span>
                        <span className="ml-2 font-bold text-blue-600">{userDetails.test_stats?.remaining_extra_tests ?? 0}</span>
                      </div>
                    </div>

                    {/* Attempt Breakdown */}
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="font-medium mb-2">تفاصيل المحاولات</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">محاولات بالحد الأساسي:</span>
                          <span className="font-medium">{userDetails.test_stats?.base_attempts ?? 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">محاولات بالاختبارات الإضافية:</span>
                          <span className="font-medium">{userDetails.test_stats?.extra_attempts ?? 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Referral Statistics */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-3">إحصائيات الإحالات</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">زوار فريدين:</span>
                        <span className="ml-2 font-medium">{userDetails.stats?.referral_visitors ?? 0}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">إحالات مؤهلة:</span>
                        <span className="ml-2 font-bold text-green-600">{userDetails.stats?.qualified_referrals ?? 0}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">الاختبارات المكتسبة:</span>
                        <span className="ml-2 font-medium">{userDetails.rewards?.earned_extra_tests ?? 0}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">الاختبارات المستخدمة:</span>
                        <span className="ml-2 font-medium">{userDetails.rewards?.used_extra_tests ?? 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Test Limits */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-3">حدود الاختبارات</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">الحد الأساسي:</span>
                        <span className="font-medium">{userDetails.test_stats?.base_limit ?? 5}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">الاختبارات الإضافية المكتسبة:</span>
                        <span className="font-medium">{userDetails.rewards?.earned_extra_tests ?? 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">البونص اليدوي:</span>
                        <span className="font-medium text-orange-600">{userDetails.rewards?.manual_bonus_tests ?? 0}</span>
                      </div>
                      <div className="flex justify-between font-bold border-t pt-2">
                        <span className="text-gray-600">الحد الإجمالي:</span>
                        <span>{userDetails.test_stats?.total_limit ?? 5}</span>
                      </div>
                      <div className="flex justify-between font-bold">
                        <span className="text-gray-600">المتبقي:</span>
                        <span className="text-blue-600">{userDetails.test_stats?.remaining_extra_tests ?? 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Manual Bonus Management */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-3">إدارة البونص اليدوي</h3>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          value={bonusAmount}
                          onChange={(e) => setBonusAmount(e.target.value)}
                          placeholder="العدد"
                          min="1"
                          className="w-32"
                        />
                        <select
                          value={bonusAction}
                          onChange={(e) => setBonusAction(e.target.value as 'add' | 'remove')}
                          className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
                        >
                          <option value="add">إضافة</option>
                          <option value="remove">إزالة</option>
                        </select>
                        <Button onClick={handleBonusAction} disabled={savingBonus}>
                          {savingBonus ? 'جاري التنفيذ...' : 'تنفيذ'}
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500">
                        {bonusAction === 'add' ? 'سيتم إضافة عدد الاختبارات المحددة للبونص اليدوي للمستخدم' : 'سيتم إزالة عدد الاختبارات المحددة من البونص اليدوي للمستخدم'}
                      </p>
                    </div>
                  </div>

                  {/* User's Tests with Delete */}
                  {userDetails.tests && userDetails.tests.length > 0 && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-3">اختبارات المستخدم</h3>
                      <div className="space-y-2">
                        {userDetails.tests.map((test: any) => (
                          <div key={test.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                            <div>
                              <div className="font-medium">{test.title}</div>
                              <div className="text-xs text-gray-500">
                                {test.attempt_count || 0} مشارك • {new Date(test.created_at).toLocaleDateString('ar-EG')}
                              </div>
                            </div>
                            <Button
                              variant="secondary"
                              onClick={() => handleDeleteTest(test)}
                              className="text-red-600 hover:text-red-700"
                            >
                              حذف
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">فشل تحميل التفاصيل</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && testToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">تأكيد الحذف</h2>
            <p className="text-gray-600 mb-6">
              هل أنت متأكد من حذف الاختبار &quot;{testToDelete.title}&quot;؟ هذا الإجراء لا يمكن التراجع عنه.
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={handleCancelDeleteTest}>
                إلغاء
              </Button>
              <Button
                onClick={handleConfirmDeleteTest}
                disabled={deletingTest}
                className="bg-red-600 hover:bg-red-700"
              >
                {deletingTest ? 'جاري الحذف...' : 'حذف'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* User Delete Confirmation Modal */}
      {showUserDeleteConfirm && userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">حذف الحساب؟</h2>
            <p className="text-gray-600 mb-6">
              هل أنت متأكد من حذف حساب هذا المستخدم؟
              سيتم حذف الحساب وبياناته المرتبطة به، ولا يمكن التراجع عن هذه العملية.
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={handleCancelDeleteUser}>
                إلغاء
              </Button>
              <Button
                onClick={handleConfirmDeleteUser}
                disabled={deletingUser}
                className="bg-red-600 hover:bg-red-700"
              >
                {deletingUser ? 'جاري الحذف...' : 'حذف الحساب'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
