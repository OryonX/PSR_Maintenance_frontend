import React, { useState, useEffect } from 'react'
import { navigate } from 'vike/client/router'
import { Plus } from 'lucide-react'
import HelmetSEO from '../../../seo/HelmetSEO.jsx'
import { quotesApi, leadsApi } from '../../../adminpanel/lib/endpoints.js'
import { STATUS_TONE } from '../../../adminpanel/lib/constants.js'
import { useTenantConfig } from '../../../adminpanel/hooks/useTenantConfig.js'
import { usePagination } from '../../../adminpanel/hooks/usePagination.js'
import QuoteForm from '../../../adminpanel/components/Forms/QuoteForm.jsx'
import ReusableTable from '../../../adminpanel/components/Tables/ReusableTable.jsx'
import Pagination from '../../../ui/Pagination.jsx'
import Badge from '../../../ui/Badge.jsx'
import Card from '../../../ui/Card.jsx'
import Button from '../../../ui/Button.jsx'
import Modal from '../../../ui/Modal.jsx'

function formatAmount(quote) {
  if (quote.amount_fixed) return `£${Number(quote.amount_fixed).toLocaleString()}`
  if (quote.amount_min || quote.amount_max) return `£${quote.amount_min ?? 0}–£${quote.amount_max ?? '?'}`
  return '—'
}

function Page() {
  const { label } = useTenantConfig()
  const [quotes, setQuotes] = useState(null)
  const [leads, setLeads] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  const load = () => {
    setLoading(true)
    quotesApi.list().then(setQuotes).catch(setError).finally(() => setLoading(false))
  }

  useEffect(load, [])
  useEffect(() => { leadsApi.list().then(setLeads).catch(() => setLeads([])) }, [])

  const { page, setPage, totalPages, total, pageItems } = usePagination(quotes, 15)

  const columns = [
    { key: 'quote_number', label: label('quote'), render: (row) => <span className="font-medium">{row.quote_number}</span> },
    { key: 'lead', label: label('lead'), hideBelow: 'sm', render: (row) => row.lead?.name || '—' },
    { key: 'amount', label: 'Amount', hideBelow: 'md', render: formatAmount },
    { key: 'status', label: 'Status', render: (row) => <Badge tone={STATUS_TONE[row.status] || 'grey'}>{row.status}</Badge> }
  ]

  const handleCreate = async (body) => {
    await quotesApi.create(body)
    setModalOpen(false)
    load()
  }

  return (
    <>
      <HelmetSEO title={`${label('quote', true)} | PSR Operations`} description="Quotes" noindex={true} />

      <div className="space-y-4">
        <div className="flex justify-end">
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="w-4 h-4" /> New {label('quote')}
          </Button>
        </div>

        <Card bodyClassName="p-0">
          {error ? (
            <p className="p-6 text-sm text-red-500">Couldn't load {label('quote', true).toLowerCase()}: {error.message}</p>
          ) : (
            <>
              <ReusableTable
                columns={columns}
                rows={pageItems}
                loading={loading}
                emptyMessage={`No ${label('quote', true).toLowerCase()} yet.`}
                onRowClick={(row) => navigate(`/admin/quotes/${row.id}`)}
              />
              <div className="px-4">
                <Pagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} />
              </div>
            </>
          )}
        </Card>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={`New ${label('quote')}`}>
        <QuoteForm leads={leads || []} onSubmit={handleCreate} onCancel={() => setModalOpen(false)} submitLabel="Create" />
      </Modal>
    </>
  )
}

export default Page
