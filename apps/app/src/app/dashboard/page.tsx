"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"

export default function DashboardPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  // 비로그인 사용자는 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (!isLoading && !user) {
      console.log('Dashboard: User not authenticated, redirecting to signin')
      window.location.href = '/auth/signin'
    }
  }, [user, isLoading])

  // 인증된 사용자는 username 포함 경로로 리디렉션
  useEffect(() => {
    if (!isLoading && user) {
      const username = user.email.split('@')[0]
      router.replace(`/${username}/dashboard`)
    }
  }, [user, isLoading, router])

  // 로딩 중일 때 표시
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">대시보드로 이동 중...</p>
        </div>
      </div>
    )
  }

  // 비로그인 사용자는 null 반환 (useEffect에서 리다이렉트 처리)
  if (!user) {
    return null
  }

  return null
}