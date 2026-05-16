"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { usePathname, useRouter } from "next/navigation"
import { authApi, tokenStore } from "@/lib/api"
import type { User } from "@/lib/types"
import { useAppTranslations } from "@/i18n/use-app-translations"

type SessionContextValue = {
  user: User | null
  loading: boolean
  setSession: (token: string, user: User) => void
  logout: () => void
}

const SessionContext = createContext<SessionContextValue | null>(null)

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const t = useAppTranslations()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    queueMicrotask(() => {
      const token = tokenStore.get()

      if (!token) {
        router.replace("/login")
        return
      }

      authApi
        .me()
        .then((currentUser) => {
          if (!mounted) {
            return
          }

          setUser(currentUser)
          window.localStorage.setItem("telecat_user", JSON.stringify(currentUser))
        })
        .catch(() => {
          tokenStore.clear()
          router.replace("/login")
        })
        .finally(() => {
          if (mounted) {
            setLoading(false)
          }
        })
    })

    return () => {
      mounted = false
    }
  }, [router, pathname])

  const setSession = useCallback((token: string, nextUser: User) => {
    tokenStore.set(token)
    window.localStorage.setItem("telecat_user", JSON.stringify(nextUser))
    setUser(nextUser)
    setLoading(false)
  }, [])

  const logout = useCallback(() => {
    tokenStore.clear()
    setUser(null)
    setLoading(false)
    router.replace("/login")
  }, [router])

  const value = useMemo(
    () => ({ user, loading, setSession, logout }),
    [loading, logout, setSession, user]
  )

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center text-sm text-muted-foreground">
        {t("loading")}
      </div>
    )
  }

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  )
}

export function useSession() {
  const context = useContext(SessionContext)

  if (!context) {
    throw new Error("useSession must be used inside SessionProvider")
  }

  return context
}
