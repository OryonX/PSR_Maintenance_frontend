import React, { useState, useEffect } from 'react'
import { navigate } from 'vike/client/router'
import { Plus } from 'lucide-react'
import HelmetSEO from '../../../seo/HelmetSEO.jsx'
import { clientInvoicesApi, tradeJobsApi, clientsApi } from '../../../adminpanel/lib/endpoints.js'
import { CLIENT_INVOICE_STATUSES, STATUS_TONE } from '../../../adminpanel/lib/constants.js'
import { formatGBP, invoiceErrorMessage, invoiceRecipientName } from '../../../adminpanel/lib/billing.js'
import { invoicedJobIdSet } from '../../../adminpanel/lib/lineItems.js'
import { useTenantConfig } from '../../../adminpanel/hooks/useTenantConfig.js'
import { usePagination } from '../../../adminpanel/hooks/usePagination.js'
import ReusableTable from '../../../adminpanel/components/Tables/ReusableTable.jsx'
import ClientInvoiceForm from '../../../adminpanel/components/Forms/ClientInvoiceForm.jsx'
import { useClientInvoiceActions, ClientInvoiceRowActions } from '../../../adminpanel/components/ClientInvoiceActions.jsx'
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

// Sent and past its due date, but not yet flagged overdue in the DB.
function isPastDue(invoice) {
  return invoice.status === 'sent' && invoice.due_date && new Date(invoice.due_date) < new Date()
}

const DONE_MESSAGE = {
  send: 'Invoice sent.',
  delete: 'Invoice deleted.',
  paid: 'Invoice marked as paid.',
  overdue: 'Invoice marked as overdue.',
  edit: 'Invoice updated.'
}

function Page() {
  const { label } = useTenantConfig()
  const [invoices, setInvoices] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [notice, setNotice] = useState(null) // { tone: 'success' | 'error', text }
  const [modalOpen, setModalOpen] = useState(false)
  const [formData, setFormData] = useState(null)
  const [formError, setFormError] = useState(null)

  const loadInvoices = ({ silent = false } = {}) => {
    if (!silent) setLoading(true)
    setError(null)
    clientInvoicesApi.list().then(setInvoices).catch(setError).finally(() => setLoading(false))
  }

  useEffect(() => { loadInvoices() }, [])

  const actions = useClientInvoiceActions({
    onDone: (type) => { setNotice({ tone: 'success', text: DONE_MESSAGE[type] }); loadInvoices({ silent: true }) },
    onError: (text) => setNotice({ tone: 'error', text })
  })

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
    setNotice({ tone: 'success', text: 'Invoice created as a draft.' })
    loadInvoices({ silent: true })
  }

  const filtered = invoices && statusFilter !== 'all' ? invoices.filter((i) => i.status === statusFilter) : invoices
  const { page, setPage, totalPages, total, pageItems } = usePagination(filtered, 15)

  const columns = [
    { key: 'invoice_number', label: label('invoice'), render: (row) => <span className="font-medium">{row.invoice_number}</span> },
    { key: 'client', label: label('client'), hideBelow: 'sm', render: (row) => invoiceRecipientName(row) },
    { key: 'amount', label: 'Amount', hideBelow: 'md', render: (row) => formatGBP(row.amount) },
    { key: 'status', label: 'Status', render: (row) => <Badge tone={STATUS_TONE[row.status] || 'grey'}>{row.status}</Badge> },
    { key: 'created_at', label: 'Issued', hideBelow: 'lg', render: (row) => formatDate(row.created_at) },
    { key: 'due_date', label: 'Due', hideBelow: 'lg', render: (row) => (
      <span className={isPastDue(row) ? 'text-red-600 font-medium' : ''}>{formatDate(row.due_date)}</span>
    ) },
    { key: 'actions', label: '', render: (row) => <ClientInvoiceRowActions invoice={row} actions={actions} /> }
  ]

  const loadErrorText = error?.body?.error === 'module_not_available'
    ? invoiceErrorMessage(error)
    : `Couldn't load ${label('invoice', true).toLowerCase()}: ${error?.message}`

  return (
    <>
      <HelmetSEO title={`${label('invoice', true)} | PSR Operations`} description="Invoices" noindex={true} />

      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {['all', ...CLIENT_INVOICE_STATUSES].map((status) => (
            <button
              key={status}
              onClick={() => { setStatusFilter(status); setPage(1) }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                statusFilter === status ? 'bg-navy-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {status}
            </button>
          ))}
          <Button className="ml-auto" onClick={openCreate}>
            <Plus className="w-4 h-4" /> New {label('invoice')}
          </Button>
        </div>

        {notice && (
          <div className={`flex items-start justify-between gap-3 text-sm rounded-lg px-4 py-3 border ${
            notice.tone === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-600'
          }`}>
            <span>{notice.text}</span>
            <button onClick={() => setNotice(null)} className="opacity-60 hover:opacity-100" aria-label="Dismiss">×</button>
          </div>
        )}

        <Card bodyClassName="p-0">
          {error ? (
            <p className="p-6 text-sm text-red-500">{loadErrorText}</p>
          ) : (
            <>
              <ReusableTable
                columns={columns}
                rows={pageItems}
                loading={loading}
                emptyMessage={invoices?.length
                  ? `No ${statusFilter} ${label('invoice', true).toLowerCase()}.`
                  : `No ${label('invoice', true).toLowerCase()} yet.`}
                onRowClick={(row) => navigate(`/admin/invoices/${row.id}`)}
              />
              <div className="px-4">
                <Pagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} />
              </div>
            </>
          )}
        </Card>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={`New ${label('invoice')}`} size="xl">
        {formError ? (
          <p className="text-sm text-red-500">Couldn't load {label('work_item', true).toLowerCase()}: {formError.message}</p>
        ) : !formData ? (
          <Spinner />
        ) : (
          <ClientInvoiceForm
            tradeJobs={formData.tradeJobs}
            clients={formData.clients}
            invoicedJobIds={invoicedJobIdSet(invoices)}
            onSubmit={handleCreated}
            onCancel={() => setModalOpen(false)}
          />
        )}
      </Modal>

      {actions.modals}
    </>
  )
}

export default Page
