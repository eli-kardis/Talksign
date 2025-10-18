"use client"

import { use, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { NewQuote } from "@/components/NewQuote"
import { extractUsername, getUserPath } from "@/lib/utils"

export default function UserNewQuotePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params)
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !user) {
      console.log('NewQuote: User not authenticated, redirecting to signin')
      window.location.href = '/auth/signin'
    }
  }, [user, isLoading])

  useEffect(() => {
    if (!isLoading && user) {
      const userUsername = extractUsername(user.email)
      if (username !== userUsername) {
        router.replace(getUserPath(userUsername, '/documents/quotes/new'))
      }
    }
  }, [user, isLoading, username, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <NewQuote
      onNavigate={(view) => {
        const userUsername = user?.email ? extractUsername(user.email) : username
        const map: Record<string, string> = {
          documents: getUserPath(userUsername, '/documents/quotes'),
          dashboard: getUserPath(userUsername, '/dashboard'),
          schedule: getUserPath(userUsername, '/schedule'),
          finance: getUserPath(userUsername, '/finance/payments'),
        }
        router.push(map[view] ?? getUserPath(userUsername, '/documents/quotes'))
      }}
    />
  )
}
