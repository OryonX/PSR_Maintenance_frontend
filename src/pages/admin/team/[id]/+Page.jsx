import React, { useState, useEffect } from 'react'
import { usePageContext } from 'vike-react/usePageContext'
import { navigate } from 'vike/client/router'
import { ChevronLeft, Trash2 } from 'lucide-react'
import HelmetSEO from '../../../../seo/HelmetSEO.jsx'
import { teamMembersApi, tradeJobsApi } from '../../../../adminpanel/lib/endpoints.js'
import { useTenantConfig } from '../../../../adminpanel/hooks/useTenantConfig.js'
import TeamMemberForm from '../../../../adminpanel/components/Forms/TeamMemberForm.jsx'
import WorkItemCard from '../../../../adminpanel/components/WorkItemCard.jsx'
import Card from '../../../../ui/Card.jsx'
import Button from '../../../../ui/Button.jsx'
import Spinner from '../../../../ui/Spinner.jsx'
import EmptyState from '../../../../ui/EmptyState.jsx'

function Page() {
  const { routeParams } = usePageContext()
  const { label } = useTenantConfig()
  const [member, setMember] = useState(null)
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionError, setActionError] = useState(null)

  useEffect(() => {
    teamMembersApi.get(routeParams.id).then(setMember).catch(setError).finally(() => setLoading(false))
    tradeJobsApi.list({ assigned_team_member_id: routeParams.id }).then(setJobs).catch(() => setJobs([]))
  }, [routeParams.id])

  const handleUpdate = async (form) => {
    const updated = await teamMembersApi.update(member.id, form)
    setMember(updated)
  }

  const handleDelete = async () => {
    if (!window.confirm(`Remove ${member.name} from the team?`)) return
    setActionError(null)
    try {
      await teamMembersApi.remove(member.id)
      navigate('/admin/team')
    } catch (err) {
      setActionError(err.message)
    }
  }

  if (loading) return <Spinner label="Loading…" />
  if (error) return <EmptyState message={`Couldn't load this ${label('team').toLowerCase()}: ${error.message}`} />
  if (!member) return null

  return (
    <>
      <HelmetSEO title={`${member.name} | ${label('team', true)} | PSR Operations`} description="Team member detail" noindex={true} />

      <div className="space-y-4">
        <a href="/admin/team" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-navy-900 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to {label('team', true).toLowerCase()}
        </a>

        {actionError && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
            {actionError}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-4">
          <Card title="Details" className="lg:col-span-2">
            <TeamMemberForm initial={member} onSubmit={handleUpdate} submitLabel="Save changes" />
          </Card>

          <div className="space-y-4">
            <Card title={`Assigned ${label('work_item', true).toLowerCase()}`}>
              {jobs.length === 0 ? (
                <p className="text-sm text-gray-400">No {label('work_item', true).toLowerCase()} assigned.</p>
              ) : (
                <div className="space-y-2">
                  {jobs.map((job) => (
                    <WorkItemCard key={job.id} job={job} onClick={() => navigate(`/admin/jobs/${job.id}`)} />
                  ))}
                </div>
              )}
            </Card>

            <Card>
              <Button variant="danger" className="w-full" onClick={handleDelete}>
                <Trash2 className="w-4 h-4" /> Remove from team
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}

export default Page
