'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Login } from '@/components/Login'

export default function SignInPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()


  useEffect(() => {
    if (!isLoading && user) {
      router.push('/dashboard')
    }
  }, [user, isLoading, router])

  const handleNavigate = (newView: string) => {
    if (newView === 'dashboard') {
      router.push('/dashboard')
    } else if (newView === 'signup') {
      router.push('/auth/signup')
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

  return <Login onNavigate={handleNavigate} />
}


