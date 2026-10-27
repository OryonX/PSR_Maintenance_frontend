import React, { useState, useEffect } from 'react'
import { navigate } from 'vike/client/router'
import { Users, UserCheck, TrendingUp, Wrench, XCircle, Gauge, Clock, PoundSterling, CheckCircle2, ArrowRight } from 'lucide-react'
import HelmetSEO from '../../../seo/HelmetSEO.jsx'
import { meApi, dashboardApi, leadsApi, clientInvoicesApi, quotesApi } from '../../../adminpanel/lib/endpoints.js'
import { agingBucket, awaitingReply, daysToExpiry, isUnpaid, quoteValue, sumAmounts, todayISO } from '../../../adminpanel/lib/followUp.js'
import StatTile from '../../../adminpanel/components/StatTile.jsx'
import { STATUS_TONE } from '../../../adminpanel/lib/constants.js'
import { useTenantConfig } from '../../../adminpanel/hooks/useTenantConfig.js'
import KPICard from '../../../ui/KPICard.jsx'
import Card from '../../../ui/Card.jsx'
import Badge from '../../../ui/Badge.jsx'
import Spinner from '../../../ui/Spinner.jsx'
import EmptyState from '../../../ui/EmptyState.jsx'
import LeadsChart from '../../../adminpanel/components/LeadsChart.jsx'

function formatGBP(value) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(value || 0)
}

function timeAgo(iso) {
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function Page() {
  const { label, hasModule } = useTenantConfig()
  const [attention, setAttention] = useState(null) // { invoices, quotes } for the "Needs attention" row
  const [metrics, setMetrics] = useState(null)
  const [psr, setPsr] = useState(null)
  const [leads, setLeads] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    Promise.allSettled([meApi.metrics(), dashboardApi.psrMetrics(), leadsApi.list()]).then(([m, p, l]) => {
      if (cancelled) return
      if (m.status === 'fulfilled') setMetrics(m.value)
      if (p.status === 'fulfilled') setPsr(p.value)
      if (l.status === 'fulfilled') setLeads(l.value)
      if (m.status === 'rejected' && p.status === 'rejected') setError(m.reason)
      setLoading(false)
    })

    return () => { cancelled = true }
  }, [])

  // Follow-up shortcuts — optional: a failure here never blocks the dashboard.
  useEffect(() => {
    let cancelled = false
    Promise.allSettled([
      hasModule('client_invoices') ? clientInvoicesApi.list() : Promise.resolve(null),
      hasModule('quotes') ? quotesApi.list() : Promise.resolve(null)
    ]).then(([inv, q]) => {
      if (cancelled) return
      setAttention({
        invoices: inv.status === 'fulfilled' ? inv.value : null,
        quotes: q.status === 'fulfilled' ? q.value : null
      })
    })
    return () => { cancelled = true }
  }, [hasModule])

  if (loading) return <Spinner label="Loading dashboard…" />
  if (error) return <EmptyState message={`Couldn't load dashboard metrics: ${error.message}`} />

  const kpis = metrics?.metrics || {}

  const today = todayISO()
  const unpaid = (attention?.invoices || []).filter(isUnpaid)
  const overdue = unpaid.filter((inv) => agingBucket(inv, today) !== 'current')
  const awaiting = (attention?.quotes || []).filter(awaitingReply)
  const expiring = awaiting.filter((q) => { const d = daysToExpiry(q, today); return d != null && d >= 0 && d <= 7 })

  return (
    <>
      <HelmetSEO title="Dashboard | PSR Operations" description="PSR Operations dashboard" noindex={true} />

      <div className="space-y-6">
        {(attention?.invoices || attention?.quotes) && (
          <section aria-labelledby="needs-attention">
            <h2 id="needs-attention" className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-2">Needs attention</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {attention.invoices && (
                <>
                  <StatTile label="Overdue" tone="red" href="/admin/receivables" value={formatGBP(sumAmounts(overdue))}
                    sub={overdue.length ? `${overdue.length} ${label('invoice', overdue.length !== 1).toLowerCase()} to chase` : 'Nothing overdue'} />
                  <StatTile label="Outstanding" href="/admin/receivables" value={formatGBP(sumAmounts(unpaid))}
                    sub={`${unpaid.length} unpaid`} />
                </>
              )}
              {attention.quotes && (
                <>
                  <StatTile label={`${label('quote', true)} awaiting reply`} tone="amber" href="/admin/follow-up" value={awaiting.length}
                    sub={`${formatGBP(awaiting.reduce((s, q) => s + quoteValue(q), 0))} potential`} />
                  <StatTile label="Expiring this week" tone="blue" href="/admin/follow-up" value={expiring.length}
                    sub={expiring.length ? 'Call before they lapse' : 'None expiring'} />
                </>
              )}
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {psr && (
            <>
              <KPICard icon={PoundSterling} label="Revenue this month" value={formatGBP(psr.revenue_this_month)} />
              <KPICard icon={CheckCircle2} label={`${label('work_item', true)} completed`} value={psr.jobs_completed_this_month ?? '—'} />
              <KPICard
                icon={Clock}
                label="Avg. response time"
                value={psr.avg_response_time_minutes != null ? `${Math.round(psr.avg_response_time_minutes)}m` : '—'}
              />
            </>
          )}
          {kpis.appointments_booked !== undefined && (
            <KPICard icon={Wrench} label={`${label('work_item', true)} booked`} value={kpis.appointments_booked} />
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {kpis.leads_total !== undefined && <KPICard icon={Users} label={`${label('lead', true)} total`} value={kpis.leads_total} />}
          {kpis.leads_new !== undefined && <KPICard icon={UserCheck} label={`New ${label('lead', true).toLowerCase()}`} value={kpis.leads_new} />}
          {kpis.conversion_basic !== undefined && <KPICard icon={TrendingUp} label="Conversion rate" value={`${kpis.conversion_basic}%`} />}
          {kpis.no_show_rate !== undefined && <KPICard icon={XCircle} label="Cancellation rate" value={`${kpis.no_show_rate}%`} />}
          {kpis.agenda_occupancy !== undefined && <KPICard icon={Gauge} label="Team occupancy" value={`${kpis.agenda_occupancy}%`} />}
          {kpis.recurring_clients !== undefined && <KPICard icon={Users} label="Recurring customers" value={kpis.recurring_clients} />}
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <LeadsChart leads={leads || []} />
          </Card>

          <Card title="Latest leads" bodyClassName="p-0">
            {!leads || leads.length === 0 ? (
              <div className="p-6"><EmptyState message={`No ${label('lead', true).toLowerCase()} yet.`} /></div>
            ) : (
              <div className="divide-y divide-gray-50">
                {[...leads]
                  .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                  .slice(0, 6)
                  .map((lead) => (
                    <button
                      key={lead.id}
                      onClick={() => navigate(`/admin/leads/${lead.id}`)}
                      className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-surface-light transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-navy-900 truncate">{lead.name}</p>
                        <p className="text-xs text-gray-400">{timeAgo(lead.created_at)}</p>
                      </div>
                      <Badge tone={STATUS_TONE[lead.status] || 'grey'}>{lead.status}</Badge>
                    </button>
                  ))}
              </div>
            )}
            <a
              href="/admin/leads"
              className="flex items-center justify-center gap-1.5 px-5 py-3 text-xs font-semibold text-navy-900 border-t border-gray-100 hover:bg-surface-light transition-colors"
            >
              View all {label('lead', true).toLowerCase()} <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </Card>
        </div>

        {psr?.jobs_by_service_type && Object.keys(psr.jobs_by_service_type).length > 0 && (
          <Card title={`${label('work_item', true)} by service type`}>
            <div className="space-y-2">
              {Object.entries(psr.jobs_by_service_type).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between text-sm">
                  <span className="text-navy-900 capitalize">{type}</span>
                  <span className="font-semibold text-navy-900 tabular-nums">{count}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {kpis.leads_by_channel && Object.keys(kpis.leads_by_channel).length > 0 && (
          <Card title={`${label('lead', true)} by channel`}>
            <div className="space-y-2">
              {Object.entries(kpis.leads_by_channel).map(([channel, count]) => (
                <div key={channel} className="flex items-center justify-between text-sm">
                  <span className="text-navy-900 capitalize">{channel}</span>
                  <span className="font-semibold text-navy-900 tabular-nums">{count}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </>
  )
}

export default Page
