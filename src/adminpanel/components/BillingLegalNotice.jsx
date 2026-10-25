import React from 'react'
import { AlertTriangle } from 'lucide-react'
import { fieldList } from '../lib/billing.js'

// Permanent (non-dismissible) notice shown wherever fiscal data is edited —
// client billing details and the organisation's billing profile. Informative
// UI text only; `missing` (optional) adds the fields still needed to invoice.
function BillingLegalNotice({ missing }) {
  return (
    <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg px-3 py-2.5 space-y-1">
      <p className="flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
        <span>Make sure these details are correct. Incorrect tax information on invoices can have legal consequences for your company.</span>
      </p>
      {missing?.length > 0 && (
        <p className="pl-6 font-medium">Missing required for invoicing: {fieldList(missing)}</p>
      )}
    </div>
  )
}

export default BillingLegalNotice
