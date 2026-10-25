import React, { useState, useEffect } from 'react'
import { navigate } from 'vike/client/router'
import { Plus } from 'lucide-react'
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
    setReloadKey((k) => k + 1)
  }

  const { page, setPage, totalPages, total, pageItems } = usePagination(clients, 15)

  const columns = [
    { key: 'name', label: label('client'), render: (row) => <span className="font-medium">{row.name}</span> },
    { key: 'company', label: 'Company', hideBelow: 'md', render: (row) => row.company || '—' },
    { key: 'contact', label: 'Contact', hideBelow: 'sm', render: (row) => row.phone || row.email || '—' },
    { key: 'status', label: 'Status', render: (row) => <Badge tone={STATUS_TONE[row.status] || 'grey'}>{row.status}</Badge> }
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
    </>
  )
}

export default Page
