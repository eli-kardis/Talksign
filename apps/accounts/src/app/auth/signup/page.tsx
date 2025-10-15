'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Signup } from '@/components/Signup'
import { TermsOfService } from '@/components/TermsOfService'
import { PrivacyPolicy } from '@/components/PrivacyPolicy'
import { EmailVerification } from '@/components/EmailVerification'
import { supabase } from '@/lib/supabase'

export default function SignUpPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [view, setView] = useState('signup')
  const [signupEmail, setSignupEmail] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)

  // URL에서 이메일 인증 토큰 확인 및 자동 처리
  useEffect(() => {
    const token_hash = searchParams.get('token_hash')
    const type = searchParams.get('type')

    if (token_hash && type === 'email' && !isVerifying) {
      setIsVerifying(true)
      handleEmailVerification(token_hash)
    }
  }, [searchParams, isVerifying])

  const handleEmailVerification = async (token_hash: string) => {
    try {
      console.log('[Signup] Auto-verifying email with token...')

      const { data, error } = await supabase.auth.verifyOtp({
        token_hash,
        type: 'email',
      })

      if (error) {
        console.error('[Signup] Verification error:', error)
        setIsVerifying(false)
        return
      }

      console.log('[Signup] Email verified successfully:', data.user?.email)

      // 인증 성공 - 1초 후 대시보드로 리다이렉트
      setTimeout(() => {
        window.location.href = 'https://app.talksign.co.kr/dashboard'
      }, 1000)
    } catch (error) {
      console.error('[Signup] Verification exception:', error)
      setIsVerifying(false)
    }
  }

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
    } else if (newView === 'email-verification') {
      // 회원가입 후 이메일 인증 페이지로
      setView('email-verification')
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

  if (isLoading || isVerifying) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {isVerifying ? '이메일 인증 중...' : '로딩 중...'}
          </p>
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

  if (view === 'email-verification') {
    return (
      <EmailVerification
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
        handleNavigate('email-verification')
      }}
    />
  )
}