import React from 'react'

function Card({ title, action, children, className = '', bodyClassName = 'p-6' }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-100 shadow-sm ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between px-6 pt-5 pb-1">
          {title && <h3 className="font-bold text-navy-900">{title}</h3>}
          {action}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </div>
  )
}

export default Card
