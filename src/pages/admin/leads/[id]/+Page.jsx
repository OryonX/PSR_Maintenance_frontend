import React, { useState, useEffect } from 'react'
import { usePageContext } from 'vike-react/usePageContext'
import { navigate } from 'vike/client/router'
import { ChevronLeft, Trash2, UserPlus } from 'lucide-react'
import HelmetSEO from '../../../../seo/HelmetSEO.jsx'
import { leadsApi } from '../../../../adminpanel/lib/endpoints.js'
import { LEAD_STATUSES, LEAD_PIPELINE_STAGES, STATUS_TONE } from '../../../../adminpanel/lib/constants.js'
import { useTenantConfig } from '../../../../adminpanel/hooks/useTenantConfig.js'
import Card from '../../../../ui/Card.jsx'
import Badge from '../../../../ui/Badge.jsx'
import Select from '../../../../ui/Select.jsx'
import Button from '../../../../ui/Button.jsx'
import Spinner from '../../../../ui/Spinner.jsx'
import EmptyState from '../../../../ui/EmptyState.jsx'

function Page() {
  const { routeParams } = usePageContext()
  const { label } = useTenantConfig()
  const [lead, setLead] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notes, setNotes] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)
  const [actionMessage, setActionMessage] = useState(null)
  const [actionError, setActionError] = useState(null)

  const load = () => {
    setLoading(true)
    leadsApi.get(routeParams.id)
      .then((data) => { setLead(data); setNotes(data.notes || '') })
      .catch((err) => setError(err))
      .finally(() => setLoading(false))
  }

  useEffect(load, [routeParams.id])

  const runAction = async (fn) => {
    setActionError(null)
    try {
      await fn()
    } catch (err) {
      setActionError(err.message)
    }
  }

  const handleStatusChange = (status) => runAction(async () => {
    const updated = await leadsApi.updateStatus(lead.id, status)
    setLead(updated)
  })

  const handleStageChange = (stage) => runAction(async () => {
    const updated = await leadsApi.updateStage(lead.id, stage)
    setLead(updated)
  })

  const handleSaveNotes = async () => {
    setActionError(null)
    setSavingNotes(true)
    try {
      const updated = await leadsApi.updateNotes(lead.id, notes)
      setLead(updated)
    } catch (err) {
      setActionError(err.message)
    } finally {
      setSavingNotes(false)
    }
  }

  const handleConvert = () => runAction(async () => {
    const result = await leadsApi.convert(lead.id)
    setLead(result.lead)
    setActionMessage(`Converted to client: ${result.client.name}${result.project ? ` · Project #${result.project.id} created` : ''}`)
  })

  const handleDelete = () => runAction(async () => {
    if (!window.confirm(`Delete this ${label('lead').toLowerCase()}? This can't be undone.`)) return
    await leadsApi.remove(lead.id)
    navigate('/admin/leads')
  })

  if (loading) return <Spinner label="Loading…" />
  if (error) return <EmptyState message={`Couldn't load this ${label('lead').toLowerCase()}: ${error.message}`} />
  if (!lead) return null

  const isTradeJob = lead.lead_type === 'trade_job'

  return (
    <>
      <HelmetSEO title={`${lead.name} | ${label('lead', true)} | PSR Operations`} description="Lead detail" noindex={true} />

      <div className="space-y-4">
        <a href="/admin/leads" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-navy-900 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to {label('lead', true).toLowerCase()}
        </a>

        {actionMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3">
            {actionMessage}
          </div>
        )}
        {actionError && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
            {actionError}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-navy-900">{lead.name}</h2>
                {lead.company && <p className="text-sm text-gray-500">{lead.company}</p>}
              </div>
              <Badge tone={STATUS_TONE[lead.status] || 'grey'}>{lead.status}</Badge>
            </div>

            <dl className="grid sm:grid-cols-2 gap-4 text-sm mb-6">
              <div><dt className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">Email</dt><dd className="text-navy-900">{lead.email || '—'}</dd></div>
              <div><dt className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">Phone</dt><dd className="text-navy-900">{lead.phone || '—'}</dd></div>
              <div><dt className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">Channel</dt><dd className="text-navy-900 capitalize">{lead.channel || '—'}</dd></div>
              <div><dt className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">Client</dt><dd className="text-navy-900">{lead.client?.name || '—'}</dd></div>
            </dl>

            {lead.details && Object.keys(lead.details).length > 0 && (
              <div className="mb-6">
                <h3 className="text-xs uppercase tracking-wide text-gray-400 font-semibold mb-2">Details</h3>
                <dl className="grid sm:grid-cols-2 gap-3 text-sm">
                  {Object.entries(lead.details).map(([key, value]) => (
                    <div key={key}>
                      <dt className="text-gray-400 text-xs capitalize">{key.replace(/_/g, ' ')}</dt>
                      <dd className="text-navy-900">{String(value)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {lead.challenge && (
              <div className="mb-6">
                <h3 className="text-xs uppercase tracking-wide text-gray-400 font-semibold mb-1">Challenge</h3>
                <p className="text-sm text-navy-900">{lead.challenge}</p>
              </div>
            )}

            <div>
              <h3 className="text-xs uppercase tracking-wide text-gray-400 font-semibold mb-2">Notes</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 focus:border-navy-900 focus:outline-none focus:ring-2 focus:ring-navy-900/10 text-sm"
              />
              <Button size="sm" variant="secondary" className="mt-2" onClick={handleSaveNotes} disabled={savingNotes}>
                {savingNotes ? 'Saving…' : 'Save notes'}
              </Button>
            </div>
          </Card>

          <div className="space-y-4">
            <Card title="Status">
              <Select
                value={lead.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                options={LEAD_STATUSES.map((s) => ({ value: s, label: s }))}
              />
            </Card>

            {isTradeJob && (
              <Card title="Pipeline stage">
                <Select
                  value={lead.pipeline_stage || ''}
                  onChange={(e) => handleStageChange(e.target.value)}
                  placeholder="Select stage…"
                  options={LEAD_PIPELINE_STAGES.map((s) => ({ value: s, label: s.replace(/_/g, ' ') }))}
                />
              </Card>
            )}

            {lead.quotes?.length > 0 && (
              <Card title={label('quote', true)}>
                <ul className="space-y-2 text-sm">
                  {lead.quotes.map((q) => (
                    <li key={q.id}>
                      <a href={`/admin/quotes/${q.id}`} className="text-navy-900 hover:underline font-medium">{q.quote_number}</a>
                      <span className="text-gray-400"> · {q.status}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            <Card>
              <div className="space-y-2">
                {lead.status !== 'converted' && (
                  <Button variant="secondary" className="w-full" onClick={handleConvert}>
                    <UserPlus className="w-4 h-4" /> Convert to {label('client').toLowerCase()}
                  </Button>
                )}
                <Button variant="danger" className="w-full" onClick={handleDelete}>
                  <Trash2 className="w-4 h-4" /> Delete
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}

export default Page
