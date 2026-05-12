"use client"

import { api } from "@/lib/api"
import { decodeToken, tokenStorage } from "@/lib/auth/token"
import { useState, useEffect, useCallback } from "react"


interface User {
  id: string
  email: string
  role: "STUDENT" | "COMPANY"
  name: string | null
  image: string | null
}

interface AuthResponse {
  status: string
  message: string
  data: {
    token: string
    user: User
  }
}

interface UseAuthReturn {
  user: User | null
  isAuthenticated: boolean
  signup: (email: string, password: string, role: "STUDENT" | "COMPANY") => Promise<User>
  login: (email: string, password: string) => Promise<User>
  logout: () => Promise<void>
  loading: boolean
  error: string | null
  clearError: () => void
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  /* INIT */
  useEffect(() => {
    const token = tokenStorage.get()

    if (token) {
      const decoded = decodeToken(token)

      if (decoded) {
        setUser(decoded)
        setIsAuthenticated(true)
      }
    }

    setLoading(false)
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  /* ---------------- SIGNUP ---------------- */

  const signup = useCallback(async (email: string, password: string, role: "STUDENT" | "COMPANY") => {
    setLoading(true)
    setError(null)

    try {
      const response = await api.post<AuthResponse>("/auth/signup", {
        email,
        password,
        role,
      })

      const { token, user } = response.data.data

      if (!token || !user) throw new Error("Invalid signup response")

      tokenStorage.set(token)

      setUser(user)
      setIsAuthenticated(true)

      return user
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || "Signup failed"

      setError(message)
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }, [])

  /* ---------------- LOGIN ---------------- */

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await api.post<AuthResponse>("/auth/login", {
        email,
        password,
      })

      const { token, user } = response.data.data

      if (!token || !user) throw new Error("Invalid login response")

      tokenStorage.set(token)

      setUser(user)
      setIsAuthenticated(true)

      return user
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || "Login failed"

      setError(message)
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }, [])

  /* ---------------- LOGOUT ---------------- */

  const logout = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      await api.post("/auth/logout")
    } catch (err) {
      console.error("Logout error:", err)
    } finally {
      tokenStorage.remove()
      setUser(null)
      setIsAuthenticated(false)
      setLoading(false)
    }
  }, [])

  return {
    user,
    isAuthenticated,
    signup,
    login,
    logout,
    loading,
    error,
    clearError,
  }
}