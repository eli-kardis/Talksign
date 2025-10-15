"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Dashboard } from "@/components/Dashboard"
import { supabase } from "@/lib/supabase"
import { extractUsername, getUserPath } from "@/lib/utils"

export interface ScheduleItem {
  id: number
  title: string
  date: string
  time: string
  type: "deadline" | "meeting" | "presentation" | "launch" | "task"
  priority: "high" | "medium" | "low"
  description?: string
}

export default function UserDashboardPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params)
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [schedules, setSchedules] = useState<ScheduleItem[]>([])
  const [schedulesLoading, setSchedulesLoading] = useState(true)

  // 일정 데이터 로드 및 주기적 업데이트
  useEffect(() => {
    if (user?.id) {
      loadSchedules()

      // 5분마다 일정 데이터 새로고침
      const interval = setInterval(() => {
        loadSchedules()
      }, 5 * 60 * 1000) // 5분

      return () => clearInterval(interval)
    }
  }, [user?.id])

  const loadSchedules = async () => {
    try {
      setSchedulesLoading(true)

      console.log('Loading schedules for user:', user?.id)

      // 오늘부터 30일 이내 일정을 가져오기 (과거 일정도 포함)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayString = today.toISOString().split('T')[0]

      const { data: schedules, error, count } = await supabase
        .from('schedules')
        .select('*', { count: 'exact' })
        .eq('user_id', user?.id)
        .order('start_date', { ascending: true })
        .order('start_time', { ascending: true })
        .limit(5)

      console.log('Schedules query result:', {
        data: schedules,
        error,
        count,
        user_id: user?.id
      })

      if (error) {
        console.error('Error loading schedules:', error)
        return
      }

      if (!schedules || schedules.length === 0) {
        console.log('No schedules found for user')
        setSchedules([])
        return
      }

      // Supabase 데이터를 Dashboard 컴포넌트 형식으로 변환
      const formattedSchedules = schedules.map((schedule: any, index: number) => {
        console.log(`Schedule ${index + 1}:`, schedule)

        return {
          id: index + 1, // 단순히 배열 인덱스 사용
          title: schedule.title,
          date: schedule.start_date,
          time: schedule.start_time || '00:00',
          type: schedule.type,
          priority: schedule.priority,
          description: schedule.description
        }
      })

      console.log('Formatted schedules:', formattedSchedules)
      setSchedules(formattedSchedules)
    } catch (error) {
      console.error('Error loading schedules:', error)
    } finally {
      setSchedulesLoading(false)
    }
  }

  // 비로그인 사용자는 accounts 도메인 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (!isLoading && !user) {
      console.log('Dashboard: User not authenticated, redirecting to signin')
      window.location.href = 'https://accounts.talksign.co.kr/auth/signin'
    }
  }, [user, isLoading])

  // 인증된 사용자의 username 검증
  useEffect(() => {
    if (!isLoading && user) {
      const userUsername = extractUsername(user.email)

      // URL의 username과 실제 user의 username이 다르면 올바른 경로로 리디렉션
      if (username !== userUsername) {
        router.replace(getUserPath(userUsername, '/dashboard'))
      }
    }
  }, [user, isLoading, username, router])

  // 네비게이션 핸들러 - username 기반 경로 사용
  const onNavigate = (view: string) => {
    const userUsername = user?.email ? extractUsername(user.email) : username

    switch (view) {
      case 'documents':
        router.push(getUserPath(userUsername, '/documents'))
        break
      case 'customers':
        router.push(getUserPath(userUsername, '/customers'))
        break
      case 'finance':
        router.push(getUserPath(userUsername, '/finance'))
        break
      case 'schedule':
        router.push(getUserPath(userUsername, '/schedule'))
        break
      case 'new-quote':
        router.push(getUserPath(userUsername, '/documents/quotes/new'))
        break
      case 'new-contract':
        router.push(getUserPath(userUsername, '/documents/contracts/new'))
        break
      case 'dashboard':
        // 이미 대시보드에 있으므로 아무것도 하지 않음
        break
      default:
        console.warn('Unknown navigation view:', view)
    }
  }

  // 로딩 중일 때 표시
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">대시보드 로딩 중...</p>
        </div>
      </div>
    )
  }

  // 비로그인 사용자는 null 반환 (useEffect에서 리다이렉트 처리)
  if (!user) {
    return null
  }

  return (
    <Dashboard
      onNavigate={onNavigate}
      schedules={schedules}
      schedulesLoading={schedulesLoading}
    />
  )
}
