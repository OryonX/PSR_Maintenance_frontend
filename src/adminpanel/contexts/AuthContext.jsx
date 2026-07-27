import React, { createContext, useState, useEffect, useCallback } from 'react'
import { navigate } from 'vike/client/router'
import { authApi, meApi } from '../lib/endpoints.js'
import { getAuthToken, setAuthToken, clearAuthToken, getStoredUser, setStoredUser } from '../lib/auth.js'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser())
  const [organization, setOrganization] = useState(null)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function verify() {
      const token = getAuthToken()
      if (!token) {
        setIsChecking(false)
        return
      }

      try {
        const profile = await meApi.profile()
        if (cancelled) return
        setUser(profile)
        setOrganization(profile.organization)
        setStoredUser(profile)
      } catch {
        // api.js already clears the token + redirects on 401
      } finally {
        if (!cancelled) setIsChecking(false)
      }
    }

    verify()
    return () => { cancelled = true }
  }, [])

  const login = useCallback(async (email, password) => {
    const response = await authApi.login(email, password)
    setAuthToken(response.access_token)
    setStoredUser(response.user)
    setUser(response.user)
    setOrganization(response.organization)
    return response
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch {
      // token may already be invalid — clear local state regardless
    }
    clearAuthToken()
    setUser(null)
    setOrganization(null)
    navigate('/admin/login')
  }, [])

  const value = {
    user,
    organization,
    isAuthenticated: Boolean(user),
    isChecking,
    login,
    logout
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthContext
