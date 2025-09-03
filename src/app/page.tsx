'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { PageLoadingSpinner } from '@/components/ui/loading-spinner'

export default function Page() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        // 로그인된 사용자는 대시보드로
        console.log('Root: User authenticated, redirecting to dashboard')
        router.replace('/dashboard')
      } else {
        // 비로그인 사용자는 로그인 페이지로
        console.log('Root: User not authenticated, redirecting to signin')
        router.replace('/auth/signin')
      }
    }
  }, [user, isLoading, router])

  // 리다이렉트 중 로딩 표시
  return <PageLoadingSpinner message="페이지 로딩 중..." />
}