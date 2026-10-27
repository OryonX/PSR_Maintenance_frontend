// Date maths for the follow-up views (receivables + quote follow-up).
// The API returns dates as "YYYY-MM-DD" or ISO datetimes; everything here
// works on the calendar day only, in the browser's local time.

export const dateOnly = (value) => (value ? String(value).slice(0, 10) : null)

export function todayISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const dayNumber = (iso) => {
  const [y, m, d] = iso.split('-').map(Number)
  return Date.UTC(y, m - 1, d) / 864e5
}

/** Whole days from `a` to `b` (both YYYY-MM-DD); positive when b is later. */
export const daysBetween = (a, b) => Math.round(dayNumber(b) - dayNumber(a))

export function formatDay(value) {
  const iso = dateOnly(value)
  if (!iso) return '—'
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export const sumAmounts = (items, pick = (i) => i.amount) =>
  items.reduce((sum, item) => sum + (Number(pick(item)) || 0), 0)

// ── Receivables ──────────────────────────────────────────────────────────────

// Unpaid = issued and not settled. Drafts aren't owed yet.
export const isUnpaid = (inv) => inv.status === 'sent' || inv.status === 'overdue'

/** Days past the due date (0 or less = not due yet; null = no due date). */
export function daysOverdue(inv, today = todayISO()) {
  const due = dateOnly(inv.due_date)
  return due ? daysBetween(due, today) : null
}

// Sent and past its due date but still flagged "sent" in the DB.
export const shouldBeOverdue = (inv, today = todayISO()) =>
  inv.status === 'sent' && (daysOverdue(inv, today) ?? 0) > 0

export const AGING_BUCKETS = [
  { key: 'current', label: 'Not due yet', short: 'Not due', tone: 'blue', bar: 'bg-sky-400' },
  { key: 'd30', label: '1–30 days overdue', short: '1–30 days', tone: 'amber', bar: 'bg-amber-400' },
  { key: 'd60', label: '31–60 days overdue', short: '31–60 days', tone: 'red', bar: 'bg-orange-500' },
  { key: 'd60plus', label: 'Over 60 days overdue', short: '60+ days', tone: 'red', bar: 'bg-red-600' }
]

export function agingBucket(inv, today = todayISO()) {
  const days = daysOverdue(inv, today)
  if (days == null || days <= 0) return 'current'
  if (days <= 30) return 'd30'
  if (days <= 60) return 'd60'
  return 'd60plus'
}

// ── Quote follow-up ──────────────────────────────────────────────────────────

/** Highest amount a quote can come to: fixed, else the top of the range. */
export const quoteValue = (q) => Number(q.amount_fixed ?? q.amount_max ?? q.amount_min ?? 0)

export const awaitingReply = (q) => q.status === 'sent'

/** Days until the quote expires (negative = already expired; null = no date). */
export function daysToExpiry(q, today = todayISO()) {
  const exp = dateOnly(q.expires_at)
  return exp ? daysBetween(today, exp) : null
}

export function daysSinceSent(q, today = todayISO()) {
  const sent = dateOnly(q.sent_at)
  return sent ? daysBetween(sent, today) : null
}

// Sent quotes with no answer after this many days are flagged for a call.
export const CHASE_AFTER_DAYS = 7
