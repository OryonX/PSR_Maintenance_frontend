import React, { useState, useEffect } from 'react'
import { usePageContext } from 'vike-react/usePageContext'
import { navigate } from 'vike/client/router'
import { ChevronLeft } from 'lucide-react'
import HelmetSEO from '../../../../seo/HelmetSEO.jsx'
import { clientInvoicesApi } from '../../../../adminpanel/lib/endpoints.js'
import { STATUS_TONE } from '../../../../adminpanel/lib/constants.js'
import { BILL_TO_FIELDS, FIELD_LABELS, formatGBP, invoiceRecipientName } from '../../../../adminpanel/lib/billing.js'
import { useTenantConfig } from '../../../../adminpanel/hooks/useTenantConfig.js'
import { useClientInvoiceActions, ClientInvoiceActionButtons } from '../../../../adminpanel/components/ClientInvoiceActions.jsx'
import Card from '../../../../ui/Card.jsx'
import Badge from '../../../../ui/Badge.jsx'
import Spinner from '../../../../ui/Spinner.jsx'
import EmptyState from '../../../../ui/EmptyState.jsx'

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

const DONE_MESSAGE = {
  send: 'Invoice sent.',
  paid: 'Invoice marked as paid.',
  overdue: 'Invoice marked as overdue.',
  edit: 'Invoice updated.'
}

function Field({ term, children }) {
  return (
    <div>
      <dt className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">{term}</dt>
      <dd className="text-navy-900">{children || '—'}</dd>
    </div>
  )
}

function Page() {
  const { routeParams } = usePageContext()
  const { label } = useTenantConfig()
  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState(null) // { tone, text }

  // Action responses come back without relations (client, trade_job), so the
  // invoice is always re-fetched afterwards instead of merging the response.
  const load = () => {
    clientInvoicesApi.get(routeParams.id).then(setInvoice).catch(setError).finally(() => setLoading(false))
  }

  useEffect(load, [routeParams.id])

  const actions = useClientInvoiceActions({
    onDone: (type) => {
      if (type === 'delete') { navigate('/admin/invoices'); return }
      setNotice({ tone: 'success', text: DONE_MESSAGE[type] })
      load()
    },
    onError: (text) => setNotice({ tone: 'error', text })
  })

  if (loading) return <Spinner label="Loading…" />
  if (error) return <EmptyState message={`Couldn't load this ${label('invoice').toLowerCase()}: ${error.message}`} />
  if (!invoice) return null

  // bill_to / issued_by are frozen when the invoice is sent; before that the
  // recipient is resolved live from the client (or the job's lead).
  const billTo = invoice.bill_to

  return (
    <>
      <HelmetSEO title={`${invoice.invoice_number} | ${label('invoice', true)} | PSR Operations`} description="Invoice detail" noindex={true} />

      <div className="space-y-4">
        <a href="/admin/invoices" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-navy-900 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to {label('invoice', true).toLowerCase()}
        </a>

        {notice && (
          <div className={`flex items-start justify-between gap-3 text-sm rounded-lg px-4 py-3 border ${
            notice.tone === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-600'
          }`}>
            <span>{notice.text}</span>
            <button onClick={() => setNotice(null)} className="opacity-60 hover:opacity-100" aria-label="Dismiss">×</button>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <Card title={invoice.invoice_number}>
              <dl className="grid sm:grid-cols-2 gap-4 text-sm">
                <Field term={label('client')}>
                  {invoice.client_id
                    ? <a href={`/admin/clients/${invoice.client_id}`} className="hover:underline font-medium">{invoiceRecipientName(invoice)}</a>
                    : invoiceRecipientName(invoice)}
                </Field>
                <Field term="Amount"><span className="font-semibold">{formatGBP(invoice.amount)}</span></Field>
                <Field term="VAT">{invoice.vat_rate != null ? `${Number(invoice.vat_rate)}%` : null}</Field>
                <Field term="Issued">{formatDate(invoice.created_at)}</Field>
                <Field term="Due date">{formatDate(invoice.due_date)}</Field>
                <Field term="Sent">{invoice.sent_at ? formatDate(invoice.sent_at) : null}</Field>
                <Field term="Paid">{invoice.paid_at ? formatDate(invoice.paid_at) : null}</Field>
                <Field term="Payment method"><span className="capitalize">{invoice.payment_method?.replace(/_/g, ' ')}</span></Field>
                <Field term={label('work_item')}>
                  {invoice.trade_job_id ? <a href={`/admin/jobs/${invoice.trade_job_id}`} className="hover:underline font-medium">#{invoice.trade_job_id}</a> : null}
                </Field>
              </dl>
            </Card>

            {invoice.line_items?.length > 0 && (
              <Card title="Lines" bodyClassName="px-6 pb-6 pt-3">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-gray-400 border-b border-gray-100">
                      <th className="py-2 font-semibold">Description</th>
                      <th className="py-2 font-semibold text-right">Qty</th>
                      <th className="py-2 font-semibold text-right">Unit</th>
                      <th className="py-2 font-semibold text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {invoice.line_items.map((line, i) => (
                      <tr key={i}>
                        <td className="py-2 text-navy-900">
                          {line.description}
                          {line.trade_job_id && line.trade_job_id !== invoice.trade_job_id && (
                            <a href={`/admin/jobs/${line.trade_job_id}`} className="ml-1 text-xs text-gray-400 hover:underline">(#{line.trade_job_id})</a>
                          )}
                        </td>
                        <td className="py-2 text-right">{line.quantity}</td>
                        <td className="py-2 text-right">{formatGBP(line.unit_price)}</td>
                        <td className="py-2 text-right font-medium">{formatGBP(line.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <dl className="ml-auto w-full sm:w-56 text-sm space-y-1 pt-3 mt-2 border-t border-gray-100">
                  <div className="flex justify-between text-gray-500"><dt>Subtotal</dt><dd>{formatGBP(invoice.amount_net ?? invoice.amount)}</dd></div>
                  {invoice.vat_amount != null && Number(invoice.vat_amount) > 0 && (
                    <div className="flex justify-between text-gray-500"><dt>VAT ({Number(invoice.vat_rate)}%)</dt><dd>{formatGBP(invoice.vat_amount)}</dd></div>
                  )}
                  <div className="flex justify-between font-semibold text-navy-900"><dt>Total</dt><dd>{formatGBP(invoice.amount)}</dd></div>
                </dl>
              </Card>
            )}

            <Card title="Recipient">
              {billTo ? (
                <dl className="grid sm:grid-cols-2 gap-4 text-sm">
                  {BILL_TO_FIELDS.map((key) => <Field key={key} term={FIELD_LABELS[key]}>{billTo[key]}</Field>)}
                </dl>
              ) : (
                <p className="text-sm text-gray-500">
                  Not frozen yet — taken from the {label('client').toLowerCase()}'s billing details when the invoice is sent.
                  {invoice.status === 'draft' && ' Use Edit → Recipient details to override it.'}
                </p>
              )}
              {invoice.issued_by && (
                <p className="text-xs text-gray-400 mt-4">Issued by {invoice.issued_by.legal_name || '—'} (snapshot taken on sending).</p>
              )}
            </Card>
          </div>

          <div className="space-y-4">
            <Card title="Status">
              <div className="mb-4"><Badge tone={STATUS_TONE[invoice.status] || 'grey'}>{invoice.status}</Badge></div>
              <ClientInvoiceActionButtons invoice={invoice} actions={actions} />
            </Card>
          </div>
        </div>
      </div>

      {actions.modals}
    </>
  )
}

export default Page
