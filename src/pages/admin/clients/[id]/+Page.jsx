import React, { useState, useEffect } from 'react'
import { usePageContext } from 'vike-react/usePageContext'
import { ChevronLeft } from 'lucide-react'
import HelmetSEO from '../../../../seo/HelmetSEO.jsx'
import { clientsApi } from '../../../../adminpanel/lib/endpoints.js'
import { CLIENT_STATUSES, STATUS_TONE } from '../../../../adminpanel/lib/constants.js'
import { useTenantConfig } from '../../../../adminpanel/hooks/useTenantConfig.js'
import Card from '../../../../ui/Card.jsx'
import Badge from '../../../../ui/Badge.jsx'
import Select from '../../../../ui/Select.jsx'
import Spinner from '../../../../ui/Spinner.jsx'
import EmptyState from '../../../../ui/EmptyState.jsx'

function Page() {
  const { routeParams } = usePageContext()
  const { label } = useTenantConfig()
  const [client, setClient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionError, setActionError] = useState(null)

  useEffect(() => {
    clientsApi.get(routeParams.id)
      .then(setClient)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [routeParams.id])

  const handleStatusChange = async (status) => {
    setActionError(null)
    try {
      const updated = await clientsApi.update(client.id, { status })
      setClient((prev) => ({ ...prev, ...updated }))
    } catch (err) {
      setActionError(err.message)
    }
  }

  if (loading) return <Spinner label="Loading…" />
  if (error) return <EmptyState message={`Couldn't load this ${label('client').toLowerCase()}: ${error.message}`} />
  if (!client) return null

  return (
    <>
      <HelmetSEO title={`${client.name} | ${label('client', true)} | PSR Operations`} description="Client detail" noindex={true} />

      <div className="space-y-4">
        <a href="/admin/clients" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-navy-900 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to {label('client', true).toLowerCase()}
        </a>

        {actionError && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
            {actionError}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-navy-900">{client.name}</h2>
                {client.company && <p className="text-sm text-gray-500">{client.company}</p>}
              </div>
              <Badge tone={STATUS_TONE[client.status] || 'grey'}>{client.status}</Badge>
            </div>

            <dl className="grid sm:grid-cols-2 gap-4 text-sm">
              <div><dt className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">Email</dt><dd className="text-navy-900">{client.email || '—'}</dd></div>
              <div><dt className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">Phone</dt><dd className="text-navy-900">{client.phone || '—'}</dd></div>
              <div><dt className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">Language</dt><dd className="text-navy-900 uppercase">{client.language || '—'}</dd></div>
            </dl>
            {/* Client::projects()/invoices() point at the agency-billing models
                (Project/Invoice), not this vertical's Lead→Quote→TradeJob→
                ClientInvoice chain — Client has no relation to those, and the
                API has no client_id filter on leads/trade-jobs either, so a
                customer's actual service history isn't fetchable yet. */}
          </Card>

          <Card title="Status">
            <Select
              value={client.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              options={CLIENT_STATUSES.map((s) => ({ value: s, label: s }))}
            />
          </Card>
        </div>
      </div>
    </>
  )
}

export default Page
