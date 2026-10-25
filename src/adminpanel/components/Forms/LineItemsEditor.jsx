import React from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { RATE_CARD, rateItem, rateLabel } from '../../lib/rateCard.js'
import { computeTotals, defaultLineForJob, lineFromRate, lineTotal, makeLine } from '../../lib/lineItems.js'
import { jobTitle, jobWhen } from '../../lib/jobs.js'
import { formatGBP } from '../../lib/billing.js'

const cell = 'w-full px-2.5 py-2 rounded-md border border-gray-200 text-sm focus:border-navy-900 focus:outline-none focus:ring-2 focus:ring-navy-900/10'
const picker = 'px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:border-navy-900 focus:outline-none focus:ring-2 focus:ring-navy-900/10'

/**
 * Invoice lines with the rate card as presets. Controlled: `lines` +
 * `onChange(lines)`. `extraJobs` (optional) are other uninvoiced jobs that can
 * be billed on this same invoice as additional lines.
 */
function LineItemsEditor({ lines, onChange, vatRate, extraJobs = [], serviceInfo, error }) {
  const update = (key, field, value) =>
    onChange(lines.map((line) => (line.key === key ? { ...line, [field]: value } : line)))

  const remove = (key) => onChange(lines.filter((line) => line.key !== key))

  const addRate = (id) => {
    const item = rateItem(id)
    if (item) onChange([...lines, lineFromRate(item)])
  }

  const addJob = (id) => {
    const job = extraJobs.find((j) => String(j.id) === id)
    if (job) onChange([...lines, defaultLineForJob(job, serviceInfo)])
  }

  const totals = computeTotals(lines, vatRate)
  const hasVat = vatRate !== '' && vatRate != null && Number(vatRate) > 0

  return (
    <div className="space-y-3">
      {lines.length > 0 && (
        <div className="space-y-2">
          <div className="hidden sm:grid grid-cols-[1fr_4.5rem_6rem_5.5rem_2rem] gap-2 text-xs font-medium text-gray-400 uppercase tracking-wide">
            <span>Description</span><span>Qty</span><span>Unit (£)</span><span className="text-right">Total</span><span />
          </div>
          {lines.map((line) => {
            const rate = line.rate_id ? rateItem(line.rate_id) : null
            const needsPrice = line.unit_price === '' || line.unit_price == null
            return (
              <div key={line.key} className="grid grid-cols-[1fr_4.5rem_6rem_5.5rem_2rem] gap-2 items-start">
                <div>
                  <input
                    aria-label="Description"
                    className={cell}
                    value={line.description}
                    onChange={(e) => update(line.key, 'description', e.target.value)}
                  />
                  {rate && (
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Rate: {rateLabel(rate)}{rate.includes ? ` · ${rate.includes}` : ''}
                      {rate.unit === 'from' && ' — adjust to the actual work'}
                    </p>
                  )}
                </div>
                <input
                  aria-label="Quantity"
                  type="number" min="0" step="0.5"
                  className={cell}
                  value={line.quantity}
                  onChange={(e) => update(line.key, 'quantity', e.target.value)}
                />
                <input
                  aria-label="Unit price"
                  type="number" min="0" step="0.01"
                  placeholder="Price"
                  className={`${cell} ${needsPrice ? 'border-amber-300 bg-amber-50' : ''}`}
                  value={line.unit_price}
                  onChange={(e) => update(line.key, 'unit_price', e.target.value)}
                />
                <span className="py-2 text-sm text-right text-navy-900">{formatGBP(lineTotal(line))}</span>
                <button
                  type="button"
                  title="Remove line"
                  onClick={() => remove(line.key)}
                  className="p-2 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )
          })}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <select className={picker} value="" onChange={(e) => addRate(e.target.value)} aria-label="Add from rates">
          <option value="">+ Add from rates…</option>
          {RATE_CARD.map((group) => (
            <optgroup key={group.category} label={group.category}>
              {group.items.map((item) => (
                <option key={item.id} value={item.id}>{item.name} — {rateLabel(item)}</option>
              ))}
            </optgroup>
          ))}
        </select>

        {extraJobs.length > 0 && (
          <select className={picker} value="" onChange={(e) => addJob(e.target.value)} aria-label="Add another job">
            <option value="">+ Add another job…</option>
            {extraJobs.map((job) => (
              <option key={job.id} value={job.id}>{jobTitle(job, serviceInfo)} — {jobWhen(job)} (#{job.id})</option>
            ))}
          </select>
        )}

        <button
          type="button"
          onClick={() => onChange([...lines, makeLine()])}
          className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-dashed border-gray-300 text-sm text-gray-600 hover:bg-gray-50"
        >
          <Plus className="w-4 h-4" /> Custom line
        </button>
      </div>

      {lines.length > 0 && (
        <dl className="ml-auto w-full sm:w-64 text-sm space-y-1 pt-2 border-t border-gray-100">
          <div className="flex justify-between text-gray-500"><dt>Subtotal</dt><dd>{formatGBP(totals.net)}</dd></div>
          {hasVat && <div className="flex justify-between text-gray-500"><dt>VAT ({Number(vatRate)}%)</dt><dd>{formatGBP(totals.vat)}</dd></div>}
          <div className="flex justify-between font-semibold text-navy-900"><dt>Total</dt><dd>{formatGBP(totals.gross)}</dd></div>
        </dl>
      )}

      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  )
}

/** Returns an error message when the lines can't be saved, else null. */
export function validateLines(lines) {
  if (lines.some((line) => !line.description.trim())) return 'Every line needs a description.'
  if (lines.some((line) => line.unit_price === '' || line.unit_price == null)) return 'Enter a price for every line (quotation items have no list price).'
  if (lines.some((line) => !(Number(line.quantity) > 0))) return 'Quantities must be greater than 0.'
  return null
}

export default LineItemsEditor
