import React, { useState } from 'react'
import { navigate } from 'vike/client/router'
import KanbanColumn from './KanbanColumn.jsx'
import { useTenantConfig } from '../../hooks/useTenantConfig.js'
import { tradeJobsApi } from '../../lib/endpoints.js'

function KanbanBoard({ jobs, onChanged }) {
  const { states } = useTenantConfig()
  const stateKeys = Object.keys(states)
  const [error, setError] = useState(null)

  const handleDrop = async (jobId, newStatus) => {
    setError(null)
    try {
      await tradeJobsApi.updateStatus(jobId, newStatus)
      onChanged()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
          {error}
        </div>
      )}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stateKeys.map((key) => (
          <KanbanColumn
            key={key}
            stateKey={key}
            meta={states[key]}
            jobs={jobs.filter((j) => j.status === key)}
            onJobClick={(job) => navigate(`/admin/jobs/${job.id}`)}
            onDrop={handleDrop}
          />
        ))}
      </div>
    </div>
  )
}

export default KanbanBoard
