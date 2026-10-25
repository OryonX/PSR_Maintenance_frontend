import React from 'react'
import { MapPin, Clock } from 'lucide-react'
import { jobDescription, jobWhen } from '../lib/jobs.js'
import { useTenantConfig } from '../hooks/useTenantConfig.js'

function WorkItemCard({ job, onClick, draggable, onDragStart }) {
  const { serviceInfo } = useTenantConfig()
  const description = jobDescription(job, serviceInfo)

  return (
    <div
      onClick={onClick}
      draggable={draggable}
      onDragStart={onDragStart}
      className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm hover:shadow-md cursor-pointer transition-shadow"
    >
      <p className="font-semibold text-sm text-navy-900 truncate">{description || job.lead?.name || 'Unnamed'}</p>
      {description && job.lead?.name && (
        <p className="text-xs text-gray-500 truncate">for {job.lead.name}</p>
      )}
      <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
        <Clock className="w-3 h-3" />
        {jobWhen(job)}
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
