import React, { useState, useEffect } from 'react'
import { usePageContext } from 'vike-react/usePageContext'
import { ChevronLeft, Send } from 'lucide-react'
import HelmetSEO from '../../../../seo/HelmetSEO.jsx'
import { quotesApi } from '../../../../adminpanel/lib/endpoints.js'
import { QUOTE_STATUSES, STATUS_TONE } from '../../../../adminpanel/lib/constants.js'
import { useTenantConfig } from '../../../../adminpanel/hooks/useTenantConfig.js'
import QuoteForm from '../../../../adminpanel/components/Forms/QuoteForm.jsx'
import Card from '../../../../ui/Card.jsx'
import Badge from '../../../../ui/Badge.jsx'
import Select from '../../../../ui/Select.jsx'
import Button from '../../../../ui/Button.jsx'
import Spinner from '../../../../ui/Spinner.jsx'
import EmptyState from '../../../../ui/EmptyState.jsx'

function formatAmount(quote) {
  if (quote.amount_fixed) return `£${Number(quote.amount_fixed).toLocaleString()}`
  if (quote.amount_min || quote.amount_max) return `£${quote.amount_min ?? 0}–£${quote.amount_max ?? '?'}`
  return '—'
}

function Page() {
  const { routeParams } = usePageContext()
  const { label } = useTenantConfig()
  const [quote, setQuote] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionError, setActionError] = useState(null)
  const [sending, setSending] = useState(false)

  const load = () => {
    quotesApi.get(routeParams.id).then(setQuote).catch(setError).finally(() => setLoading(false))
  }

  useEffect(load, [routeParams.id])

  const handleStatusChange = async (status) => {
    setActionError(null)
    try {
      const updated = await quotesApi.updateStatus(quote.id, status)
      setQuote((prev) => ({ ...prev, ...updated }))
    } catch (err) {
      setActionError(err.message)
    }
  }

  const handleSend = async () => {
    setActionError(null)
    setSending(true)
    try {
      const updated = await quotesApi.send(quote.id)
      setQuote((prev) => ({ ...prev, ...updated }))
    } catch (err) {
      setActionError(err.message)
    } finally {
      setSending(false)
    }
  }

  const handleUpdate = async (body) => {
    const updated = await quotesApi.update(quote.id, body)
    setQuote((prev) => ({ ...prev, ...updated }))
  }

  if (loading) return <Spinner label="Loading…" />
  if (error) return <EmptyState message={`Couldn't load this ${label('quote').toLowerCase()}: ${error.message}`} />
  if (!quote) return null

  return (
    <>
      <HelmetSEO title={`${quote.quote_number} | ${label('quote', true)} | PSR Operations`} description="Quote detail" noindex={true} />

      <div className="space-y-4">
        <a href="/admin/quotes" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-navy-900 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to {label('quote', true).toLowerCase()}
        </a>

        {actionError && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
            {actionError}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2" title={quote.quote_number}>
            <dl className="grid sm:grid-cols-2 gap-4 text-sm mb-4">
              <div><dt className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">{label('lead')}</dt><dd className="text-navy-900">{quote.lead?.name || '—'}</dd></div>
              <div><dt className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">Amount</dt><dd className="text-navy-900 font-semibold">{formatAmount(quote)}</dd></div>
              <div><dt className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">Sent</dt><dd className="text-navy-900">{quote.sent_at ? new Date(quote.sent_at).toLocaleDateString('en-GB') : '—'}</dd></div>
              <div><dt className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">Expires</dt><dd className="text-navy-900">{quote.expires_at ? new Date(quote.expires_at).toLocaleDateString('en-GB') : '—'}</dd></div>
            </dl>

            <h3 className="text-xs uppercase tracking-wide text-gray-400 font-semibold mb-2">Edit</h3>
            <QuoteForm initial={quote} onSubmit={handleUpdate} submitLabel="Save changes" />
          </Card>

          <div className="space-y-4">
            <Card title="Status">
              <div className="mb-3"><Badge tone={STATUS_TONE[quote.status] || 'grey'}>{quote.status}</Badge></div>
              <Select
                value={quote.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                options={QUOTE_STATUSES.map((s) => ({ value: s, label: s }))}
              />
              {quote.status === 'draft' && (
                <Button className="w-full mt-3" onClick={handleSend} disabled={sending}>
                  <Send className="w-4 h-4" /> {sending ? 'Sending…' : `Send ${label('quote').toLowerCase()}`}
                </Button>
              )}
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}

export default Page
