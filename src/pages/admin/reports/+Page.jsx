import React, { useState } from 'react'
import { Download } from 'lucide-react'
import HelmetSEO from '../../../seo/HelmetSEO.jsx'
import { leadsApi, quotesApi, clientInvoicesApi } from '../../../adminpanel/lib/endpoints.js'
import { downloadCsv } from '../../../adminpanel/lib/csv.js'
import { useTenantConfig } from '../../../adminpanel/hooks/useTenantConfig.js'
import Card from '../../../ui/Card.jsx'
import Input from '../../../ui/Input.jsx'
import Button from '../../../ui/Button.jsx'

function inRange(dateStr, from, to) {
  if (!dateStr) return false
  const d = new Date(dateStr)
  if (from && d < new Date(from)) return false
  if (to && d > new Date(new Date(to).setHours(23, 59, 59))) return false
  return true
}

function Page() {
  const { label } = useTenantConfig()
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [exporting, setExporting] = useState(null)

  const exportLeads = async () => {
    setExporting('leads')
    try {
      const leads = await leadsApi.list()
      const filtered = leads.filter((l) => inRange(l.created_at, from, to))
      downloadCsv(`leads-${from || 'all'}-to-${to || 'all'}.csv`, filtered, [
        { label: 'Name', value: (r) => r.name },
        { label: 'Email', value: (r) => r.email },
        { label: 'Phone', value: (r) => r.phone },
        { label: 'Channel', value: (r) => r.channel },
        { label: 'Status', value: (r) => r.status },
        { label: 'Created', value: (r) => r.created_at }
      ])
    } finally {
      setExporting(null)
    }
  }

  const exportQuotes = async () => {
    setExporting('quotes')
    try {
      const quotes = await quotesApi.list()
      const filtered = quotes.filter((q) => inRange(q.created_at, from, to))
      downloadCsv(`quotes-${from || 'all'}-to-${to || 'all'}.csv`, filtered, [
        { label: 'Quote #', value: (r) => r.quote_number },
        { label: 'Lead', value: (r) => r.lead?.name },
        { label: 'Status', value: (r) => r.status },
        { label: 'Amount min', value: (r) => r.amount_min },
        { label: 'Amount max', value: (r) => r.amount_max },
        { label: 'Amount fixed', value: (r) => r.amount_fixed },
        { label: 'Created', value: (r) => r.created_at }
      ])
    } finally {
      setExporting(null)
    }
  }

  const exportInvoices = async () => {
    setExporting('invoices')
    try {
      const invoices = await clientInvoicesApi.list()
      const filtered = invoices.filter((i) => inRange(i.created_at, from, to))
      downloadCsv(`invoices-${from || 'all'}-to-${to || 'all'}.csv`, filtered, [
        { label: 'Invoice #', value: (r) => r.invoice_number },
        { label: 'Amount', value: (r) => r.amount },
        { label: 'Status', value: (r) => r.status },
        { label: 'Due date', value: (r) => r.due_date },
        { label: 'Paid at', value: (r) => r.paid_at }
      ])
    } finally {
      setExporting(null)
    }
  }

  return (
    <>
      <HelmetSEO title="Reports | PSR Operations" description="Reports" noindex={true} />

      <div className="space-y-4">
        <Card title="Date range">
          <p className="text-xs text-gray-400 mb-4">Filters exports by creation date. Leave blank to export everything.</p>
          <div className="grid sm:grid-cols-2 gap-4 max-w-md">
            <Input id="from" label="From" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            <Input id="to" label="To" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </Card>

        <div className="grid sm:grid-cols-3 gap-4">
          <Card title={label('lead', true)}>
            <p className="text-xs text-gray-400 mb-3">Name, contact, channel, status, and creation date.</p>
            <Button variant="secondary" className="w-full" onClick={exportLeads} disabled={exporting === 'leads'}>
              <Download className="w-4 h-4" /> {exporting === 'leads' ? 'Exporting…' : 'Export CSV'}
            </Button>
          </Card>
          <Card title={label('quote', true)}>
            <p className="text-xs text-gray-400 mb-3">Quote number, lead, amount, and status.</p>
            <Button variant="secondary" className="w-full" onClick={exportQuotes} disabled={exporting === 'quotes'}>
              <Download className="w-4 h-4" /> {exporting === 'quotes' ? 'Exporting…' : 'Export CSV'}
            </Button>
          </Card>
          <Card title={label('invoice', true)}>
            <p className="text-xs text-gray-400 mb-3">Invoice number, amount, due date, and payment status.</p>
            <Button variant="secondary" className="w-full" onClick={exportInvoices} disabled={exporting === 'invoices'}>
              <Download className="w-4 h-4" /> {exporting === 'invoices' ? 'Exporting…' : 'Export CSV'}
            </Button>
          </Card>
        </div>
      </div>
    </>
  )
}

export default Page
