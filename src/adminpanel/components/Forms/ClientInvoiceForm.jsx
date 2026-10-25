import React, { useState, useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'
import Input from '../../../ui/Input.jsx'
import Select from '../../../ui/Select.jsx'
import Button from '../../../ui/Button.jsx'
import { clientInvoicesApi, billingProfileApi } from '../../lib/endpoints.js'
import { fieldErrors, fieldList, formatGBP, invoiceErrorMessage } from '../../lib/billing.js'
import { jobTitle, jobWhen } from '../../lib/jobs.js'
import { computeTotals, defaultLineForJob, serializeLines, totalsFromGross } from '../../lib/lineItems.js'
import LineItemsEditor, { validateLines } from './LineItemsEditor.jsx'
import { useTenantConfig } from '../../hooks/useTenantConfig.js'

function BlockingNotice({ children }) {
  return (
    <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg px-3.5 py-3">
      <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
      <div>{children}</div>
    </div>
  )
}

// "Plumbing repair for Jose — 12 Oct, 09:00 · SW1A 1AA · £240 (#12)"
// Title first so it reads at a glance; when/where tells apart several jobs of
// the same customer; the id stays at the end as a last-resort tiebreaker.
function jobLabel(job, serviceInfo) {
  const quote = job.quote?.amount_fixed ?? job.quote?.amount_max ?? job.quote?.amount_min
  const details = [
    jobWhen(job),
    job.postcode,
    quote != null ? `£${Number(quote).toLocaleString()}` : null
  ].filter(Boolean).join(' · ')
  return `${jobTitle(job, serviceInfo)} — ${details} (#${job.id})`
}

// ClientInvoiceController::store — only trade_job_id is required. With line
// items the amounts are computed here (net = Σ lines, VAT on top). Without
// lines, amount falls back to the linked quote (fixed → max → min) and with
// no quote amount the backend answers 422 { error: 'amount_required' }.
//
// An invoice links ONE job (trade_job_id; TradeJob hasOne ClientInvoice).
// Further jobs are billed as extra lines tagged with their trade_job_id, so
// they're excluded from future invoices (see invoicedJobIdSet).
function ClientInvoiceForm({ tradeJobs, clients, invoicedJobIds, onSubmit, onCancel }) {
  const { serviceInfo } = useTenantConfig()
  const [form, setForm] = useState({
    trade_job_id: '',
    client_id: '',
    amount: '',
    vat_rate: '',
    due_date: '',
    payment_method: ''
  })
  const [lines, setLines] = useState([])
  const [errors, setErrors] = useState({})
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [profile, setProfile] = useState(null) // { complete, missing } once loaded

  // UX gate only: the backend accepts drafts without fiscal data and blocks
  // at send time (422). Checked once per opening of the form. If the check
  // itself fails we don't block — the send-time 422 still protects.
  useEffect(() => {
    let cancelled = false
    billingProfileApi.get()
      .then((d) => { if (!cancelled) setProfile({ complete: d.complete, missing: d.missing || [] }) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  const selectedClient = (clients || []).find((c) => String(c.id) === String(form.client_id))
  const clientMissing = selectedClient?.billing_details_missing || []
  const profileIncomplete = profile?.complete === false
  const blocked = clientMissing.length > 0 || profileIncomplete

  // A trade job takes a single invoice.
  const availableJobs = (tradeJobs || []).filter((job) => !invoicedJobIds?.has(String(job.id)))
  const jobsOnLines = new Set(lines.map((line) => String(line.trade_job_id)).filter((id) => id !== 'null'))
  const extraJobs = availableJobs.filter((job) => String(job.id) !== form.trade_job_id && !jobsOnLines.has(String(job.id)))

  // Picking the main job swaps its suggested line (quote amount, or the
  // rate-card default for its service type); lines for other jobs and
  // manually added lines are kept.
  const handleJobChange = (value) => {
    const previous = form.trade_job_id
    const job = (tradeJobs || []).find((j) => String(j.id) === value)
    setLines((prev) => {
      const kept = prev.filter((line) => !previous || String(line.trade_job_id) !== previous)
      const withoutNew = kept.filter((line) => String(line.trade_job_id) !== value)
      return job ? [defaultLineForJob(job, serviceInfo), ...withoutNew] : withoutNew
    })
    update('trade_job_id', value)
  }

  const totals = computeTotals(lines, form.vat_rate)

  const update = (key, value) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value }
      // Preselect the client when the job's lead has already converted.
      if (key === 'trade_job_id' && !prev.client_id) {
        const clientId = (tradeJobs || []).find((job) => String(job.id) === value)?.lead?.client_id
        if (clientId && (clients || []).some((c) => c.id === clientId)) next.client_id = String(clientId)
      }
      return next
    })
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!form.trade_job_id) { setErrors({ trade_job_id: 'Select a job.' }); return }
    if (blocked) return

    const body = { trade_job_id: Number(form.trade_job_id) }
    if (form.client_id) body.client_id = Number(form.client_id)
    if (lines.length > 0) {
      const linesError = validateLines(lines)
      if (linesError) { setErrors({ lines: linesError }); return }
      body.line_items = serializeLines(lines)
      body.amount_net = totals.net
      body.amount = totals.gross
      if (form.vat_rate !== '') body.vat_amount = totals.vat
    } else if (form.amount !== '') {
      const manual = totalsFromGross(form.amount, form.vat_rate)
      body.amount = manual.gross
      body.amount_net = manual.net
      if (form.vat_rate !== '') body.vat_amount = manual.vat
    }
    if (form.vat_rate !== '') body.vat_rate = Number(form.vat_rate)
    if (form.due_date) body.due_date = form.due_date
    if (form.payment_method.trim()) body.payment_method = form.payment_method.trim()

    setSubmitting(true)
    try {
      const invoice = await clientInvoicesApi.create(body)
      await onSubmit(invoice)
    } catch (err) {
      if (err.body?.error === 'amount_required') {
        setErrors({ amount: "The job's quote has no amount — enter one." })
      } else {
        setErrors(fieldErrors(err))
        setError(invoiceErrorMessage(err))
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {profileIncomplete && (
        <BlockingNotice>
          Complete your company's billing details in Settings first.
          {profile.missing.length > 0 && <> Missing: {fieldList(profile.missing)}.</>}{' '}
          <a href="/admin/settings?tab=Billing" className="font-semibold underline">Open Settings → Billing</a>
        </BlockingNotice>
      )}

      <div>
        <Select
          id="trade_job_id"
          label="Job"
          placeholder={availableJobs.length ? 'Select a job…' : 'No uninvoiced jobs'}
          value={form.trade_job_id}
          onChange={(e) => handleJobChange(e.target.value)}
          options={availableJobs.map((job) => ({ value: job.id, label: jobLabel(job, serviceInfo) }))}
          error={errors.trade_job_id}
          required
        />
      </div>

      <Select
        id="client_id"
        label="Client (optional)"
        placeholder="No client — bill the job's lead"
        value={form.client_id}
        onChange={(e) => update('client_id', e.target.value)}
        options={(clients || []).map((c) => ({ value: c.id, label: c.company ? `${c.name} (${c.company})` : c.name }))}
        error={errors.client_id}
      />

      {clientMissing.length > 0 && (
        <BlockingNotice>
          This client's billing details are incomplete. Missing required for invoicing: {fieldList(clientMissing)}.{' '}
          <a href={`/admin/clients/${selectedClient.id}`} className="font-semibold underline">Edit client</a>
        </BlockingNotice>
      )}

      <div>
        <p className="block text-sm font-medium text-navy-900 mb-1.5">Lines</p>
        <LineItemsEditor
          lines={lines}
          onChange={(next) => { setLines(next); if (errors.lines) setErrors((prev) => ({ ...prev, lines: undefined })) }}
          vatRate={form.vat_rate}
          extraJobs={form.trade_job_id ? extraJobs : []}
          serviceInfo={serviceInfo}
          error={errors.lines}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {lines.length === 0 ? (
          <Input
            id="amount"
            label="Amount (£)"
            type="number"
            min="0"
            step="0.01"
            placeholder="From the quote if empty"
            value={form.amount}
            onChange={(e) => update('amount', e.target.value)}
            error={errors.amount}
          />
        ) : (
          <div>
            <p className="block text-sm font-medium text-navy-900 mb-1.5">Amount (£)</p>
            <p className="px-3.5 py-2.5 rounded-lg border border-gray-100 bg-gray-50 text-sm text-navy-900">{formatGBP(totals.gross)} <span className="text-gray-400">· from lines</span></p>
          </div>
        )}
        <Input
          id="vat_rate"
          label="VAT (%)"
          type="number"
          min="0"
          max="100"
          step="0.01"
          placeholder="20"
          value={form.vat_rate}
          onChange={(e) => update('vat_rate', e.target.value)}
          error={errors.vat_rate}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input id="due_date" label="Due date" type="date" value={form.due_date} onChange={(e) => update('due_date', e.target.value)} error={errors.due_date} />
        <Input
          id="payment_method"
          label="Payment method"
          list="client-invoice-payment-methods"
          maxLength={50}
          placeholder="bank_transfer, card…"
          value={form.payment_method}
          onChange={(e) => update('payment_method', e.target.value)}
          error={errors.payment_method}
        />
        <datalist id="client-invoice-payment-methods">
          <option value="bank_transfer" />
          <option value="card" />
          <option value="cash" />
        </datalist>
      </div>

      <p className="text-xs text-gray-400">Created as a draft — review it before sending.</p>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex justify-end gap-3 pt-2">
        {onCancel && <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>}
        <Button type="submit" disabled={submitting || blocked || availableJobs.length === 0}>{submitting ? 'Creating…' : 'Create'}</Button>
      </div>
    </form>
  )
}

export default ClientInvoiceForm
