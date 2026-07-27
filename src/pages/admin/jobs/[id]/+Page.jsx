import React, { useState, useEffect } from 'react'
import { usePageContext } from 'vike-react/usePageContext'
import { ChevronLeft, CheckCircle2, XCircle, CalendarClock, Receipt } from 'lucide-react'
import HelmetSEO from '../../../../seo/HelmetSEO.jsx'
import { tradeJobsApi, clientInvoicesApi } from '../../../../adminpanel/lib/endpoints.js'
import { useTenantConfig } from '../../../../adminpanel/hooks/useTenantConfig.js'
import Card from '../../../../ui/Card.jsx'
import Badge from '../../../../ui/Badge.jsx'
import Select from '../../../../ui/Select.jsx'
import Button from '../../../../ui/Button.jsx'
import Input from '../../../../ui/Input.jsx'
import Modal from '../../../../ui/Modal.jsx'
import Spinner from '../../../../ui/Spinner.jsx'
import EmptyState from '../../../../ui/EmptyState.jsx'

function formatDateTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function Page() {
  const { routeParams } = usePageContext()
  const { label, states, stateInfo } = useTenantConfig()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionError, setActionError] = useState(null)
  const [rescheduleOpen, setRescheduleOpen] = useState(false)
  const [invoiceOpen, setInvoiceOpen] = useState(false)

  const load = () => {
    tradeJobsApi.get(routeParams.id).then(setJob).catch(setError).finally(() => setLoading(false))
  }

  useEffect(load, [routeParams.id])

  const runAction = async (fn) => {
    setActionError(null)
    try {
      await fn()
      load()
    } catch (err) {
      setActionError(err.message)
    }
  }

  if (loading) return <Spinner label="Loading…" />
  if (error) return <EmptyState message={`Couldn't load this ${label('work_item').toLowerCase()}: ${error.message}`} />
  if (!job) return null

  const state = stateInfo(job.status)
  const isPending = job.requires_confirmation && !job.customer_confirmed_at && !state.is_terminal
  const canCancel = !state.is_terminal
  const canReschedule = !state.is_terminal
  const canInvoice = state.category === 'won' && !job.client_invoice

  return (
    <>
      <HelmetSEO title={`${job.lead?.name || 'Job'} | ${label('work_item', true)} | PSR Operations`} description="Job detail" noindex={true} />

      <div className="space-y-4">
        <a href="/admin/jobs" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-navy-900 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to {label('work_item', true).toLowerCase()}
        </a>

        {actionError && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{actionError}</div>}

        <div className="grid lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-navy-900">{job.lead?.name || 'Unnamed'}</h2>
                {job.lead?.phone && <p className="text-sm text-gray-500">{job.lead.phone}</p>}
              </div>
              <Badge color={state.color}>{state.label}</Badge>
            </div>

            <dl className="grid sm:grid-cols-2 gap-4 text-sm mb-4">
              <div><dt className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">Scheduled</dt><dd className="text-navy-900">{formatDateTime(job.starts_at)}</dd></div>
              <div><dt className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">Ends</dt><dd className="text-navy-900">{formatDateTime(job.ends_at)}</dd></div>
              <div><dt className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">Address</dt><dd className="text-navy-900">{job.address || '—'} {job.postcode}</dd></div>
              <div><dt className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">{label('team')}</dt><dd className="text-navy-900">{job.assigned_team_member?.name || 'Unassigned'}</dd></div>
              <div><dt className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">{label('quote')}</dt><dd className="text-navy-900">{job.quote?.quote_number || '—'}</dd></div>
              <div><dt className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">Confirmed</dt><dd className="text-navy-900">{job.customer_confirmed_at ? formatDateTime(job.customer_confirmed_at) : 'Not yet'}</dd></div>
            </dl>

            {job.cancellation_reason && (
              <div className="mb-4 text-sm">
                <span className="text-gray-400 text-xs uppercase tracking-wide">Cancellation reason</span>
                <p className="text-navy-900">{job.cancellation_reason}</p>
              </div>
            )}

            {job.completion_notes && (
              <div className="mb-4 text-sm">
                <span className="text-gray-400 text-xs uppercase tracking-wide">Completion notes</span>
                <p className="text-navy-900">{job.completion_notes}</p>
              </div>
            )}

            {job.client_invoice && (
              <div className="text-sm">
                <span className="text-gray-400 text-xs uppercase tracking-wide">{label('invoice')}</span>
                <p className="text-navy-900">
                  <a href="/admin/invoices" className="hover:underline font-medium">{job.client_invoice.invoice_number}</a>
                  {' · '}£{job.client_invoice.amount} · {job.client_invoice.status}
                </p>
              </div>
            )}
          </Card>

          <div className="space-y-4">
            <Card title="Status">
              <Select
                value={job.status}
                onChange={(e) => runAction(() => tradeJobsApi.updateStatus(job.id, e.target.value))}
                options={Object.entries(states).map(([key, meta]) => ({ value: key, label: meta.label }))}
              />
            </Card>

            <Card title="Actions">
              <div className="space-y-2">
                {isPending && (
                  <Button variant="secondary" className="w-full" onClick={() => runAction(() => tradeJobsApi.confirm(job.id))}>
                    <CheckCircle2 className="w-4 h-4" /> Confirm appointment
                  </Button>
                )}
                {canReschedule && (
                  <Button variant="secondary" className="w-full" onClick={() => setRescheduleOpen(true)}>
                    <CalendarClock className="w-4 h-4" /> Reschedule
                  </Button>
                )}
                {canInvoice && (
                  <Button variant="secondary" className="w-full" onClick={() => setInvoiceOpen(true)}>
                    <Receipt className="w-4 h-4" /> Create {label('invoice').toLowerCase()}
                  </Button>
                )}
                {canCancel && (
                  <Button
                    variant="danger"
                    className="w-full"
                    onClick={() => {
                      const reason = window.prompt('Cancellation reason (optional):')
                      if (reason !== null) runAction(() => tradeJobsApi.cancel(job.id, reason || null))
                    }}
                  >
                    <XCircle className="w-4 h-4" /> Cancel
                  </Button>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      <RescheduleModal
        open={rescheduleOpen}
        onClose={() => setRescheduleOpen(false)}
        job={job}
        onSaved={() => { setRescheduleOpen(false); load() }}
      />
      <CreateInvoiceModal
        open={invoiceOpen}
        onClose={() => setInvoiceOpen(false)}
        job={job}
        onSaved={() => { setInvoiceOpen(false); load() }}
      />
    </>
  )
}

function RescheduleModal({ open, onClose, job, onSaved }) {
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('11:00')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (job?.starts_at) {
      const d = new Date(job.starts_at)
      setDate(d.toISOString().slice(0, 10))
      setStartTime(d.toTimeString().slice(0, 5))
    }
    if (job?.ends_at) {
      setEndTime(new Date(job.ends_at).toTimeString().slice(0, 5))
    }
  }, [job])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const startsAt = new Date(`${date}T${startTime}`)
      const endsAt = new Date(`${date}T${endTime}`)
      await tradeJobsApi.reschedule(job.id, startsAt.toISOString(), endsAt.toISOString())
      onSaved()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Reschedule">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input id="reschedule_date" label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        <div className="grid grid-cols-2 gap-3">
          <Input id="reschedule_start" label="Start time" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
          <Input id="reschedule_end" label="End time" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={submitting}>{submitting ? 'Saving…' : 'Save'}</Button>
        </div>
      </form>
    </Modal>
  )
}

function CreateInvoiceModal({ open, onClose, job, onSaved }) {
  const [amount, setAmount] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await clientInvoicesApi.create({ trade_job_id: job.id, amount, due_date: dueDate || null })
      onSaved()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Create invoice">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input id="invoice_amount" label="Amount (£)" type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        <Input id="invoice_due" label="Due date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={submitting}>{submitting ? 'Creating…' : 'Create'}</Button>
        </div>
      </form>
    </Modal>
  )
}

export default Page
