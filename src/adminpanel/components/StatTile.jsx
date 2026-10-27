import React from 'react'

const TONES = {
  neutral: 'border-l-navy-900',
  blue: 'border-l-sky-500',
  amber: 'border-l-amber-500',
  red: 'border-l-red-600',
  green: 'border-l-green-600'
}

/**
 * Headline figure for the follow-up views: label, value, one line of context.
 * `href` or `onClick` makes the whole tile a link to the filtered list; `active`
 * marks the tile whose filter is applied.
 */
function StatTile({ label, value, sub, tone = 'neutral', href, onClick, active = false }) {
  const body = (
    <>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">{label}</p>
      <p className="mt-1.5 text-2xl font-black text-navy-900 tabular-nums leading-tight">{value}</p>
      {sub && <p className="mt-1 text-xs text-gray-500 truncate">{sub}</p>}
    </>
  )
  const cls = `block w-full text-left bg-white rounded-xl border border-gray-100 border-l-4 ${TONES[tone] || TONES.neutral} shadow-sm px-4 py-3.5 transition-shadow ${
    href || onClick ? 'hover:shadow-md cursor-pointer' : ''
  } ${active ? 'ring-2 ring-navy-900/15' : ''}`

  if (href) return <a href={href} className={cls}>{body}</a>
  if (onClick) return <button type="button" onClick={onClick} className={cls} aria-pressed={active}>{body}</button>
  return <div className={cls}>{body}</div>
}

/** Segmented filter with counts; scrolls sideways on narrow screens. */
export function FilterTabs({ tabs, value, onChange }) {
  return (
    <div className="-mx-1 overflow-x-auto">
      <div className="inline-flex gap-1.5 px-1 pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              value === tab.key ? 'bg-navy-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab.label}
            {tab.count != null && (
              <span className={`ml-1.5 text-xs tabular-nums ${value === tab.key ? 'text-white/70' : 'text-gray-400'}`}>{tab.count}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

export default StatTile
