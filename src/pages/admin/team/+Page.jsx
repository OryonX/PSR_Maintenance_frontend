import React, { useState, useEffect } from 'react'
import { navigate } from 'vike/client/router'
import { Plus } from 'lucide-react'
import HelmetSEO from '../../../seo/HelmetSEO.jsx'
import { teamMembersApi } from '../../../adminpanel/lib/endpoints.js'
import { useTenantConfig } from '../../../adminpanel/hooks/useTenantConfig.js'
import TeamMemberForm from '../../../adminpanel/components/Forms/TeamMemberForm.jsx'
import Card from '../../../ui/Card.jsx'
import Button from '../../../ui/Button.jsx'
import Modal from '../../../ui/Modal.jsx'
import Badge from '../../../ui/Badge.jsx'
import Spinner from '../../../ui/Spinner.jsx'
import EmptyState from '../../../ui/EmptyState.jsx'

function Page() {
  const { label, services } = useTenantConfig()
  const [members, setMembers] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  const load = () => {
    setLoading(true)
    teamMembersApi.list().then(setMembers).catch(setError).finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleCreate = async (form) => {
    await teamMembersApi.create(form)
    setModalOpen(false)
    load()
  }

  if (loading) return <Spinner label="Loading…" />
  if (error) return <EmptyState message={`Couldn't load ${label('team', true).toLowerCase()}: ${error.message}`} />

  return (
    <>
      <HelmetSEO title={`${label('team', true)} | PSR Operations`} description="Team" noindex={true} />

      <div className="space-y-4">
        <div className="flex justify-end">
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="w-4 h-4" /> New {label('team')}
          </Button>
        </div>

        {!members || members.length === 0 ? (
          <Card><EmptyState message={`No ${label('team', true).toLowerCase()} yet.`} /></Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((member) => (
              <Card key={member.id} className="cursor-pointer" bodyClassName="p-5" >
                <div onClick={() => navigate(`/admin/team/${member.id}`)}>
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                      style={{ backgroundColor: member.color_code || '#233B5C' }}
                    >
                      {member.name[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-navy-900 truncate">{member.name}</p>
                      <p className="text-xs text-gray-400">{member.phone || member.email || '—'}</p>
                    </div>
                    <span className={`ml-auto w-2 h-2 rounded-full ${member.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(member.trade_specialties || []).map((key) => (
                      <Badge key={key} color={services[key]?.color}>{services[key]?.label || key}</Badge>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={`New ${label('team')}`}>
        <TeamMemberForm onSubmit={handleCreate} onCancel={() => setModalOpen(false)} submitLabel="Create" />
      </Modal>
    </>
  )
}

export default Page
