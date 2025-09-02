"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Dashboard } from "@/components/Dashboard"

export interface ScheduleItem {
  id: number
  title: string
  date: string
  time: string
  type: "deadline" | "meeting" | "presentation" | "launch" | "task"
  priority: "high" | "medium" | "low"
  description?: string
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  
  const [schedules, setSchedules] = useState<ScheduleItem[]>([
    {
      id: 1,
      title: "스타트업 A 웹사이트 1차 시안 제출",
      date: "2025-08-16",
      time: "14:00",
      type: "deadline",
      priority: "high",
      description: "웹사이트 1차 시안 완성 후 클라이언트에게 제출",
    },
    {
      id: 2,
      title: "기업 B와 계약서 검토 회의",
      date: "2025-08-17",
      time: "10:30",
      type: "meeting",
      priority: "medium",
      description: "계약 조건 및 세부사항 논의",
    },
  ])

  // 비로그인 사용자는 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (!isLoading && !user) {
      console.log('Dashboard: User not authenticated, redirecting to signin')
      router.replace('/auth/signin')
    }
  }, [user, isLoading, router])

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
        // 이미 대시보드에 있으므로 아무것도 하지 않음
        break
      default:
        console.warn('Unknown navigation view:', view)
        // 대시보드에서 대시보드로 리다이렉트하면 루프가 발생하므로 제거
    }
  }

  // 일정 핸들러
  const handleAddSchedule = (schedule: Omit<ScheduleItem, "id">) => {
    const newId = Math.max(...schedules.map((s) => s.id), 0) + 1
    setSchedules((prev) => [...prev, { ...schedule, id: newId }])
  }
  
  const handleUpdateSchedule = (id: number, updated: Omit<ScheduleItem, "id">) => {
    setSchedules((prev) => prev.map((s) => (s.id === id ? { ...updated, id } : s)))
  }
  
  const handleDeleteSchedule = (id: number) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id))
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
    />
  )
}