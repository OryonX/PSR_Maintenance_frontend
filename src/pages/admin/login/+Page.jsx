import React, { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { navigate } from 'vike/client/router'
import HelmetSEO from '../../../seo/HelmetSEO.jsx'
import { useAuth } from '../../../adminpanel/hooks/useAuth.js'
import Input from '../../../ui/Input.jsx'
import Button from '../../../ui/Button.jsx'
import logo from '../../../../public/img/rsr.png'

function Page() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      await login(email, password)
      navigate('/admin')
    } catch (err) {
      setError(err.message || 'Login failed')
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <HelmetSEO title="Admin Login | PSR Maintenance Services" description="PSR Operations sign in" noindex={true} />

      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 justify-center mb-8">
            <div className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center p-1.5">
              <img src={logo} alt="PSR" className="w-full h-full object-contain" />
            </div>
            <span className="font-bold text-navy-900">PSR Operations</span>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h1 className="text-lg font-bold text-navy-900 mb-1">Sign in</h1>

            <Input
              id="email"
              label="Email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              id="password"
              label="Password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign in'}
            </Button>
          </form>
        </div>
      </div>
    </>
  )
}

export default Page
