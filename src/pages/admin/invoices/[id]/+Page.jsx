import React, { useState, useEffect } from 'react'
import { usePageContext } from 'vike-react/usePageContext'
import { ChevronLeft, CheckCircle2 } from 'lucide-react'
import HelmetSEO from '../../../../seo/HelmetSEO.jsx'
import { clientInvoicesApi } from '../../../../adminpanel/lib/endpoints.js'
import { CLIENT_INVOICE_STATUSES, STATUS_TONE } from '../../../../adminpanel/lib/constants.js'
import { useTenantConfig } from '../../../../adminpanel/hooks/useTenantConfig.js'
import Card from '../../../../ui/Card.jsx'
import Badge from '../../../../ui/Badge.jsx'
import Select from '../../../../ui/Select.jsx'
import Button from '../../../../ui/Button.jsx'
import Modal from '../../../../ui/Modal.jsx'
import Spinner from '../../../../ui/Spinner.jsx'
import EmptyState from '../../../../ui/EmptyState.jsx'

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function Page() {
  const { routeParams } = usePageContext()
  const { label } = useTenantConfig()
  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionError, setActionError] = useState(null)
  const [payOpen, setPayOpen] = useState(false)

  const load = () => {
    clientInvoicesApi.get(routeParams.id).then(setInvoice).catch(setError).finally(() => setLoading(false))
  }

  useEffect(load, [routeParams.id])

  const handleStatusChange = async (status) => {
    setActionError(null)
    try {
      const updated = await clientInvoicesApi.update(invoice.id, { status })
      setInvoice((prev) => ({ ...prev, ...updated }))
    } catch (err) {
      setActionError(err.message)
    }
  }

  if (loading) return <Spinner label="Loading…" />
  if (error) return <EmptyState message={`Couldn't load this ${label('invoice').toLowerCase()}: ${error.message}`} />
  if (!invoice) return null

  return (
    <>
      <HelmetSEO title={`${invoice.invoice_number} | ${label('invoice', true)} | PSR Operations`} description="Invoice detail" noindex={true} />

      <div className="space-y-4">
        <a href="/admin/invoices" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-navy-900 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to {label('invoice', true).toLowerCase()}
        </a>

        {actionError && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
            {actionError}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2" title={invoice.invoice_number}>
            <dl className="grid sm:grid-cols-2 gap-4 text-sm">
              <div><dt className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">{label('lead')}</dt><dd className="text-navy-900">{invoice.trade_job?.lead?.name || '—'}</dd></div>
              <div><dt className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">Amount</dt><dd className="text-navy-900 font-semibold">£{Number(invoice.amount).toLocaleString()}</dd></div>
              <div><dt className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">Due date</dt><dd className="text-navy-900">{formatDate(invoice.due_date)}</dd></div>
              <div><dt className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">Paid</dt><dd className="text-navy-900">{invoice.paid_at ? formatDate(invoice.paid_at) : '—'}</dd></div>
              <div><dt className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">Payment method</dt><dd className="text-navy-900 capitalize">{invoice.payment_method || '—'}</dd></div>
              <div><dt className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">{label('work_item')}</dt><dd className="text-navy-900">{invoice.trade_job_id ? <a href={`/admin/jobs/${invoice.trade_job_id}`} className="hover:underline font-medium">#{invoice.trade_job_id}</a> : '—'}</dd></div>
            </dl>
          </Card>

          <div className="space-y-4">
            <Card title="Status">
              <div className="mb-3"><Badge tone={STATUS_TONE[invoice.status] || 'grey'}>{invoice.status}</Badge></div>
              <Select
                value={invoice.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                options={CLIENT_INVOICE_STATUSES.map((s) => ({ value: s, label: s }))}
              />
              {invoice.status !== 'paid' && (
                <Button className="w-full mt-3" onClick={() => setPayOpen(true)}>
                  <CheckCircle2 className="w-4 h-4" /> Mark as paid
                </Button>
              )}
            </Card>
          </div>
        </div>
      </div>

      <MarkPaidModal
        open={payOpen}
        onClose={() => setPayOpen(false)}
        invoice={invoice}
        onSaved={(updated) => { setInvoice((prev) => ({ ...prev, ...updated })); setPayOpen(false) }}
      />
    </>
  )
}

function MarkPaidModal({ open, onClose, invoice, onSaved }) {
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const updated = await clientInvoicesApi.markPaid(invoice.id, { payment_method: paymentMethod })
      onSaved(updated)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Mark as paid">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          id="payment_method"
          label="Payment method"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          options={[
            { value: 'bank_transfer', label: 'Bank transfer' },
            { value: 'cash', label: 'Cash' },
            { value: 'card', label: 'Card' }
          ]}
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={submitting}>{submitting ? 'Saving…' : 'Confirm'}</Button>
        </div>
      </form>
    </Modal>
  )
}

export default Page
