import React, { useState, useEffect } from 'react'
import { navigate } from 'vike/client/router'
import { Phone, Send, Check, X, Clock, RefreshCw } from 'lucide-react'
import HelmetSEO from '../../../seo/HelmetSEO.jsx'
import { quotesApi } from '../../../adminpanel/lib/endpoints.js'
import { STATUS_TONE } from '../../../adminpanel/lib/constants.js'
import { formatGBP } from '../../../adminpanel/lib/billing.js'
import {
  CHASE_AFTER_DAYS, awaitingReply, daysSinceSent, daysToExpiry, formatDay, quoteValue, todayISO
} from '../../../adminpanel/lib/followUp.js'
import { useTenantConfig } from '../../../adminpanel/hooks/useTenantConfig.js'
import { usePagination } from '../../../adminpanel/hooks/usePagination.js'
import { useQuoteActions, quoteSendLabel } from '../../../adminpanel/components/QuoteActions.jsx'
import StatTile, { FilterTabs } from '../../../adminpanel/components/StatTile.jsx'
import ReusableTable from '../../../adminpanel/components/Tables/ReusableTable.jsx'
import Pagination from '../../../ui/Pagination.jsx'
import Badge from '../../../ui/Badge.jsx'
import Card from '../../../ui/Card.jsx'
import Button from '../../../ui/Button.jsx'

function priceLabel(q) {
  if (q.amount_fixed != null) return formatGBP(q.amount_fixed)
  if (q.amount_min != null || q.amount_max != null) {
    return [q.amount_min, q.amount_max].filter((v) => v != null).map(formatGBP).join('–')
  }
  return 'No price'
}

function Page() {
  const { label } = useTenantConfig()
  const [quotes, setQuotes] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [view, setView] = useState('awaiting')
  const [notice, setNotice] = useState(null) // { tone, text }
  const [busyId, setBusyId] = useState(null)

  const load = ({ silent = false } = {}) => {
    if (!silent) setLoading(true)
    setError(null)
    return quotesApi.list().then(setQuotes).catch(setError).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const actions = useQuoteActions({
    label,
    onDone: () => { setNotice({ tone: 'success', text: `${label('quote')} sent.` }); load({ silent: true }) },
    onError: (text) => setNotice({ tone: 'error', text })
  })

  const setStatus = async (quote, status) => {
    setBusyId(quote.id)
    try {
      await quotesApi.updateStatus(quote.id, status)
      setNotice({ tone: 'success', text: `${quote.quote_number} marked as ${status}.` })
      await load({ silent: true })
    } catch (err) {
      setNotice({ tone: 'error', text: err.message })
    } finally {
      setBusyId(null)
    }
  }

  const today = todayISO()
  const all = quotes || []
  const awaiting = all.filter(awaitingReply)
  const groups = {
    awaiting,
    chase: awaiting.filter((q) => (daysSinceSent(q, today) ?? 0) >= CHASE_AFTER_DAYS),
    expiring: awaiting.filter((q) => { const d = daysToExpiry(q, today); return d != null && d >= 0 && d <= 7 }),
    expired: awaiting.filter((q) => { const d = daysToExpiry(q, today); return d != null && d < 0 }),
    drafts: all.filter((q) => q.status === 'draft')
  }

  // Most urgent first: closest (or past) expiry, then the longest without an answer.
  const rows = (groups[view] || []).slice().sort((a, b) => {
    const ea = daysToExpiry(a, today) ?? 9999
    const eb = daysToExpiry(b, today) ?? 9999
    if (ea !== eb) return ea - eb
    return (daysSinceSent(b, today) ?? 0) - (daysSinceSent(a, today) ?? 0)
  })

  const { page, setPage, totalPages, total, pageItems } = usePagination(rows, 15)

  const btn = 'inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-40'
  const stop = (fn) => (e) => { e.stopPropagation(); fn() }

  const sentCell = (q) => {
    const days = daysSinceSent(q, today)
    if (days == null) return <span className="text-xs text-gray-400">Not sent</span>
    return (
      <div>
        <p className="text-navy-900">{formatDay(q.sent_at)}</p>
        <p className={`text-xs ${days >= CHASE_AFTER_DAYS ? 'font-semibold text-amber-700' : 'text-gray-500'}`}>
          {days === 0 ? 'Today' : `${days} day${days === 1 ? '' : 's'} ago`}
        </p>
      </div>
    )
  }

  const expiryCell = (q) => {
    const d = daysToExpiry(q, today)
    if (d == null) return <span className="text-xs text-gray-400">No expiry</span>
    return (
      <div>
        <p className="text-navy-900">{formatDay(q.expires_at)}</p>
        {d < 0 && <Badge tone="red">expired {-d}d ago</Badge>}
        {d >= 0 && d <= 7 && <Badge tone="amber">{d === 0 ? 'expires today' : `in ${d} day${d === 1 ? '' : 's'}`}</Badge>}
      </div>
    )
  }

  const columns = [
    { key: 'quote_number', label: label('quote'), render: (q) => (
      <div>
        <p className="font-semibold text-navy-900">{q.quote_number}</p>
        <p className="text-xs text-gray-500 sm:hidden">{q.lead?.name || '—'}</p>
      </div>
    ) },
    { key: 'lead', label: label('lead'), hideBelow: 'sm', render: (q) => (
      <div className="min-w-0">
        <p className="text-navy-900 truncate">{q.lead?.name || '—'}</p>
        <p className="text-xs text-gray-500 truncate">{q.lead?.phone || q.lead?.email || 'No contact details'}</p>
      </div>
    ) },
    { key: 'amount', label: 'Value', render: (q) => <span className={`tabular-nums ${quoteValue(q) ? 'font-semibold' : 'text-amber-700 text-xs'}`}>{priceLabel(q)}</span> },
    { key: 'sent_at', label: 'Sent', hideBelow: 'md', render: sentCell },
    { key: 'expires_at', label: 'Expires', hideBelow: 'lg', render: expiryCell },
    { key: 'actions', label: '', render: (q) => {
      const sendLabel = quoteSendLabel(q)
      const isExpired = (daysToExpiry(q, today) ?? 1) < 0
      return (
        <div className="flex flex-wrap items-center justify-end gap-1">
          {q.lead?.phone && (
            <a href={`tel:${q.lead.phone}`} onClick={(e) => e.stopPropagation()} title={`Call ${q.lead.phone}`} className={`${btn} text-navy-900 hover:bg-gray-100`}>
              <Phone className="w-4 h-4" /><span className="hidden xl:inline">Call</span>
            </a>
          )}
          {sendLabel && (
            <button title={sendLabel} className={`${btn} text-sky-700 hover:bg-sky-50`} onClick={stop(() => actions.openSend(q))}>
              <Send className="w-4 h-4" /><span className="hidden xl:inline">{sendLabel}</span>
            </button>
          )}
          {q.status === 'sent' && (
            <>
              <button title="Customer accepted" disabled={busyId === q.id} className={`${btn} text-green-700 hover:bg-green-50`} onClick={stop(() => setStatus(q, 'accepted'))}>
                <Check className="w-4 h-4" /><span className="hidden xl:inline">Accepted</span>
              </button>
              <button title="Customer declined" disabled={busyId === q.id} className={`${btn} text-red-600 hover:bg-red-50`} onClick={stop(() => setStatus(q, 'rejected'))}>
                <X className="w-4 h-4" /><span className="hidden xl:inline">Rejected</span>
              </button>
              {isExpired && (
                <button title="Mark as expired" disabled={busyId === q.id} className={`${btn} text-gray-600 hover:bg-gray-100`} onClick={stop(() => setStatus(q, 'expired'))}>
                  <Clock className="w-4 h-4" /><span className="hidden xl:inline">Expired</span>
                </button>
              )}
            </>
          )}
        </div>
      )
    } }
  ]

  const tabs = [
    { key: 'awaiting', label: 'Awaiting reply', count: groups.awaiting.length },
    { key: 'chase', label: `No answer ${CHASE_AFTER_DAYS}+ days`, count: groups.chase.length },
    { key: 'expiring', label: 'Expiring this week', count: groups.expiring.length },
    { key: 'expired', label: 'Expired, no answer', count: groups.expired.length },
    { key: 'drafts', label: 'Drafts not sent', count: groups.drafts.length }
  ]

  const EMPTY = {
    awaiting: `No ${label('quote', true).toLowerCase()} waiting for an answer.`,
    chase: 'Nobody to chase — every sent quote is recent.',
    expiring: 'Nothing expires in the next 7 days.',
    expired: 'No expired quotes left without an answer.',
    drafts: 'No drafts waiting to be sent.'
  }

  return (
    <>
      <HelmetSEO title="Quote follow-up | PSR Operations" description="Quotes waiting for an answer" noindex={true} />

      <div className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-navy-900">Quote follow-up</h2>
            <p className="text-sm text-gray-500">Sent {label('quote', true).toLowerCase()} without an answer, most urgent first — call, resend or record the outcome.</p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => load({ silent: true })}>
            <RefreshCw className="w-4 h-4" /> Refresh
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

        {error ? (
          <Card><p className="text-sm text-red-500">Couldn't load {label('quote', true).toLowerCase()}: {error.message}</p></Card>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <StatTile label="Awaiting reply" value={groups.awaiting.length} sub={`${formatGBP(groups.awaiting.reduce((s, q) => s + quoteValue(q), 0))} potential`} onClick={() => setView('awaiting')} active={view === 'awaiting'} />
              <StatTile label={`No answer ${CHASE_AFTER_DAYS}+ days`} tone="amber" value={groups.chase.length} sub="Worth a call" onClick={() => setView('chase')} active={view === 'chase'} />
              <StatTile label="Expiring this week" tone="red" value={groups.expiring.length} sub={`${formatGBP(groups.expiring.reduce((s, q) => s + quoteValue(q), 0))} at stake`} onClick={() => setView('expiring')} active={view === 'expiring'} />
              <StatTile label="Drafts not sent" tone="blue" value={groups.drafts.length} sub="Prepared but not sent" onClick={() => setView('drafts')} active={view === 'drafts'} />
            </div>

            <FilterTabs tabs={tabs} value={view} onChange={(key) => { setView(key); setPage(1) }} />

            <Card bodyClassName="p-0">
              <ReusableTable
                columns={columns}
                rows={pageItems}
                loading={loading}
                emptyMessage={EMPTY[view]}
                onRowClick={(q) => navigate(`/admin/quotes/${q.id}`)}
              />
              <div className="px-4">
                <Pagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} />
              </div>
            </Card>

            <p className="text-xs text-gray-400">
              Values use the fixed price or the top of the range. Accepting a quote doesn't create the {label('work_item').toLowerCase()} — schedule it from {label('work_item', true)}.
            </p>
          </>
        )}
      </div>

      {actions.modals}
    </>
  )
}

export default Page
