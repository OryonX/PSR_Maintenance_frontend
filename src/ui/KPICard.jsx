import React from 'react'

function KPICard({ icon: Icon, label, value, trend }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-start justify-between mb-3">
        {Icon && (
          <div className="w-10 h-10 rounded-lg bg-navy-900/5 flex items-center justify-center">
            <Icon className="w-5 h-5 text-navy-900" />
          </div>
        )}
        {trend && <span className="text-xs font-medium text-gray-400">{trend}</span>}
      </div>
      <div className="text-2xl font-black text-navy-900 tabular-nums">{value}</div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  )
}

export default KPICard
