import React, { useState, useEffect } from 'react'
import { navigate } from 'vike/client/router'
import { Inbox, FileText, Wrench, Receipt, CheckCircle2, Send, CalendarClock, PoundSterling } from 'lucide-react'
import { leadsApi, quotesApi, tradeJobsApi, clientInvoicesApi } from '../lib/endpoints.js'
import { STATUS_TONE } from '../lib/constants.js'
import { formatGBP } from '../lib/billing.js'
import { jobTitle } from '../lib/jobs.js'
import { formatDay, isUnpaid, quoteValue, sumAmounts } from '../lib/followUp.js'
import { useTenantConfig } from '../hooks/useTenantConfig.js'
import StatTile, { FilterTabs } from './StatTile.jsx'
import Card from '../../ui/Card.jsx'
import Badge from '../../ui/Badge.jsx'
import Spinner from '../../ui/Spinner.jsx'

const TIMELINE_LIMIT = 10

// The API has no per-customer endpoints, so the history is joined here:
// leads → customer (lead.client_id), quotes/jobs → lead, invoices → customer
// or to one of those jobs. Fine at PSR's volume; a dedicated endpoint would
// be the next step if lists grow large.
function useClientHistory(clientId) {
  const [state, setState] = useState({ loading: true, data: null, failed: [] })

  useEffect(() => {
    let cancelled = false
    const sources = { leads: leadsApi.list(), quotes: quotesApi.list(), jobs: tradeJobsApi.list(), invoices: clientInvoicesApi.list() }
    Promise.allSettled(Object.values(sources)).then((results) => {
      if (cancelled) return
      const keys = Object.keys(sources)
      const got = Object.fromEntries(keys.map((k, i) => [k, results.at(i).status === 'fulfilled' ? results.at(i).value || [] : []]))
      const failed = keys.filter((k, i) => results.at(i).status === 'rejected')

      const leads = got.leads.filter((l) => String(l.client_id) === String(clientId))
      const leadIds = new Set(leads.map((l) => String(l.id)))
      const quotes = got.quotes.filter((q) => leadIds.has(String(q.lead_id)))
      const jobs = got.jobs.filter((j) => leadIds.has(String(j.lead_id)))
      const jobIds = new Set(jobs.map((j) => String(j.id)))
      const invoices = got.invoices.filter((i) => String(i.client_id) === String(clientId) || jobIds.has(String(i.trade_job_id)))

      setState({ loading: false, data: { leads, quotes, jobs, invoices }, failed })
    })
    return () => { cancelled = true }
  }, [clientId])

  return state
}

function buildTimeline({ leads, quotes, jobs, invoices }, { label, serviceInfo }) {
  const events = []
  const add = (date, icon, tone, text, href) => { if (date) events.push({ date, icon, tone, text, href }) }

  leads.forEach((l) => add(l.created_at, Inbox, 'blue', `${label('lead')} received${l.challenge ? ` — ${l.challenge}` : ''}`, `/admin/leads/${l.id}`))
  quotes.forEach((q) => {
    add(q.sent_at, Send, 'blue', `${q.quote_number} sent (${formatGBP(quoteValue(q))})`, `/admin/quotes/${q.id}`)
    if (q.status === 'accepted') add(q.accepted_at || q.updated_at, CheckCircle2, 'green', `${q.quote_number} accepted`, `/admin/quotes/${q.id}`)
    if (q.status === 'rejected') add(q.updated_at, FileText, 'red', `${q.quote_number} rejected`, `/admin/quotes/${q.id}`)
    if (!q.sent_at) add(q.created_at, FileText, 'grey', `${q.quote_number} drafted`, `/admin/quotes/${q.id}`)
  })
  jobs.forEach((j) => {
    add(j.starts_at || j.scheduled_date, CalendarClock, 'blue', `${jobTitle(j, serviceInfo)} scheduled`, `/admin/jobs/${j.id}`)
    add(j.completed_at, Wrench, 'green', `${jobTitle(j, serviceInfo)} completed`, `/admin/jobs/${j.id}`)
  })
  invoices.forEach((i) => {
    add(i.sent_at, Receipt, 'blue', `${i.invoice_number} sent (${formatGBP(i.amount)})`, `/admin/invoices/${i.id}`)
    add(i.paid_at, PoundSterling, 'green', `${i.invoice_number} paid (${formatGBP(i.amount)})`, `/admin/invoices/${i.id}`)
  })

  return events.sort((a, b) => new Date(b.date) - new Date(a.date))
}

const DOT = { blue: 'bg-sky-100 text-sky-700', green: 'bg-green-100 text-green-700', red: 'bg-red-100 text-red-700', grey: 'bg-gray-100 text-gray-500' }

function RecordList({ items, render, empty }) {
  if (items.length === 0) return <p className="px-6 py-8 text-sm text-gray-500 text-center">{empty}</p>
  return <ul className="divide-y divide-gray-50">{items.map(render)}</ul>
}

function Row({ href, title, sub, right }) {
  return (
    <li>
      <button type="button" onClick={() => navigate(href)} className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-surface-light transition-colors">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-navy-900 truncate">{title}</p>
          {sub && <p className="text-xs text-gray-500 truncate">{sub}</p>}
        </div>
        <div className="flex-shrink-0 flex items-center gap-2">{right}</div>
      </button>
    </li>
  )
}

/** Customer 360: money, everything that happened, and every record — on the customer page. */
function ClientHistory({ clientId }) {
  const { label, serviceInfo } = useTenantConfig()
  const { loading, data, failed } = useClientHistory(clientId)
  const [tab, setTab] = useState('invoices')
  const [showAll, setShowAll] = useState(false)

  if (loading) return <Card><Spinner label="Loading history…" /></Card>

  const { leads, quotes, jobs, invoices } = data
  const issued = invoices.filter((i) => i.status !== 'draft')
  const paid = invoices.filter((i) => i.status === 'paid')
  const unpaid = invoices.filter(isUnpaid)
  const overdue = invoices.filter((i) => i.status === 'overdue')
  const completedJobs = jobs.filter((j) => j.completed_at)
  const timeline = buildTimeline(data, { label, serviceInfo })
  const shown = showAll ? timeline : timeline.slice(0, TIMELINE_LIMIT)

  const tabs = [
    { key: 'invoices', label: label('invoice', true), count: invoices.length },
    { key: 'jobs', label: label('work_item', true), count: jobs.length },
    { key: 'quotes', label: label('quote', true), count: quotes.length },
    { key: 'leads', label: 'Requests', count: leads.length }
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatTile label="Total invoiced" value={formatGBP(sumAmounts(issued))} sub={`${issued.length} issued ${label('invoice', issued.length !== 1).toLowerCase()}`} />
        <StatTile label="Paid" tone="green" value={formatGBP(sumAmounts(paid))} sub={`${paid.length} paid`} />
        <StatTile label="Outstanding" tone={overdue.length ? 'red' : 'amber'} value={formatGBP(sumAmounts(unpaid))} sub={overdue.length ? `${overdue.length} overdue` : 'Nothing overdue'} />
        <StatTile label={label('work_item', true)} tone="blue" value={jobs.length} sub={`${completedJobs.length} completed`} />
      </div>

      {failed.length > 0 && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          Some history couldn't be loaded ({failed.join(', ')}), so the figures may be incomplete.
        </p>
      )}

      <div className="grid lg:grid-cols-5 gap-4">
        <Card title="Activity" className="lg:col-span-2" bodyClassName="px-6 pb-5 pt-3">
          {timeline.length === 0 ? (
            <p className="text-sm text-gray-500">No activity linked to this {label('client').toLowerCase()} yet. History appears once a {label('lead').toLowerCase()} is converted into this {label('client').toLowerCase()}.</p>
          ) : (
            <>
              <ol className="relative border-l border-gray-100 ml-3 space-y-4">
                {shown.map((ev, idx) => {
                  const Icon = ev.icon
                  return (
                    <li key={idx} className="ml-5">
                      <span className={`absolute -left-3 flex items-center justify-center w-6 h-6 rounded-full ring-4 ring-white ${DOT[ev.tone]}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </span>
                      <a href={ev.href} className="block text-sm text-navy-900 hover:underline line-clamp-2">{ev.text}</a>
                      <p className="text-xs text-gray-400">{formatDay(ev.date)}</p>
                    </li>
                  )
                })}
              </ol>
              {timeline.length > TIMELINE_LIMIT && (
                <button type="button" onClick={() => setShowAll((v) => !v)} className="mt-4 text-xs font-semibold text-navy-900 hover:underline">
                  {showAll ? 'Show less' : `Show all ${timeline.length} events`}
                </button>
              )}
            </>
          )}
        </Card>

        <Card className="lg:col-span-3" bodyClassName="p-0">
          <div className="px-5 pt-4 pb-3 border-b border-gray-50">
            <FilterTabs tabs={tabs} value={tab} onChange={setTab} />
          </div>

          {tab === 'invoices' && (
            <RecordList items={invoices} empty={`No ${label('invoice', true).toLowerCase()} yet.`} render={(i) => (
              <Row key={i.id} href={`/admin/invoices/${i.id}`} title={i.invoice_number}
                sub={i.due_date ? `Due ${formatDay(i.due_date)}` : `Created ${formatDay(i.created_at)}`}
                right={<><span className="text-sm font-semibold tabular-nums text-navy-900">{formatGBP(i.amount)}</span><Badge tone={STATUS_TONE[i.status] || 'grey'}>{i.status}</Badge></>} />
            )} />
          )}
          {tab === 'jobs' && (
            <RecordList items={jobs} empty={`No ${label('work_item', true).toLowerCase()} yet.`} render={(j) => (
              <Row key={j.id} href={`/admin/jobs/${j.id}`} title={jobTitle(j, serviceInfo)}
                sub={j.starts_at || j.scheduled_date ? formatDay(j.starts_at || j.scheduled_date) : 'Unscheduled'}
                right={<Badge tone={STATUS_TONE[j.status] || 'grey'}>{j.status}</Badge>} />
            )} />
          )}
          {tab === 'quotes' && (
            <RecordList items={quotes} empty={`No ${label('quote', true).toLowerCase()} yet.`} render={(q) => (
              <Row key={q.id} href={`/admin/quotes/${q.id}`} title={q.quote_number}
                sub={q.sent_at ? `Sent ${formatDay(q.sent_at)}` : 'Not sent'}
                right={<><span className="text-sm font-semibold tabular-nums text-navy-900">{formatGBP(quoteValue(q))}</span><Badge tone={STATUS_TONE[q.status] || 'grey'}>{q.status}</Badge></>} />
            )} />
          )}
          {tab === 'leads' && (
            <RecordList items={leads} empty="No requests linked yet." render={(l) => (
              <Row key={l.id} href={`/admin/leads/${l.id}`} title={l.challenge || l.name}
                sub={`${formatDay(l.created_at)} · ${l.channel || '—'}`}
                right={<Badge tone={STATUS_TONE[l.status] || 'grey'}>{l.status}</Badge>} />
            )} />
          )}
        </Card>
      </div>
    </div>
  )
}

export default ClientHistory
