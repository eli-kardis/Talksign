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

  // 네비게이션 핸들러
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
      default:
        console.warn('Unknown navigation view:', view)
    }
  }

  // 모든 사용자에게 대시보드 표시 (임시)
  return (
    <Dashboard
      onNavigate={onNavigate}
      schedules={schedules}
      schedulesLoading={schedulesLoading}
    />
  )
}