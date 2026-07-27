import { useState, useMemo, useEffect } from 'react'

// Client-side pagination — every list endpoint in this backend returns a
// plain JSON array (no {data, meta} envelope), so pagination happens here.
export function usePagination(items, pageSize = 20) {
  const [page, setPage] = useState(1)

  const total = items?.length || 0
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  useEffect(() => {
    if (page > totalPages) setPage(1)
  }, [totalPages, page])

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize
    return (items || []).slice(start, start + pageSize)
  }, [items, page, pageSize])

  return { page, setPage, totalPages, total, pageItems }
}

export default usePagination
