import React, { useState, useEffect, useRef } from 'react'
import { navigate } from 'vike/client/router'
import { Download, BellRing, CheckCircle2, RefreshCw } from 'lucide-react'
import HelmetSEO from '../../../seo/HelmetSEO.jsx'
import { clientInvoicesApi } from '../../../adminpanel/lib/endpoints.js'
import { STATUS_TONE } from '../../../adminpanel/lib/constants.js'
import { formatGBP, invoiceRecipientName } from '../../../adminpanel/lib/billing.js'
import {
  AGING_BUCKETS, agingBucket, daysOverdue, formatDay, isUnpaid, shouldBeOverdue, sumAmounts, todayISO, dateOnly
} from '../../../adminpanel/lib/followUp.js'
import { useTenantConfig } from '../../../adminpanel/hooks/useTenantConfig.js'
import { usePagination } from '../../../adminpanel/hooks/usePagination.js'
import { useClientInvoiceActions } from '../../../adminpanel/components/ClientInvoiceActions.jsx'
import StatTile, { FilterTabs } from '../../../adminpanel/components/StatTile.jsx'
import ReusableTable from '../../../adminpanel/components/Tables/ReusableTable.jsx'
import Pagination from '../../../ui/Pagination.jsx'
import Badge from '../../../ui/Badge.jsx'
import Card from '../../../ui/Card.jsx'
import Button from '../../../ui/Button.jsx'

const DONE_MESSAGE = {
  send: 'Reminder sent — the invoice was emailed again.',
  paid: 'Invoice marked as paid.'
}

function Page() {
  const { label } = useTenantConfig()
  const [invoices, setInvoices] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [bucket, setBucket] = useState('all')
  const [notice, setNotice] = useState(null) // { tone, text }
  const autoChecked = useRef(false)

  const load = ({ silent = false } = {}) => {
    if (!silent) setLoading(true)
    setError(null)
    return clientInvoicesApi.list().then(setInvoices).catch(setError).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  // No scheduled job flags overdue invoices server-side yet, so opening this
  // view does it: every sent invoice past its due date is moved to overdue
  // (once per visit). That status is what allows a reminder to be sent.
  useEffect(() => {
    if (!invoices || autoChecked.current) return
    autoChecked.current = true
    const today = todayISO()
    const stale = invoices.filter((inv) => shouldBeOverdue(inv, today))
    if (stale.length === 0) return
    Promise.allSettled(stale.map((inv) => clientInvoicesApi.update(inv.id, { status: 'overdue' }))).then((results) => {
      const moved = results.filter((r) => r.status === 'fulfilled').length
      if (moved > 0) {
        setNotice({ tone: 'info', text: `${moved} invoice${moved === 1 ? ' was' : 's were'} past the due date and moved to overdue.` })
        load({ silent: true })
      }
    })
  }, [invoices])

  const actions = useClientInvoiceActions({
    onDone: (type) => { setNotice({ tone: 'success', text: DONE_MESSAGE[type] || 'Done.' }); load({ silent: true }) },
    onError: (text) => setNotice({ tone: 'error', text })
  })

  const today = todayISO()
  const unpaid = (invoices || []).filter(isUnpaid)
  const byBucket = Object.fromEntries(AGING_BUCKETS.map((b) => [b.key, unpaid.filter((inv) => agingBucket(inv, today) === b.key)]))
  const overdue = unpaid.filter((inv) => agingBucket(inv, today) !== 'current')
  const dueSoon = byBucket.current.filter((inv) => {
    const d = daysOverdue(inv, today)
    return d != null && d >= -7
  })
  const monthPrefix = today.slice(0, 7)
  const collected = (invoices || []).filter((inv) => inv.status === 'paid' && dateOnly(inv.paid_at)?.startsWith(monthPrefix))

  const totalUnpaid = sumAmounts(unpaid)
  const rows = (bucket === 'all' ? unpaid : bucket === 'overdue' ? overdue : bucket === 'soon' ? dueSoon : byBucket[bucket] || [])
    .slice()
    .sort((a, b) => (daysOverdue(b, today) ?? -9999) - (daysOverdue(a, today) ?? -9999))

  const { page, setPage, totalPages, total, pageItems } = usePagination(rows, 15)

  const iconBtn = 'inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-40'
  const stop = (fn) => (e) => { e.stopPropagation(); fn() }

  const dueCell = (inv) => {
    const days = daysOverdue(inv, today)
    return (
      <div>
        <p className="text-navy-900">{formatDay(inv.due_date)}</p>
        {days != null && days > 0 && <p className="text-xs font-semibold text-red-600">{days} day{days === 1 ? '' : 's'} overdue</p>}
        {days != null && days <= 0 && days >= -7 && <p className="text-xs text-amber-600">Due in {-days} day{days === -1 ? '' : 's'}</p>}
        {days == null && <p className="text-xs text-gray-400">No due date</p>}
      </div>
    )
  }

  const columns = [
    { key: 'invoice_number', label: label('invoice'), render: (row) => (
      <div>
        <p className="font-semibold text-navy-900">{row.invoice_number}</p>
        <p className="text-xs text-gray-500 sm:hidden">{invoiceRecipientName(row)}</p>
      </div>
    ) },
    { key: 'client', label: label('client'), hideBelow: 'sm', render: (row) => invoiceRecipientName(row) },
    { key: 'amount', label: 'Amount', render: (row) => <span className="font-semibold tabular-nums">{formatGBP(row.amount)}</span> },
    { key: 'due_date', label: 'Due', hideBelow: 'md', render: dueCell },
    { key: 'status', label: 'Status', hideBelow: 'lg', render: (row) => <Badge tone={STATUS_TONE[row.status] || 'grey'}>{row.status}</Badge> },
    { key: 'actions', label: '', render: (row) => (
      <div className="flex items-center justify-end gap-1">
        <button title="Download PDF" className={`${iconBtn} text-gray-500 hover:bg-gray-100`} disabled={actions.pdfBusyId === row.id} onClick={stop(() => actions.pdf(row))}>
          <Download className="w-4 h-4" />
        </button>
        {row.status === 'overdue' && (
          <button title="Email the invoice again as a reminder" className={`${iconBtn} text-amber-700 hover:bg-amber-50`} onClick={stop(() => actions.open('send', row))}>
            <BellRing className="w-4 h-4" /><span className="hidden lg:inline">Remind</span>
          </button>
        )}
        <button title="Mark as paid" className={`${iconBtn} text-green-700 hover:bg-green-50`} onClick={stop(() => actions.open('paid', row))}>
          <CheckCircle2 className="w-4 h-4" /><span className="hidden lg:inline">Paid</span>
        </button>
      </div>
    ) }
  ]

  const tabs = [
    { key: 'all', label: 'All unpaid', count: unpaid.length },
    { key: 'overdue', label: 'All overdue', count: overdue.length },
    { key: 'soon', label: 'Due in 7 days', count: dueSoon.length },
    ...AGING_BUCKETS.map((b) => ({ key: b.key, label: b.short, count: byBucket[b.key].length }))
  ]

  return (
    <>
      <HelmetSEO title="Receivables | PSR Operations" description="Unpaid invoices by age" noindex={true} />

      <div className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-navy-900">Receivables</h2>
            <p className="text-sm text-gray-500">Money owed on issued {label('invoice', true).toLowerCase()}, by how late it is.</p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => load({ silent: true })}>
            <RefreshCw className="w-4 h-4" /> Refresh
          </Button>
        </div>

        {notice && (
          <div className={`flex items-start justify-between gap-3 text-sm rounded-lg px-4 py-3 border ${
            notice.tone === 'success' ? 'bg-green-50 border-green-200 text-green-700'
              : notice.tone === 'error' ? 'bg-red-50 border-red-200 text-red-600'
                : 'bg-sky-50 border-sky-200 text-sky-800'
          }`}>
            <span>{notice.text}</span>
            <button onClick={() => setNotice(null)} className="opacity-60 hover:opacity-100" aria-label="Dismiss">×</button>
          </div>
        )}

        {error ? (
          <Card><p className="text-sm text-red-500">Couldn't load {label('invoice', true).toLowerCase()}: {error.message}</p></Card>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <StatTile label="Outstanding" value={formatGBP(totalUnpaid)} sub={`${unpaid.length} unpaid ${label('invoice', unpaid.length !== 1).toLowerCase()}`} onClick={() => setBucket('all')} active={bucket === 'all'} />
              <StatTile label="Overdue" tone="red" value={formatGBP(sumAmounts(overdue))} sub={`${overdue.length} past the due date`} onClick={() => setBucket('overdue')} active={bucket === 'overdue'} />
              <StatTile label="Due in 7 days" tone="amber" value={formatGBP(sumAmounts(dueSoon))} sub={`${dueSoon.length} coming up`} onClick={() => setBucket('soon')} active={bucket === 'soon'} />
              <StatTile label="Collected this month" tone="green" value={formatGBP(sumAmounts(collected))} sub={`${collected.length} paid`} />
            </div>

            <Card title="Ageing" bodyClassName="px-6 pb-6 pt-3">
              {totalUnpaid > 0 ? (
                <>
                  <div className="flex h-3 w-full overflow-hidden rounded-full bg-gray-100" role="img" aria-label="Share of outstanding money by age">
                    {AGING_BUCKETS.map((b) => {
                      const share = sumAmounts(byBucket[b.key]) / totalUnpaid
                      return share > 0 ? <div key={b.key} className={b.bar} style={{ width: `${share * 100}%` }} title={`${b.label}: ${formatGBP(sumAmounts(byBucket[b.key]))}`} /> : null
                    })}
                  </div>
                  <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {AGING_BUCKETS.map((b) => (
                      <button
                        key={b.key}
                        type="button"
                        onClick={() => setBucket(b.key)}
                        className={`text-left rounded-lg px-3 py-2 transition-colors ${bucket === b.key ? 'bg-navy-900/5' : 'hover:bg-gray-50'}`}
                      >
                        <span className="flex items-center gap-2 text-xs font-medium text-gray-500">
                          <span className={`w-2.5 h-2.5 rounded-sm ${b.bar}`} />{b.label}
                        </span>
                        <span className="block mt-0.5 text-base font-bold text-navy-900 tabular-nums">{formatGBP(sumAmounts(byBucket[b.key]))}</span>
                        <span className="block text-xs text-gray-400">{byBucket[b.key].length} {label('invoice', byBucket[b.key].length !== 1).toLowerCase()}</span>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-500">{loading ? 'Loading…' : 'Nothing outstanding — every issued invoice is paid.'}</p>
              )}
            </Card>

            <FilterTabs tabs={tabs} value={bucket} onChange={(key) => { setBucket(key); setPage(1) }} />

            <Card bodyClassName="p-0">
              <ReusableTable
                columns={columns}
                rows={pageItems}
                loading={loading}
                emptyMessage={bucket === 'all' ? 'No unpaid invoices.' : 'No invoices in this group.'}
                onRowClick={(row) => navigate(`/admin/invoices/${row.id}`)}
              />
              <div className="px-4">
                <Pagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} />
              </div>
            </Card>

            <p className="text-xs text-gray-400">
              Opening this page moves sent {label('invoice', true).toLowerCase()} past their due date to overdue. “Remind” emails the invoice PDF to the customer again.
            </p>
          </>
        )}
      </div>

      {actions.modals}
    </>
  )
}

export default Page
