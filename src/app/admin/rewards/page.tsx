'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { api } from '@/lib/api'

interface Milestone {
  referrals: number
  extra_tests: number
}

export default function AdminRewardsPage() {
  const router = useRouter()
  const [settings, setSettings] = useState<{ milestones: Milestone[]; base_test_limit: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [newMilestone, setNewMilestone] = useState({ referrals: '', extraTests: '' })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await api.adminGetRewardSettings()
      setSettings(data)
    } catch (err: any) {
      console.error('[Admin Rewards] Error:', err)
      if (err.message?.includes('Admin access required') || err.status === 403) {
        setError('ليس لديك صلاحية الوصول إلى هذه الصفحة')
      } else {
        setError('حدث خطأ أثناء تحميل الإعدادات')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    if (!settings) return

    try {
      setSaving(true)
      setError('')

      await api.adminUpdateRewardSettings({
        milestones: settings.milestones,
        base_test_limit: settings.base_test_limit
      })

      alert('تم حفظ الإعدادات بنجاح')
    } catch (err: any) {
      console.error('[Admin Rewards] Save error:', err)
      setError('حدث خطأ أثناء حفظ الإعدادات')
    } finally {
      setSaving(false)
    }
  }

  const handleAddMilestone = () => {
    if (!settings) return

    const referrals = Number(newMilestone.referrals)
    const extraTests = Number(newMilestone.extraTests)

    if (isNaN(referrals) || referrals < 0) {
      setError('عدد الإحالات يجب أن يكون رقماً موجباً')
      return
    }

    if (isNaN(extraTests) || extraTests < 0) {
      setError('عدد الاختبارات يجب أن يكون رقماً موجباً')
      return
    }

    setSettings({
      ...settings,
      milestones: [...settings.milestones, { referrals, extra_tests: extraTests }].sort((a, b) => a.referrals - b.referrals)
    })
    setNewMilestone({ referrals: '', extraTests: '' })
    setError('')
  }

  const handleRemoveMilestone = (index: number) => {
    if (!settings) return

    setSettings({
      ...settings,
      milestones: settings.milestones.filter((_, i) => i !== index)
    })
  }

  const handleUpdateMilestone = (index: number, field: 'referrals' | 'extra_tests', value: string) => {
    if (!settings) return

    const numValue = Number(value)
    if (isNaN(numValue) || numValue < 0) return

    const newMilestones = [...settings.milestones]
    newMilestones[index] = { ...newMilestones[index], [field]: numValue }
    newMilestones.sort((a, b) => a.referrals - b.referrals)

    setSettings({
      ...settings,
      milestones: newMilestones
    })
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

  if (error && !settings) {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button variant="secondary" onClick={() => router.push('/admin/users')}>
            ← العودة للمستخدمين
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">إعدادات المكافآت</h1>
          <p className="text-gray-600">إدارة مراحل مكافآت الإحالة والحد الأساسي للاختبارات</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {settings && (
          <>
            {/* Base Test Limit */}
            <Card className="mb-6">
              <CardHeader>
                <h2 className="text-xl font-semibold text-gray-900">الحد الأساسي للاختبارات</h2>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Input
                    type="number"
                    value={settings.base_test_limit}
                    onChange={(e) => setSettings({ ...settings, base_test_limit: Number(e.target.value) })}
                    min="0"
                    className="w-32"
                  />
                  <p className="text-sm text-gray-600">اختبارات</p>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  هذا هو الحد الأساسي للاختبارات التي يمكن لكل مستخدم إنشاؤها. يمكن للمستخدمين الحصول على اختبارات إضافية من خلال الإحالات والمكافآت اليدوية.
                </p>
              </CardContent>
            </Card>

            {/* Reward Milestones */}
            <Card className="mb-6">
              <CardHeader>
                <h2 className="text-xl font-semibold text-gray-900">مراحل مكافآت الإحالة</h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {settings.milestones.map((milestone, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <label className="block text-sm text-gray-600 mb-1">عدد الإحالات</label>
                        <Input
                          type="number"
                          value={milestone.referrals}
                          onChange={(e) => handleUpdateMilestone(index, 'referrals', e.target.value)}
                          min="0"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm text-gray-600 mb-1">الاختبارات الإضافية</label>
                        <Input
                          type="number"
                          value={milestone.extra_tests}
                          onChange={(e) => handleUpdateMilestone(index, 'extra_tests', e.target.value)}
                          min="0"
                        />
                      </div>
                      <div className="pt-6">
                        <Button
                          variant="secondary"
                          onClick={() => handleRemoveMilestone(index)}
                        >
                          حذف
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add New Milestone */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-4">إضافة مرحلة جديدة</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="block text-sm text-gray-600 mb-1">عدد الإحالات</label>
                      <Input
                        type="number"
                        value={newMilestone.referrals}
                        onChange={(e) => setNewMilestone({ ...newMilestone, referrals: e.target.value })}
                        min="0"
                        placeholder="مثال: 10"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm text-gray-600 mb-1">الاختبارات الإضافية</label>
                      <Input
                        type="number"
                        value={newMilestone.extraTests}
                        onChange={(e) => setNewMilestone({ ...newMilestone, extraTests: e.target.value })}
                        min="0"
                        placeholder="مثال: 3"
                      />
                    </div>
                    <div className="pt-6">
                      <Button onClick={handleAddMilestone}>
                        إضافة
                      </Button>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-500 mt-4">
                  يتم تطبيق أعلى مرحلة تم تحقيقها. على سبيل المثال، إذا كان لدى المستخدم 25 إحالة ومراحل 10 و20، فسيحصل على مكافأة مرحلة 20.
                </p>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleSaveSettings}
                disabled={saving}
              >
                {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
