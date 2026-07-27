import React, { useState, useMemo } from 'react'

const BAR_COLOR = '#233B5C' // brand-blue — matches the rest of the admin UI
const RANGES = [
  { key: '1m', label: '1M' },
  { key: '6m', label: '6M' },
  { key: '1y', label: '1Y' }
]

function bucketsFor(range) {
  const now = new Date()
  const buckets = []

  if (range === '1m') {
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      d.setHours(0, 0, 0, 0)
      buckets.push({ key: d.toISOString().slice(0, 10), label: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }), start: d })
    }
  } else {
    const months = range === '6m' ? 5 : 11
    for (let i = months; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      buckets.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' }), start: d })
    }
  }

  return buckets
}

function bucketKeyFor(date, range) {
  const d = new Date(date)
  if (range === '1m') {
    d.setHours(0, 0, 0, 0)
    return d.toISOString().slice(0, 10)
  }
  return `${d.getFullYear()}-${d.getMonth()}`
}

function LeadsChart({ leads }) {
  const [range, setRange] = useState('6m')
  const [hovered, setHovered] = useState(null)

  const { buckets, maxCount } = useMemo(() => {
    const empty = bucketsFor(range)
    const counts = new Map(empty.map((b) => [b.key, 0]))

    for (const lead of leads || []) {
      if (!lead.created_at) continue
      const key = bucketKeyFor(lead.created_at, range)
      if (counts.has(key)) counts.set(key, counts.get(key) + 1)
    }

    const withCounts = empty.map((b) => ({ ...b, count: counts.get(b.key) || 0 }))
    return { buckets: withCounts, maxCount: Math.max(1, ...withCounts.map((b) => b.count)) }
  }, [leads, range])

  const barSlotWidth = range === '1m' ? 10 : 28
  const chartHeight = 140

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-navy-900 text-sm">Leads captured</h3>
        <div className="inline-flex rounded-lg border border-gray-200 p-0.5">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                range === r.key ? 'bg-navy-900 text-white' : 'text-gray-500 hover:text-navy-900'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <div
          className="flex items-end gap-[2px] relative"
          style={{ height: chartHeight, minWidth: buckets.length * barSlotWidth }}
        >
          {/* baseline */}
          <div className="absolute left-0 right-0 bottom-0 border-t border-gray-200" style={{ minWidth: buckets.length * barSlotWidth }} />

          {buckets.map((b) => {
            const barHeight = b.count === 0 ? 2 : Math.max(4, (b.count / maxCount) * (chartHeight - 20))
            const isHovered = hovered?.key === b.key

            return (
              <div
                key={b.key}
                className="relative flex-1 flex flex-col justify-end items-center h-full cursor-default group"
                style={{ minWidth: barSlotWidth - 2 }}
                onMouseEnter={() => setHovered(b)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(b)}
                onBlur={() => setHovered(null)}
                tabIndex={0}
              >
                {isHovered && (
                  <div className="absolute bottom-full mb-1.5 px-2 py-1 rounded-md bg-navy-900 text-white text-xs whitespace-nowrap z-10 shadow-lg">
                    <span className="font-semibold tabular-nums">{b.count}</span> · {b.label}
                  </div>
                )}
                <div
                  className="w-full rounded-t transition-opacity"
                  style={{
                    height: barHeight,
                    maxWidth: 24,
                    backgroundColor: BAR_COLOR,
                    opacity: isHovered ? 1 : 0.85
                  }}
                />
              </div>
            )
          })}
        </div>

        <div className="flex gap-[2px] mt-1.5" style={{ minWidth: buckets.length * barSlotWidth }}>
          {buckets.map((b, i) => {
            const showLabel = range === '1m' ? i % 5 === 0 : true
            return (
              <div key={b.key} className="flex-1 text-center" style={{ minWidth: barSlotWidth - 2 }}>
                {showLabel && <span className="text-[10px] text-gray-400">{b.label}</span>}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default LeadsChart
