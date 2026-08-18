import React, { useState, useRef, useEffect, useCallback } from 'react'
import { navigate } from 'vike/client/router'
import { Search, Loader2 } from 'lucide-react'
import { searchApi } from '../../lib/endpoints.js'
import { useTenantConfig } from '../../hooks/useTenantConfig.js'

// GET /api/search also returns `invoices`/`subscriptions` keys, but those are
// OryonX's own agency-billing models (Invoice/Subscription) — a different
// entity and a different id space than this admin's own `/admin/invoices`
// page (backed by client_invoices). PSR's real operational entities (quotes,
// trade jobs, client invoices) aren't covered by this endpoint at all yet.
// Only wiring up the two sections that map correctly to real pages here.
const SECTIONS = [
  { key: 'leads', path: 'leads', entity: 'lead' },
  { key: 'clients', path: 'clients', entity: 'client' }
]

function detectSearchType(value) {
  const trimmed = value.trim()
  if (/^[\w.-]+@[\w.-]+\.\w+$/.test(trimmed)) return 'email'
  if (/^[\d\s+\-()]{6,}$/.test(trimmed)) return 'phone'
  return 'name'
}

function GlobalSearch() {
  const { label } = useTenantConfig()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null)
  const [searching, setSearching] = useState(false)
  const [open, setOpen] = useState(false)

  const wrapperRef = useRef(null)
  const debounceRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') { setOpen(false); setQuery(''); setResults(null) }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  const runSearch = useCallback(async (value) => {
    if (!value.trim() || value.trim().length < 2) {
      setResults(null)
      setOpen(false)
      return
    }
    setSearching(true)
    try {
      const type = detectSearchType(value)
      const data = await searchApi.search(type, value.trim())
      setResults(data)
      setOpen(true)
    } catch (err) {
      console.error('GlobalSearch error:', err.message)
    } finally {
      setSearching(false)
    }
  }, [])

  const handleChange = (e) => {
    const val = e.target.value
    setQuery(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => runSearch(val), 300)
  }

  const handleResultClick = (path, id) => {
    setOpen(false)
    setQuery('')
    setResults(null)
    navigate(`/admin/${path}/${id}`)
  }

  const hasResults = results && SECTIONS.some(({ key }) => results[key]?.length > 0)

  return (
    <div ref={wrapperRef} className="relative w-full max-w-xs sm:max-w-sm">
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        </span>
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => { if (hasResults) setOpen(true) }}
          placeholder="Search leads, clients…"
          className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-transparent rounded-lg focus:outline-none focus:bg-white focus:border-gray-200 focus:ring-2 focus:ring-navy-900/10 transition-colors placeholder:text-gray-400"
        />
      </div>

      {open && query.trim().length >= 2 && (
        <div className="absolute top-full mt-1.5 left-0 right-0 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden z-50">
          {!hasResults ? (
            <p className="text-sm text-gray-400 text-center py-6 px-4">
              No results for &ldquo;<span className="font-medium text-navy-900">{query}</span>&rdquo;
            </p>
          ) : (
            <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
              {SECTIONS.map(({ key, path, entity }) => {
                const items = results[key]
                if (!items?.length) return null
                return (
                  <div key={key} className="py-1.5">
                    <p className="px-4 pt-1.5 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      {label(entity, true)}
                    </p>
                    {items.slice(0, 5).map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleResultClick(path, item.id)}
                        className="w-full flex flex-col items-start px-4 py-2 hover:bg-gray-50 transition-colors text-left"
                      >
                        <span className="text-sm font-medium text-navy-900 truncate">{item.name || '—'}</span>
                        {(item.email || item.phone) && (
                          <span className="text-xs text-gray-400 truncate">{item.email || item.phone}</span>
                        )}
                      </button>
                    ))}
                    {items.length > 5 && (
                      <p className="px-4 pb-1.5 text-xs text-gray-400">+{items.length - 5} more</p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default GlobalSearch
