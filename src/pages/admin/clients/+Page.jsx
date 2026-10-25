import React, { useState, useEffect } from 'react'
import { navigate } from 'vike/client/router'
import { Plus, Pencil } from 'lucide-react'
import HelmetSEO from '../../../seo/HelmetSEO.jsx'
import { clientsApi } from '../../../adminpanel/lib/endpoints.js'
import { STATUS_TONE } from '../../../adminpanel/lib/constants.js'
import { useTenantConfig } from '../../../adminpanel/hooks/useTenantConfig.js'
import { usePagination } from '../../../adminpanel/hooks/usePagination.js'
import ReusableTable from '../../../adminpanel/components/Tables/ReusableTable.jsx'
import ClientForm from '../../../adminpanel/components/Forms/ClientForm.jsx'
import Pagination from '../../../ui/Pagination.jsx'
import Badge from '../../../ui/Badge.jsx'
import Card from '../../../ui/Card.jsx'
import Button from '../../../ui/Button.jsx'
import Modal from '../../../ui/Modal.jsx'

function Page() {
  const { label } = useTenantConfig()
  const [clients, setClients] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const [editTarget, setEditTarget] = useState(null)
  const [notice, setNotice] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    clientsApi.list()
      .then((data) => { if (!cancelled) setClients(data) })
      .catch((err) => { if (!cancelled) setError(err) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [reloadKey])

  const handleCreated = () => {
    setModalOpen(false)
    setNotice(`${label('client')} created.`)
    setReloadKey((k) => k + 1)
  }

  const handleEdited = () => {
    setEditTarget(null)
    setNotice(`${label('client')} updated.`)
    setReloadKey((k) => k + 1)
  }

  const { page, setPage, totalPages, total, pageItems } = usePagination(clients, 15)

  const columns = [
    { key: 'name', label: label('client'), render: (row) => <span className="font-medium">{row.name}</span> },
    { key: 'company', label: 'Company', hideBelow: 'md', render: (row) => row.company || '—' },
    { key: 'contact', label: 'Contact', hideBelow: 'sm', render: (row) => row.phone || row.email || '—' },
    { key: 'status', label: 'Status', render: (row) => <Badge tone={STATUS_TONE[row.status] || 'grey'}>{row.status}</Badge> },
    { key: 'billing', label: 'Billing', hideBelow: 'md', render: (row) => (
      row.billing_details_missing?.length
        ? <Badge tone="amber">incomplete</Badge>
        : <Badge tone="green">ready</Badge>
    ) },
    { key: 'actions', label: '', render: (row) => (
      <button
        title="Edit"
        onClick={(e) => { e.stopPropagation(); setEditTarget(row) }}
        className="p-1.5 rounded-lg text-gray-400 hover:text-navy-900 hover:bg-gray-100 transition-colors"
      >
        <Pencil className="w-4 h-4" />
      </button>
    ) }
  ]

  return (
    <>
      <HelmetSEO title={`${label('client', true)} | PSR Operations`} description="Clients" noindex={true} />

      <div className="space-y-4">
        <div className="flex justify-end">
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="w-4 h-4" /> New {label('client')}
          </Button>
        </div>

        {notice && (
          <div className="flex items-start justify-between gap-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3">
            <span>{notice}</span>
            <button onClick={() => setNotice(null)} className="opacity-60 hover:opacity-100" aria-label="Dismiss">×</button>
          </div>
        )}

        <Card bodyClassName="p-0">
          {error ? (
            <p className="p-6 text-sm text-red-500">Couldn't load {label('client', true).toLowerCase()}: {error.message}</p>
          ) : (
            <>
              <ReusableTable
                columns={columns}
                rows={pageItems}
                loading={loading}
                emptyMessage={`No ${label('client', true).toLowerCase()} yet — create one or convert a ${label('lead').toLowerCase()}.`}
                onRowClick={(row) => navigate(`/admin/clients/${row.id}`)}
              />
              <div className="px-4">
                <Pagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} />
              </div>
            </>
          )}
        </Card>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={`New ${label('client')}`}>
        <ClientForm onSubmit={handleCreated} onCancel={() => setModalOpen(false)} />
      </Modal>

      <Modal open={Boolean(editTarget)} onClose={() => setEditTarget(null)} title={`Edit ${label('client').toLowerCase()}`}>
        {editTarget && <ClientForm client={editTarget} onSubmit={handleEdited} onCancel={() => setEditTarget(null)} />}
      </Modal>
    </>
  )
}

export default Page
