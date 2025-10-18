'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Dashboard } from '@/components/Dashboard'
import { supabase } from '@/lib/supabase'

export interface ScheduleItem {
  id: number
  title: string
  date: string
  time: string
  type: "deadline" | "meeting" | "presentation" | "launch" | "task"
  priority: "high" | "medium" | "low"
  description?: string
}

export default function Page() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [schedules, setSchedules] = useState<ScheduleItem[]>([])
  const [schedulesLoading, setSchedulesLoading] = useState(true)

  // 일정 데이터 로드 (임시로 빈 배열 사용)
  useEffect(() => {
    // 임시로 빈 일정 배열 설정
    setSchedules([])
    setSchedulesLoading(false)
  }, [])

  // 네비게이션 핸들러 - 도메인 구조에 맞춰 수정
  const onNavigate = (view: string) => {
    switch (view) {
      case 'documents':
        router.push('/documents')
        break
      case 'finance':
        router.push('/finance')
        break
      case 'schedule':
        router.push('/schedule')
        break
      case 'new-quote':
        router.push('/documents/quotes/new')
        break
      case 'new-contract':
        router.push('/documents/contracts/new')
        break
      case 'dashboard':
        // 이미 메인에 있으므로 아무것도 하지 않음
        break
      case 'login':
        router.push('/auth/signin')
        break
      case 'signup':
        router.push('/auth/signup')
        break
      default:
        console.warn('Unknown navigation view:', view)
    }
  }

  // 인증 플로우: 로그인된 사용자는 대시보드로, 아니면 로그인 페이지로
  useEffect(() => {
    if (isLoading) return

    if (user?.email) {
      // 로그인된 사용자 → username 경로로 리다이렉트
      console.log('[Auth] User authenticated, redirecting to dashboard')
      const username = user.email.split('@')[0]
      router.replace(`/${username}/dashboard`)
    } else {
      // 비로그인 사용자 → 로그인 페이지로 리다이렉트
      console.log('[Redirect] No user, redirecting to /auth/signin')
      router.replace('/auth/signin')
    }
  }, [user, isLoading, router])

  // 로딩 중일 때
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // 리다이렉트 처리 중
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
    </div>
  )
}