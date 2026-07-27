import React from 'react'
import WorkItemCard from '../WorkItemCard.jsx'

function KanbanColumn({ stateKey, meta, jobs, onJobClick, onDrop }) {
  const handleDragOver = (e) => e.preventDefault()
  const handleDrop = (e) => {
    e.preventDefault()
    const jobId = e.dataTransfer.getData('text/job-id')
    if (jobId) onDrop(Number(jobId), stateKey)
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="flex-shrink-0 w-72 bg-surface-light rounded-xl p-3"
    >
      <div className="flex items-center gap-2 mb-3 px-1">
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: meta.color }} />
        <h3 className="font-semibold text-sm text-navy-900">{meta.label}</h3>
        <span className="text-xs text-gray-400 ml-auto">{jobs.length}</span>
      </div>
      <div className="space-y-2 min-h-[40px]">
        {jobs.map((job) => (
          <WorkItemCard
            key={job.id}
            job={job}
            onClick={() => onJobClick(job)}
            draggable
            onDragStart={(e) => e.dataTransfer.setData('text/job-id', job.id)}
          />
        ))}
      </div>
    </div>
  )
}

export default KanbanColumn
