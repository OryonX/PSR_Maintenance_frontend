// Client invoicing (PSR → its customers). Field keys mirror the backend:
// Client::BILLING_DETAILS_FIELDS and Organization::BILLING_PROFILE_FIELDS.

export const FIELD_LABELS = {
  legal_name: 'Legal name',
  vat_number: 'VAT number',
  address_line1: 'Address line 1',
  address_line2: 'Address line 2',
  city: 'City',
  postcode: 'Postcode',
  country: 'Country',
  company_number: 'Company number',
  bank_name: 'Bank',
  account_name: 'Account name',
  sort_code: 'Sort code',
  account_number: 'Account number',
  iban: 'IBAN',
  payment_terms_days: 'Payment terms (days)',
  from_email: 'Sender email',
  reply_to: 'Reply-to',
  footer_notes: 'Footer notes',
  email: 'Email',
  phone: 'Phone',
  billing_profile: 'Billing profile'
}

export const BILLING_DETAILS_FIELDS = ['legal_name', 'vat_number', 'address_line1', 'address_line2', 'city', 'postcode', 'country']

// bill_to snapshot = billing details + contact. Without an email the send
// fails with destination_email_missing, so the recipient form includes it.
export const BILL_TO_FIELDS = [...BILLING_DETAILS_FIELDS, 'email', 'phone']

export const BILLING_PROFILE_SECTIONS = {
  Company: ['legal_name', 'vat_number', 'company_number'],
  'Registered address': ['address_line1', 'address_line2', 'city', 'postcode', 'country'],
  'Bank and payment': ['bank_name', 'account_name', 'sort_code', 'account_number', 'iban', 'payment_terms_days'],
  'Invoice sending': ['from_email', 'reply_to', 'footer_notes']
}

export const PAYMENT_METHODS = [
  { value: 'bank_transfer', label: 'Bank transfer' },
  { value: 'card', label: 'Card' },
  { value: 'cash', label: 'Cash' }
]

// UI business rules (the backend itself only blocks deleting non-drafts).
export const canEditInvoice = (inv) => inv.status === 'draft'
export const canDeleteInvoice = (inv) => inv.status === 'draft'
export const canSendInvoice = (inv) => inv.status === 'draft' || inv.status === 'overdue'
export const canMarkInvoicePaid = (inv) => inv.status === 'sent' || inv.status === 'overdue'
export const canMarkInvoiceOverdue = (inv) => inv.status === 'sent'

export const fieldList = (keys) => (keys || []).map((k) => FIELD_LABELS[k] || k).join(', ')

export const formatGBP = (value) =>
  value === null || value === undefined || value === ''
    ? '—'
    : Number(value).toLocaleString('en-GB', { style: 'currency', currency: 'GBP' })

export const toDateInput = (value) => (value ? String(value).slice(0, 10) : '')

export const invoiceRecipientName = (inv) =>
  inv.bill_to?.legal_name || inv.client?.name || inv.trade_job?.lead?.name || '—'

export const invoiceRecipientEmail = (inv) =>
  inv.bill_to?.email || inv.client?.email || inv.trade_job?.lead?.email || null

const ERROR_MESSAGES = {
  billing_profile_incomplete: (missing) => `Complete your organisation's billing details in Settings → Billing. Missing: ${missing}`,
  bill_to_incomplete: (missing) => `The client's billing details are incomplete: ${missing}`,
  destination_email_missing: () => 'The recipient has no email',
  send_failed: () => 'Sending failed, please try again',
  amount_required: () => "The job's quote has no amount — enter one.",
  invoice_not_draft: () => 'Only draft invoices can be deleted.',
  module_not_available: () => 'Client invoicing is not included in your plan.'
}

/** ApiError → readable message, using the backend `error` code when there is one. */
export function invoiceErrorMessage(err) {
  const build = ERROR_MESSAGES[err?.body?.error]
  return build ? build(fieldList(err.body.missing)) : (err?.message || 'Something went wrong.')
}

export const fieldErrors = (err) =>
  err?.errors ? Object.fromEntries(Object.entries(err.errors).map(([k, v]) => [k, v[0]])) : {}
