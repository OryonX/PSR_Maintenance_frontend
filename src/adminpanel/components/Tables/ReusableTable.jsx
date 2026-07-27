import React from 'react'
import Spinner from '../../../ui/Spinner.jsx'
import EmptyState from '../../../ui/EmptyState.jsx'

const HIDE_CLASSES = {
  sm: 'hidden sm:table-cell',
  md: 'hidden md:table-cell',
  lg: 'hidden lg:table-cell'
}

// columns: [{ key, label, hideBelow?: 'sm'|'md'|'lg', render?: (row) => node }]
function ReusableTable({ columns, rows, loading, emptyMessage, onRowClick, rowKey = 'id' }) {
  if (loading) return <Spinner />
  if (!rows || rows.length === 0) return <EmptyState message={emptyMessage} />

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`text-left font-semibold text-xs uppercase tracking-wide text-gray-400 px-4 py-3 ${col.hideBelow ? HIDE_CLASSES[col.hideBelow] : ''}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {rows.map((row) => (
            <tr
              key={row[rowKey]}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={onRowClick ? 'cursor-pointer hover:bg-surface-light transition-colors' : ''}
            >
              {columns.map((col) => (
                <td key={col.key} className={`px-4 py-3.5 text-navy-900 ${col.hideBelow ? HIDE_CLASSES[col.hideBelow] : ''}`}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ReusableTable
