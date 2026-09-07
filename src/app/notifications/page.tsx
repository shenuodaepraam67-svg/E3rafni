'use client'

import { Card, CardContent } from '@/components/ui/Card'

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-600 text-lg">قريباً: ميزة الإشعارات قيد التطوير</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
