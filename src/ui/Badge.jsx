import React from 'react'

const TONE_CLASSES = {
  blue: 'bg-blue-100 text-blue-700',
  amber: 'bg-amber-100 text-amber-700',
  green: 'bg-green-100 text-green-700',
  red: 'bg-red-100 text-red-700',
  grey: 'bg-gray-100 text-gray-600'
}

// tone: named palette (see lib/constants STATUS_TONE). color: raw hex from
// tenant-config (work_item_states / service_types) — takes precedence.
function Badge({ children, tone = 'grey', color, className = '' }) {
  if (color) {
    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${className}`}
        style={{ backgroundColor: `${color}1A`, color }}
      >
        {children}
      </span>
    )
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${TONE_CLASSES[tone] || TONE_CLASSES.grey} ${className}`}>
      {children}
    </span>
  )
}

export default Badge
