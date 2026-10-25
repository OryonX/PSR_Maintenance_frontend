import React, { useState, useEffect } from 'react'
import { navigate } from 'vike/client/router'
import { Plus } from 'lucide-react'
import HelmetSEO from '../../../seo/HelmetSEO.jsx'
import { clientInvoicesApi, tradeJobsApi, clientsApi } from '../../../adminpanel/lib/endpoints.js'
import { STATUS_TONE } from '../../../adminpanel/lib/constants.js'
import { useTenantConfig } from '../../../adminpanel/hooks/useTenantConfig.js'
import { usePagination } from '../../../adminpanel/hooks/usePagination.js'
import ReusableTable from '../../../adminpanel/components/Tables/ReusableTable.jsx'
import ClientInvoiceForm from '../../../adminpanel/components/Forms/ClientInvoiceForm.jsx'
import Pagination from '../../../ui/Pagination.jsx'
import Badge from '../../../ui/Badge.jsx'
import Card from '../../../ui/Card.jsx'
import Button from '../../../ui/Button.jsx'
import Modal from '../../../ui/Modal.jsx'
import Spinner from '../../../ui/Spinner.jsx'

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function isOverdue(invoice) {
  return invoice.status !== 'paid' && invoice.due_date && new Date(invoice.due_date) < new Date()
}

function Page() {
  const { label } = useTenantConfig()
  const [invoices, setInvoices] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [formData, setFormData] = useState(null)
  const [formError, setFormError] = useState(null)

  const loadInvoices = () => {
    setLoading(true)
    setError(null)
    clientInvoicesApi.list().then(setInvoices).catch(setError).finally(() => setLoading(false))
  }

  useEffect(loadInvoices, [])

  // Jobs and clients are only needed for the create form — fetched when it opens.
  const openCreate = () => {
    setModalOpen(true)
    setFormData(null)
    setFormError(null)
    Promise.all([tradeJobsApi.list(), clientsApi.list()])
      .then(([tradeJobs, clients]) => setFormData({ tradeJobs, clients }))
      .catch(setFormError)
  }

  const handleCreated = () => {
    setModalOpen(false)
    loadInvoices()
  }

  const { page, setPage, totalPages, total, pageItems } = usePagination(invoices, 15)

  const columns = [
    { key: 'invoice_number', label: label('invoice'), render: (row) => <span className="font-medium">{row.invoice_number}</span> },
    { key: 'client', label: label('lead'), hideBelow: 'sm', render: (row) => row.trade_job?.lead?.name || '—' },
    { key: 'amount', label: 'Amount', hideBelow: 'md', render: (row) => `£${Number(row.amount).toLocaleString()}` },
    { key: 'due_date', label: 'Due', hideBelow: 'lg', render: (row) => (
      <span className={isOverdue(row) ? 'text-red-600 font-medium' : ''}>{formatDate(row.due_date)}</span>
    ) },
    { key: 'status', label: 'Status', render: (row) => <Badge tone={isOverdue(row) ? 'red' : (STATUS_TONE[row.status] || 'grey')}>{isOverdue(row) ? 'overdue' : row.status}</Badge> }
  ]

  return (
    <>
      <HelmetSEO title={`${label('invoice', true)} | PSR Operations`} description="Invoices" noindex={true} />

      <div className="space-y-4">
        <div className="flex justify-end">
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4" /> New {label('invoice')}
          </Button>
        </div>

        <Card bodyClassName="p-0">
          {error ? (
            <p className="p-6 text-sm text-red-500">Couldn't load {label('invoice', true).toLowerCase()}: {error.message}</p>
          ) : (
            <>
              <ReusableTable
                columns={columns}
                rows={pageItems}
                loading={loading}
                emptyMessage={`No ${label('invoice', true).toLowerCase()} yet.`}
                onRowClick={(row) => navigate(`/admin/invoices/${row.id}`)}
              />
              <div className="px-4">
                <Pagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} />
              </div>
            </>
          )}
        </Card>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={`New ${label('invoice')}`}>
        {formError ? (
          <p className="text-sm text-red-500">Couldn't load {label('work_item', true).toLowerCase()}: {formError.message}</p>
        ) : !formData ? (
          <Spinner />
        ) : (
          <ClientInvoiceForm
            tradeJobs={formData.tradeJobs}
            clients={formData.clients}
            invoicedJobIds={new Set((invoices || []).map((i) => String(i.trade_job_id)))}
            onSubmit={handleCreated}
            onCancel={() => setModalOpen(false)}
          />
        )}
      </Modal>
    </>
  )
}

export default Page
