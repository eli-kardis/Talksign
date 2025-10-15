"use client"

import { use, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { extractUsername } from "@/lib/utils"
import DocumentsPage from "@/app/documents/page"

export default function UserDocumentsPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params)
  const router = useRouter()
  const { user, isLoading } = useAuth()

  // 비로그인 사용자는 accounts 도메인 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (!isLoading && !user) {
      console.log('Documents: User not authenticated, redirecting to signin')
      window.location.href = 'https://accounts.talksign.co.kr/auth/signin'
    }
  }, [user, isLoading])

  // 인증된 사용자의 username 검증
  useEffect(() => {
    if (!isLoading && user) {
      const userUsername = extractUsername(user.email)

      // URL의 username과 실제 user의 username이 다르면 올바른 경로로 리디렉션
      if (username !== userUsername) {
        router.replace(`/${userUsername}/documents`)
      }
    }
  }, [user, isLoading, username, router])

  // 로딩 중일 때 표시
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

  // 비로그인 사용자는 null 반환 (useEffect에서 리다이렉트 처리)
  if (!user) {
    return null
  }

  // 기존 DocumentsPage 컴포넌트 렌더링
  return <DocumentsPage />
}
