import React from 'react'

const VARIANTS = {
  primary: 'bg-navy-900 text-white hover:bg-navy-800 focus:ring-navy-900/30',
  secondary: 'bg-white text-navy-900 border border-gray-200 hover:bg-gray-50 focus:ring-navy-900/20',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-600/30',
  ghost: 'bg-transparent text-navy-900 hover:bg-gray-100 focus:ring-navy-900/20'
}

const SIZES = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-sm'
}

function Button({ variant = 'primary', size = 'md', className = '', as: As = 'button', ...props }) {
  return (
    <As
      className={`inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    />
  )
}

export default Button
