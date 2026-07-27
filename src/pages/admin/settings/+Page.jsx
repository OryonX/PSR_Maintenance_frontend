import React, { useState, useEffect } from 'react'
import { Trash2, Plus } from 'lucide-react'
import HelmetSEO from '../../../seo/HelmetSEO.jsx'
import { usersApi } from '../../../adminpanel/lib/endpoints.js'
import { useAuth } from '../../../adminpanel/hooks/useAuth.js'
import { useTenantConfig } from '../../../adminpanel/hooks/useTenantConfig.js'
import Card from '../../../ui/Card.jsx'
import Badge from '../../../ui/Badge.jsx'
import Button from '../../../ui/Button.jsx'
import Input from '../../../ui/Input.jsx'
import Modal from '../../../ui/Modal.jsx'
import Spinner from '../../../ui/Spinner.jsx'

const TABS = ['Organization', 'Service Types', 'Users']

function OrganizationTab() {
  const { organization } = useAuth()
  const { plan, vertical } = useTenantConfig()

  return (
    <Card title="Organization">
      <dl className="grid sm:grid-cols-2 gap-4 text-sm">
        <div><dt className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">Name</dt><dd className="text-navy-900">{organization?.name || '—'}</dd></div>
        <div><dt className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">Plan</dt><dd className="text-navy-900 capitalize">{plan || '—'}</dd></div>
        <div><dt className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">Business model</dt><dd className="text-navy-900 capitalize">{organization?.business_model?.replace('_', ' ') || '—'}</dd></div>
        <div><dt className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">Vertical</dt><dd className="text-navy-900 capitalize">{vertical?.replace('_', ' ') || '—'}</dd></div>
      </dl>
      <p className="text-xs text-gray-400 mt-4">Organization settings are managed by OryonX — get in touch to change your plan or vertical.</p>
    </Card>
  )
}

function ServiceTypesTab() {
  const { services, label } = useTenantConfig()

  return (
    <Card title="Service types">
      <p className="text-xs text-gray-400 mb-4">Configured for your vertical — used across {label('work_item', true).toLowerCase()} and {label('team', true).toLowerCase()}.</p>
      <div className="space-y-2">
        {Object.entries(services).map(([key, meta]) => (
          <div key={key} className="flex items-center gap-3 px-3 py-2 rounded-lg border border-gray-100">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: meta.color }} />
            <span className="text-sm font-medium text-navy-900">{meta.label}</span>
            <span className="text-xs text-gray-400 ml-auto">{key}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}

function UsersTab() {
  const [users, setUsers] = useState(null)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState(null)
  const [listError, setListError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const load = () => {
    setLoading(true)
    usersApi.list().then(setUsers).finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await usersApi.create(form)
      setModalOpen(false)
      setForm({ name: '', email: '', password: '' })
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (user) => {
    if (!window.confirm(`Remove ${user.name}?`)) return
    setListError(null)
    try {
      await usersApi.remove(user.id)
      load()
    } catch (err) {
      setListError(err.message)
    }
  }

  return (
    <Card title="Team & users" action={
      <Button size="sm" onClick={() => setModalOpen(true)}><Plus className="w-3.5 h-3.5" /> Invite</Button>
    }>
      {listError && <p className="text-red-500 text-sm mb-3">{listError}</p>}
      {loading ? <Spinner /> : (
        <div className="space-y-2">
          {(users || []).map((u) => (
            <div key={u.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-gray-100">
              <div className="w-8 h-8 rounded-full bg-navy-900 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                {u.name[0]?.toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-navy-900 truncate">{u.name}</p>
                <p className="text-xs text-gray-400 truncate">{u.email}</p>
              </div>
              {u.roles?.length > 0 && <Badge>{u.roles[0]}</Badge>}
              <button onClick={() => handleDelete(u)} className="text-gray-300 hover:text-red-500 transition-colors" aria-label="Remove user">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Invite a user">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input id="u_name" label="Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
          <Input id="u_email" label="Email" type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required />
          <Input id="u_password" label="Temporary password" type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} required minLength={8} />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Creating…' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </Card>
  )
}

function Page() {
  const [tab, setTab] = useState('Organization')

  return (
    <>
      <HelmetSEO title="Settings | PSR Operations" description="Settings" noindex={true} />

      <div className="space-y-4">
        <div className="flex gap-2 border-b border-gray-200">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                tab === t ? 'border-navy-900 text-navy-900' : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 'Organization' && <OrganizationTab />}
        {tab === 'Service Types' && <ServiceTypesTab />}
        {tab === 'Users' && <UsersTab />}
      </div>
    </>
  )
}

export default Page
