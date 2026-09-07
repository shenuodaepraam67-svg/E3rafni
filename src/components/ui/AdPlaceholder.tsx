import React from 'react'

interface AdPlaceholderProps {
  placement: 'home_top' | 'home_bottom' | 'builder_step' | 'result_top' | 'result_bottom' | 'success_page'
}

export const AdPlaceholder: React.FC<AdPlaceholderProps> = ({ placement }) => {
  return (
    <div className="w-full bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4 my-4 flex items-center justify-center min-h-[120px]" dir="rtl">
      <div className="text-center">
        <p className="text-gray-400 text-sm">مساحة إعلانية - {placement}</p>
      </div>
    </div>
  )
}
