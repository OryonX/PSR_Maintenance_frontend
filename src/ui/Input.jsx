import React from 'react'

function Input({ label, error, id, className = '', ...props }) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-navy-900 mb-1.5">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full px-3.5 py-2.5 rounded-lg border text-sm ${error ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-navy-900'} focus:outline-none focus:ring-2 focus:ring-navy-900/10 transition-colors`}
        {...props}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}

export default Input
