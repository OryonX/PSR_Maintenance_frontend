import React from 'react'
import { MapPin, Clock } from 'lucide-react'

function formatTime(job) {
  if (job.starts_at) {
    return new Date(job.starts_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  }
  if (job.scheduled_date) {
    return `${new Date(job.scheduled_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}${job.scheduled_time_window ? ` · ${job.scheduled_time_window}` : ''}`
  }
  return 'Unscheduled'
}

function WorkItemCard({ job, onClick, draggable, onDragStart }) {
  return (
    <div
      onClick={onClick}
      draggable={draggable}
      onDragStart={onDragStart}
      className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm hover:shadow-md cursor-pointer transition-shadow"
    >
      <p className="font-semibold text-sm text-navy-900 truncate">{job.lead?.name || 'Unnamed'}</p>
      {job.lead?.details?.service_type && (
        <p className="text-xs text-gray-500 capitalize">{job.lead.details.service_type}</p>
      )}
      <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
        <Clock className="w-3 h-3" />
        {formatTime(job)}
      </div>
      {job.address && (
        <div className="flex items-center gap-1 text-xs text-gray-400 mt-1 truncate">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{job.address}</span>
        </div>
      )}
      {job.assigned_team_member?.name && (
        <div className="mt-2 pt-2 border-t border-gray-50 text-xs text-gray-500">
          {job.assigned_team_member.name}
        </div>
      )}
    </div>
  )
}

export default WorkItemCard
