import React from 'react'
import { Inbox } from 'lucide-react'

function EmptyState({ message = 'Nothing here yet.' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 text-gray-400 py-14">
      <Inbox className="w-8 h-8" />
      <p className="text-sm">{message}</p>
    </div>
  )
}

export default EmptyState
