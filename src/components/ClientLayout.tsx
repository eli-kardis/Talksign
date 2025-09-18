'use client'

import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import HeaderClient from "@/components/HeaderClient"
import { NavTabs } from "@/components/NavTabs"
import { Footer } from "@/components/Footer"
import { PageLoadingSpinner } from "@/components/ui/loading-spinner"
import { SidebarProvider, Sidebar, useSidebar } from "@/components/ui/sidebar"
import { useIsMobile } from "@/components/ui/use-mobile"
import { useEffect } from "react"

interface ClientLayoutProps {
  children: React.ReactNode
}

// 모바일 사이드바 이벤트 처리 컴포넌트
function MobileSidebarEventHandler() {
  const { toggleSidebar } = useSidebar();

  useEffect(() => {
    const handleToggle = () => {
      toggleSidebar();
    };

    window.addEventListener('toggleMobileSidebar', handleToggle);
    return () => window.removeEventListener('toggleMobileSidebar', handleToggle);
  }, [toggleSidebar]);

  return null;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname()
  const { user, isLoading } = useAuth()
  const isMobile = useIsMobile()
  
  // 경로 분석
  const isAuthPage = pathname?.startsWith('/auth')
  const isRootPage = pathname === '/'
  const isDashboardRoute = pathname?.startsWith('/dashboard')
  const isProtectedRoute = isDashboardRoute || pathname?.startsWith('/documents') || pathname?.startsWith('/finance') || pathname?.startsWith('/schedule') || pathname?.startsWith('/customers')
  
  // 인증 페이지나 루트 페이지라면 헤더와 네비게이션 없이 렌더링
  if (isAuthPage || isRootPage) {
    return <>{children}</>
  }
  
  // 로딩 중일 때 - 모든 경우에 UI 리턴
  if (isLoading) {
    return <PageLoadingSpinner message="애플리케이션 초기화 중..." />
  }
  
  // 보호된 라우트에서 비로그인 사용자 - 각 페이지에서 리다이렉트 처리하므로 로딩 화면만 표시
  if (isProtectedRoute && !user) {
    return <PageLoadingSpinner message="인증 확인 중..." />
  }
  
  // 비보호 라우트 또는 로그인된 사용자
  if (!isProtectedRoute || user) {
    // 로그인된 사용자의 보호된 라우트라면 헤더와 사이드바 포함
    if (isProtectedRoute && user) {
      // 모바일에서는 SidebarProvider 사용, 데스크톱에서는 전통적 레이아웃
      if (isMobile) {
        return (
          <div className="min-h-screen bg-background flex flex-col">
            {/* 공통 헤더 */}
            <HeaderClient />

            <SidebarProvider defaultOpen={false}>
              <MobileSidebarEventHandler />
              {/* 모바일 사이드바 */}
              <Sidebar
                collapsible="offcanvas"
                className="bg-sidebar border-r border-sidebar-border [&>*]:bg-sidebar [&_*]:bg-sidebar"
                style={{
                  backgroundColor: 'var(--sidebar)',
                  borderColor: 'var(--sidebar-border)'
                }}
              >
                <div
                  className="bg-sidebar h-full w-full flex flex-col"
                  style={{
                    backgroundColor: 'var(--sidebar)',
                    color: 'var(--sidebar-foreground)'
                  }}
                >
                  {/* 모바일 사이드바 헤더 */}
                  <div className="p-4 border-b border-sidebar-border">
                    <h1 className="text-lg font-medium text-sidebar-foreground">Link Flow</h1>
                  </div>

                  {/* 네비게이션 탭들 */}
                  <div className="p-4 flex-1">
                    <NavTabs />
                  </div>
                </div>
              </Sidebar>
            </SidebarProvider>

            {/* 페이지 컨텐츠 - 모바일에서는 전체 너비 사용 */}
            <main className="w-full flex-1">
              <div className="px-4 py-6 mx-auto md:px-10 md:py-12 lg:max-w-[1440px]">
                {children}
              </div>
            </main>

            {/* 푸터 */}
            <Footer />
          </div>
        )
      } else {
        // 데스크톱 전통적 레이아웃
        return (
          <div className="min-h-screen bg-background flex flex-col">
            {/* 공통 헤더 */}
            <HeaderClient />

            <div className="flex flex-1">
              {/* 왼쪽 사이드바 - 데스크톱 */}
              <aside className="w-64 bg-card border-r border-border sticky top-0" style={{ height: 'calc(100vh - 56px)' }}>
                <nav className="p-4">
                  <NavTabs />
                </nav>
              </aside>

              {/* 페이지 컨텐츠 */}
              <main className="flex-1 flex flex-col">
                <div className="px-4 py-6 mx-auto md:px-10 md:py-12 lg:max-w-[1440px] flex-1">
                  {children}
                </div>

                {/* 푸터 */}
                <Footer />
              </main>
            </div>
          </div>
        )
      }
    }
    
    // 비보호 라우트는 헤더/네비게이션 없이 렌더링
    return <>{children}</>
  }
  
  // 모든 경우를 다루었지만 fallback으로 기본 레이아웃 제공
  return <PageLoadingSpinner message="페이지를 불러오는 중..." />
}
