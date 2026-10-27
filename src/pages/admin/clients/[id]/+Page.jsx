import React, { useState, useEffect } from 'react'
import { usePageContext } from 'vike-react/usePageContext'
import { navigate } from 'vike/client/router'
import { ChevronLeft, Pencil, Trash2 } from 'lucide-react'
import HelmetSEO from '../../../../seo/HelmetSEO.jsx'
import { clientsApi } from '../../../../adminpanel/lib/endpoints.js'
import { CLIENT_STATUSES, STATUS_TONE } from '../../../../adminpanel/lib/constants.js'
import { BILLING_DETAILS_FIELDS, FIELD_LABELS, fieldList } from '../../../../adminpanel/lib/billing.js'
import { useTenantConfig } from '../../../../adminpanel/hooks/useTenantConfig.js'
import ClientForm from '../../../../adminpanel/components/Forms/ClientForm.jsx'
import ClientHistory from '../../../../adminpanel/components/ClientHistory.jsx'
import Card from '../../../../ui/Card.jsx'
import Badge from '../../../../ui/Badge.jsx'
import Button from '../../../../ui/Button.jsx'
import Modal from '../../../../ui/Modal.jsx'
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
  const [actionMessage, setActionMessage] = useState(null)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  const load = () => {
    clientsApi.get(routeParams.id)
      .then(setClient)
      .catch(setError)
      .finally(() => setLoading(false))
  }

  useEffect(load, [routeParams.id])

  const handleStatusChange = async (status) => {
    setActionError(null)
    try {
      const updated = await clientsApi.update(client.id, { status })
      setClient((prev) => ({ ...prev, ...updated }))
    } catch (err) {
      setActionError(err.message)
    }
  }

  const handleSaved = () => {
    setEditOpen(false)
    setActionMessage(`${label('client')} updated.`)
    load()
  }

  // The backend refuses (422 + message) while the client has a non-cancelled
  // subscription or open projects, and releases its leads back to "new".
  const handleDelete = async () => {
    setDeleting(true)
    setDeleteError(null)
    try {
      await clientsApi.remove(client.id)
      navigate('/admin/clients')
    } catch (err) {
      setDeleteError(err.message)
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <Spinner label="Loading…" />
  if (error) return <EmptyState message={`Couldn't load this ${label('client').toLowerCase()}: ${error.message}`} />
  if (!client) return null

  const billing = client.billing_details || {}
  const missing = client.billing_details_missing || []

  return (
    <>
      <HelmetSEO title={`${client.name} | ${label('client', true)} | PSR Operations`} description="Client detail" noindex={true} />

      <div className="space-y-4">
        <a href="/admin/clients" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-navy-900 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to {label('client', true).toLowerCase()}
        </a>

        {actionMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3">
            {actionMessage}
          </div>
        )}
        {actionError && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
            {actionError}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <Card>
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
            </Card>

            <Card title="Billing details" action={<Button size="sm" variant="secondary" onClick={() => setEditOpen(true)}><Pencil className="w-3.5 h-3.5" /> Edit</Button>}>
              {missing.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg px-4 py-3 mb-4">
                  Missing required for invoicing: {fieldList(missing)}
                </div>
              )}
              <dl className="grid sm:grid-cols-2 gap-4 text-sm">
                {BILLING_DETAILS_FIELDS.map((key) => (
                  <div key={key}>
                    <dt className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">{FIELD_LABELS[key]}</dt>
                    <dd className="text-navy-900">{billing[key] || '—'}</dd>
                  </div>
                ))}
              </dl>
            </Card>
          </div>

          <div className="space-y-4">
            <Card title="Status">
              <Select
                value={client.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                options={CLIENT_STATUSES.map((s) => ({ value: s, label: s }))}
              />
            </Card>

            <Card>
              <div className="space-y-2">
                <Button variant="secondary" className="w-full" onClick={() => setEditOpen(true)}>
                  <Pencil className="w-4 h-4" /> Edit {label('client').toLowerCase()}
                </Button>
                <Button variant="danger" className="w-full" onClick={() => { setDeleteError(null); setDeleteOpen(true) }}>
                  <Trash2 className="w-4 h-4" /> Delete
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Customer 360 — history joined client-side (see ClientHistory). */}
        <section className="space-y-3 pt-2">
          <h2 className="text-lg font-bold text-navy-900">History</h2>
          <ClientHistory clientId={client.id} />
        </section>
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title={`Edit ${label('client').toLowerCase()}`}>
        {editOpen && <ClientForm client={client} onSubmit={handleSaved} onCancel={() => setEditOpen(false)} />}
      </Modal>

      <Modal open={deleteOpen} onClose={() => !deleting && setDeleteOpen(false)} title={`Delete ${label('client').toLowerCase()}`}>
        <div className="space-y-4">
          <p className="text-sm text-navy-900">
            Delete <strong>{client.name}</strong>? Their {label('lead', true).toLowerCase()} go back to “new”. This can't be undone.
          </p>
          {deleteError && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{deleteError}</div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setDeleteOpen(false)} disabled={deleting}>Cancel</Button>
            <Button type="button" variant="danger" onClick={handleDelete} disabled={deleting}>{deleting ? 'Deleting…' : 'Delete'}</Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

export default Page
