"use client"

import { useState, useEffect, useCallback } from "react"
import {
  fetchProfile,
  updateProfile,
  changeProfilePassword,
  type ProfileData,
  type UpdateProfilePayload,
} from "@/lib/profile-service"

interface UseCurrentUserReturn {
  profile: ProfileData | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  update: (data: UpdateProfilePayload) => Promise<ProfileData>
  changePassword: (current: string, newPwd: string) => Promise<void>
  isGoogleUser: boolean
}

export function useCurrentUser(): UseCurrentUserReturn {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchProfile()
      setProfile(data)
    } catch (err) {
      const msg = (err as Error).message || "Failed to load profile"
      setError(msg)
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("authToken")
        : null
    if (token) {
      loadProfile()
    } else {
      setLoading(false)
    }
  }, [loadProfile])

  const update = useCallback(
    async (data: UpdateProfilePayload): Promise<ProfileData> => {
      const updated = await updateProfile(data)
      setProfile(updated)
      return updated
    },
    [],
  )

  const changePassword = useCallback(
    async (current: string, newPwd: string): Promise<void> => {
      await changeProfilePassword(current, newPwd)
    },
    [],
  )

  const isGoogleUser = profile?.provider === "google"

  return {
    profile,
    loading,
    error,
    refetch: loadProfile,
    update,
    changePassword,
    isGoogleUser,
  }
}
