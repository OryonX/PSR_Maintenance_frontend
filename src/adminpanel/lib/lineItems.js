// Invoice line items. The backend stores client_invoices.line_items as-is
// (nullable|array) and the PDF renders description / quantity / unit_price /
// total per line — extra keys are kept and ignored there. We add:
//   rate_id      — rate-card item the line came from (rateCard.js)
//   trade_job_id — job the line bills, so a job billed as an extra line on
//                  another invoice isn't offered for invoicing again.
// unit_price is NET; VAT is applied once on the subtotal.

import { defaultRateFor } from './rateCard.js'
import { jobTitle } from './jobs.js'

const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100

export const quoteAmount = (job) => job?.quote?.amount_fixed ?? job?.quote?.amount_max ?? job?.quote?.amount_min ?? null

// React key for editor rows only — never sent to the API.
let nextKey = 0

export function makeLine({ description = '', quantity = 1, unit_price = '', rate_id = null, trade_job_id = null } = {}) {
  nextKey += 1
  return { key: `line-${nextKey}`, description, quantity, unit_price, rate_id, trade_job_id }
}

export function lineTotal(line) {
  return round2(Number(line.quantity || 0) * Number(line.unit_price || 0))
}

/** { net, vat, gross } — VAT rate in % (empty/null → no VAT). */
export function computeTotals(lines, vatRate) {
  const net = round2(lines.reduce((sum, line) => sum + lineTotal(line), 0))
  const rate = vatRate === '' || vatRate == null ? 0 : Number(vatRate)
  const vat = round2(net * rate / 100)
  return { net, vat, gross: round2(net + vat) }
}

/**
 * Manual total (no lines): treated as VAT-inclusive, so net/VAT are derived
 * from it. Without this the PDF printed a VAT rate with a £0 VAT amount.
 */
export function totalsFromGross(gross, vatRate) {
  const total = round2(gross)
  const rate = vatRate === '' || vatRate == null ? 0 : Number(vatRate)
  const net = round2(total / (1 + rate / 100))
  return { net, vat: round2(total - net), gross: total }
}

/** Editor lines → payload for the API (drops UI-only keys). */
export function serializeLines(lines) {
  return lines.map((line) => ({
    description: line.description.trim(),
    quantity: Number(line.quantity) || 0,
    unit_price: round2(line.unit_price),
    total: lineTotal(line),
    ...(line.rate_id ? { rate_id: line.rate_id } : {}),
    ...(line.trade_job_id ? { trade_job_id: line.trade_job_id } : {})
  }))
}

/** Stored line_items → editor lines. */
export function deserializeLines(items) {
  return (items || []).map((item) => makeLine({
    description: item.description ?? '',
    quantity: item.quantity ?? 1,
    unit_price: item.unit_price ?? '',
    rate_id: item.rate_id ?? null,
    trade_job_id: item.trade_job_id ?? null
  }))
}

/** Line from a rate-card item, labelled with the job it bills when given. */
export function lineFromRate(item, { job, serviceInfo } = {}) {
  // "Simple Plumbing Repair (Boiler fix for Ana)" · "Guttering — Medium Property"
  return makeLine({
    description: job ? `${item.name} (${jobTitle(job, serviceInfo)})` : `${item.category} — ${item.name}`,
    quantity: 1,
    unit_price: item.price ?? '',
    rate_id: item.id,
    trade_job_id: job?.id ?? null
  })
}

/**
 * Suggested first line for a job: its accepted quote if it has an amount,
 * otherwise the default rate for its service type, otherwise a blank line
 * titled after the job for the price to be typed in.
 */
export function defaultLineForJob(job, serviceInfo) {
  const title = jobTitle(job, serviceInfo)
  const quoted = quoteAmount(job)
  if (quoted != null) {
    return makeLine({
      description: job.quote?.quote_number ? `${title} (quote ${job.quote.quote_number})` : title,
      unit_price: Number(quoted),
      trade_job_id: job.id
    })
  }

  const rate = defaultRateFor(job?.lead?.details?.service_type)
  if (rate) return lineFromRate(rate, { job, serviceInfo })

  return makeLine({ description: title, trade_job_id: job?.id ?? null })
}

/** Ids of every job already billed: the invoice's own job + extra job lines. */
export function invoicedJobIdSet(invoices) {
  const ids = new Set()
  for (const invoice of invoices || []) {
    if (invoice.trade_job_id) ids.add(String(invoice.trade_job_id))
    for (const item of invoice.line_items || []) {
      if (item?.trade_job_id) ids.add(String(item.trade_job_id))
    }
  }
  return ids
}
