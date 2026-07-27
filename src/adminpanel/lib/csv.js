// Client-side CSV export — no export endpoint exists on the backend, so
// reports are generated from data already available via the list endpoints.
export function downloadCsv(filename, rows, columns) {
  const header = columns.map((c) => c.label).join(',')
  const body = rows.map((row) =>
    columns.map((c) => {
      const value = c.value(row)
      const escaped = String(value ?? '').replace(/"/g, '""')
      return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped
    }).join(',')
  ).join('\n')

  const blob = new Blob([`${header}\n${body}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
