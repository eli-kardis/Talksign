'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Signup } from '@/components/Signup'
import { TermsOfService } from '@/components/TermsOfService'
import { PrivacyPolicy } from '@/components/PrivacyPolicy'

export default function SignUpPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [view, setView] = useState('signup')

  useEffect(() => {
    if (!isLoading && user) {
      // 회원가입 성공 시 메인 앱으로 리디렉션
      window.location.href = 'https://app.talksign.co.kr/dashboard'
    }
  }, [user, isLoading])

  const handleNavigate = (newView: string) => {
    if (newView === 'login') {
      router.push('/auth/signin')
    } else if (newView === 'dashboard') {
      // 메인 앱으로 리디렉션
      window.location.href = 'https://app.talksign.co.kr/dashboard'
    } else {
      setView(newView)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (view === 'terms') {
    return <TermsOfService onNavigate={handleNavigate} />
  }

  if (view === 'privacy') {
    return <PrivacyPolicy onNavigate={handleNavigate} />
  }

  return <Signup onNavigate={handleNavigate} />
}