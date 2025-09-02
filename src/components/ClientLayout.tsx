'use client'

import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import HeaderClient from "@/components/HeaderClient"
import { NavTabs } from "@/components/NavTabs"

interface ClientLayoutProps {
  children: React.ReactNode
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname()
  const { user, isLoading } = useAuth()
  
  // 경로 분석
  const isAuthPage = pathname?.startsWith('/auth')
  const isDashboardRoute = pathname?.startsWith('/dashboard')
  const isProtectedRoute = isDashboardRoute || pathname?.startsWith('/documents') || pathname?.startsWith('/finance') || pathname?.startsWith('/schedule')
  
  // 인증 페이지라면 헤더와 네비게이션 없이 렌더링
  if (isAuthPage) {
    return <>{children}</>
  }
  
  // 로딩 중일 때 - 모든 경우에 UI 리턴
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    )
  }
  
  // 보호된 라우트에서 비로그인 사용자 - 각 페이지에서 리다이렉트 처리하므로 로딩 화면만 표시
  if (isProtectedRoute && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">인증 확인 중...</p>
        </div>
      </div>
    )
  }
  
  // 비보호 라우트 또는 로그인된 사용자
  if (!isProtectedRoute || user) {
    // 로그인된 사용자의 보호된 라우트라면 헤더와 네비게이션 포함
    if (isProtectedRoute && user) {
      return (
        <>
          {/* 공통 헤더 */}
          <HeaderClient />

          {/* 공통 탭 내비게이션 */}
          <nav className="bg-background border-b border-border px-4 py-4">
            <div className="max-w-7xl mx-auto">
              <NavTabs />
            </div>
          </nav>

          {/* 페이지 컨텐츠 */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
            {children}
          </main>
        </>
      )
    }
    
    // 비보호 라우트는 헤더/네비게이션 없이 렌더링
    return <>{children}</>
  }
  
  // 모든 경우를 다루었지만 fallback으로 기본 레이아웃 제공
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <p className="text-muted-foreground">페이지를 불러오는 중...</p>
      </div>
    </div>
  )
}
