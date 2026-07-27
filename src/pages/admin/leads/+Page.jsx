import React, { useState, useEffect } from 'react'
import { navigate } from 'vike/client/router'
import HelmetSEO from '../../../seo/HelmetSEO.jsx'
import { leadsApi } from '../../../adminpanel/lib/endpoints.js'
import { LEAD_STATUSES, STATUS_TONE } from '../../../adminpanel/lib/constants.js'
import { useTenantConfig } from '../../../adminpanel/hooks/useTenantConfig.js'
import { usePagination } from '../../../adminpanel/hooks/usePagination.js'
import ReusableTable from '../../../adminpanel/components/Tables/ReusableTable.jsx'
import Pagination from '../../../ui/Pagination.jsx'
import Badge from '../../../ui/Badge.jsx'
import Card from '../../../ui/Card.jsx'

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function Page() {
  const { label } = useTenantConfig()
  const [leads, setLeads] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    leadsApi.list(statusFilter !== 'all' ? { status: statusFilter } : undefined)
      .then((data) => { if (!cancelled) setLeads(data) })
      .catch((err) => { if (!cancelled) setError(err) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [statusFilter])

  const { page, setPage, totalPages, total, pageItems } = usePagination(leads, 15)

  const columns = [
    { key: 'name', label: label('lead'), render: (row) => <span className="font-medium">{row.name}</span> },
    { key: 'contact', label: 'Contact', hideBelow: 'sm', render: (row) => row.phone || row.email || '—' },
    { key: 'channel', label: 'Channel', hideBelow: 'md', render: (row) => <span className="capitalize">{row.channel || '—'}</span> },
    { key: 'status', label: 'Status', render: (row) => <Badge tone={STATUS_TONE[row.status] || 'grey'}>{row.status}</Badge> },
    { key: 'created_at', label: 'Created', hideBelow: 'lg', render: (row) => formatDate(row.created_at) }
  ]

  return (
    <>
      <HelmetSEO title={`${label('lead', true)} | PSR Operations`} description="Leads" noindex={true} />

      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {['all', ...LEAD_STATUSES].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                statusFilter === status ? 'bg-navy-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <Card bodyClassName="p-0">
          {error ? (
            <p className="p-6 text-sm text-red-500">Couldn't load {label('lead', true).toLowerCase()}: {error.message}</p>
          ) : (
            <>
              <ReusableTable
                columns={columns}
                rows={pageItems}
                loading={loading}
                emptyMessage={`No ${label('lead', true).toLowerCase()} yet.`}
                onRowClick={(row) => navigate(`/admin/leads/${row.id}`)}
              />
              <div className="px-4">
                <Pagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} />
              </div>
            </>
          )}
        </Card>
      </div>
    </>
  )
}

export default Page
