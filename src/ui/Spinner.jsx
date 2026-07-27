import React from 'react'
import { Loader2 } from 'lucide-react'

function Spinner({ label = 'Loading…', className = '' }) {
  return (
    <div className={`flex items-center justify-center gap-2 text-gray-400 text-sm py-12 ${className}`}>
      <Loader2 className="w-4 h-4 animate-spin" />
      {label}
    </div>
  )
}

export default Spinner
