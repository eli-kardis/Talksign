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
        // 로그인은 accounts 도메인으로
        window.location.href = 'https://accounts.talksign.co.kr/login'
        break
      case 'signup':
        // 회원가입은 accounts 도메인으로
        window.location.href = 'https://accounts.talksign.co.kr/signup'
        break
      default:
        console.warn('Unknown navigation view:', view)
    }
  }

  // ✅ 통합된 인증 플로우 (무한 루프 방지 + URL query parameter 방식)
  useEffect(() => {
    if (isLoading) return

    // URL에서 auth_callback 파라미터 확인 (accounts에서 왔는지 확인)
    const params = new URLSearchParams(window.location.search)
    const isAuthCallback = params.get('auth_callback') === 'true'

    if (user) {
      // ✅ 케이스 1: 로그인된 사용자 → username 경로로 리다이렉트
      console.log('[Auth] User authenticated, redirecting to dashboard')
      const username = user.email.split('@')[0]
      router.replace(`/${username}/dashboard`)
    } else {
      // ✅ 케이스 2: 비로그인 사용자
      if (isAuthCallback) {
        // accounts에서 왔는데 user가 없으면 인증 실패
        console.error('[Auth Error] Authentication failed after redirect from accounts')
        console.error('[Auth Error] User should have been authenticated by now')
        // 에러 페이지나 알림 표시 가능 (현재는 로그만)
      } else {
        // 첫 방문 → accounts로 리다이렉트
        console.log('[Redirect] No user, redirecting to accounts.talksign.co.kr')
        window.location.href = 'https://accounts.talksign.co.kr/auth/signin'
      }
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