import React from 'react'

// hint: optional helper text under the field (hidden while there's an error).
function Select({ label, error, hint, id, options = [], placeholder, className = '', ...props }) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-navy-900 mb-1.5">
          {label}
        </label>
      )}
      <select
        id={id}
        aria-describedby={hint && !error ? `${id}-hint` : undefined}
        className={`w-full px-3.5 py-2.5 rounded-lg border text-sm bg-white ${error ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-navy-900'} focus:outline-none focus:ring-2 focus:ring-navy-900/10 transition-colors`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      {hint && !error && <p id={`${id}-hint`} className="text-gray-400 text-xs mt-1">{hint}</p>}
    </div>
  )
}

export default Select
