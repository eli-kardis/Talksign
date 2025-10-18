'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Signup } from '@/components/auth/Signup'
import { OtpVerification } from '@/components/auth/OtpVerification'
import { supabase } from '@/lib/supabase'

export default function SignUpPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [view, setView] = useState('signup')
  const [signupEmail, setSignupEmail] = useState('')

  // 이미 로그인된 경우 대시보드로 리다이렉트
  useEffect(() => {
    if (!isLoading && user?.email) {
      const username = user.email.split('@')[0]
      router.replace(`/${username}/dashboard`)
    }
  }, [user, isLoading, router])

  const handleNavigate = (newView: string) => {
    if (newView === 'login') {
      router.push('/auth/signin')
    } else if (newView === 'otp-verification' || newView === 'email-verification') {
      setView('otp-verification')
    } else if (newView === 'terms' || newView === 'privacy') {
      // TODO: 약관 페이지 구현 필요
      // 현재는 외부 링크나 별도 페이지로 처리 가능
      console.log('Navigate to:', newView)
    } else {
      setView(newView)
    }
  }

  const handleResendEmail = async () => {
    if (!signupEmail) return { success: false, error: '이메일 정보가 없습니다.' }

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: signupEmail,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
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

  if (view === 'otp-verification') {
    return (
      <OtpVerification
        email={signupEmail}
        onResendEmail={handleResendEmail}
        onBackToSignup={() => setView('signup')}
      />
    )
  }

  return (
    <Signup
      onNavigate={handleNavigate}
      onSignupSuccess={(email) => {
        setSignupEmail(email)
        handleNavigate('otp-verification')
      }}
    />
  )
}
