import React, { useState, useEffect } from 'react'
import { Plus, CalendarDays, Columns3 } from 'lucide-react'
import HelmetSEO from '../../../seo/HelmetSEO.jsx'
import { tradeJobsApi, leadsApi, quotesApi, teamMembersApi } from '../../../adminpanel/lib/endpoints.js'
import { useTenantConfig } from '../../../adminpanel/hooks/useTenantConfig.js'
import WeeklyCalendar from '../../../adminpanel/components/WorkItemCalendar/WeeklyCalendar.jsx'
import KanbanBoard from '../../../adminpanel/components/WorkItemKanban/KanbanBoard.jsx'
import WorkItemForm from '../../../adminpanel/components/Forms/WorkItemForm.jsx'
import Card from '../../../ui/Card.jsx'
import Button from '../../../ui/Button.jsx'
import Modal from '../../../ui/Modal.jsx'
import Spinner from '../../../ui/Spinner.jsx'

function Page() {
  const { label } = useTenantConfig()
  const [view, setView] = useState('calendar')
  const [jobs, setJobs] = useState(null)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [leads, setLeads] = useState([])
  const [quotes, setQuotes] = useState([])
  const [teamMembers, setTeamMembers] = useState([])

  const loadJobs = () => {
    setLoading(true)
    tradeJobsApi.list().then(setJobs).finally(() => setLoading(false))
  }

  useEffect(() => {
    if (view === 'kanban') loadJobs()
  }, [view])

  useEffect(() => {
    leadsApi.list().then(setLeads).catch(() => setLeads([]))
    quotesApi.list().then(setQuotes).catch(() => setQuotes([]))
    teamMembersApi.list().then(setTeamMembers).catch(() => setTeamMembers([]))
  }, [])

  const handleCreated = () => {
    setModalOpen(false)
    if (view === 'kanban') loadJobs()
    else window.location.reload()
  }

  return (
    <>
      <HelmetSEO title={`${label('work_item', true)} | PSR Operations`} description="Jobs" noindex={true} />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
            <button
              onClick={() => setView('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'calendar' ? 'bg-navy-900 text-white' : 'text-gray-600'}`}
            >
              <CalendarDays className="w-4 h-4" /> Calendar
            </button>
            <button
              onClick={() => setView('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'kanban' ? 'bg-navy-900 text-white' : 'text-gray-600'}`}
            >
              <Columns3 className="w-4 h-4" /> Board
            </button>
          </div>
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="w-4 h-4" /> New {label('work_item')}
          </Button>
        </div>

        <Card>
          {view === 'calendar' ? (
            <WeeklyCalendar />
          ) : loading ? (
            <Spinner />
          ) : (
            <KanbanBoard jobs={jobs || []} onChanged={loadJobs} />
          )}
        </Card>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={`New ${label('work_item')}`}>
        <WorkItemForm leads={leads} quotes={quotes} teamMembers={teamMembers} onSubmit={handleCreated} onCancel={() => setModalOpen(false)} />
      </Modal>
    </>
  )
}

export default Page
