'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@/types/user'
import { supabase } from '@/lib/supabase'
import { auth, type UserData, type AuthResult } from '@/lib/auth'

type AuthContextType = {
  user: User | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<AuthResult>
  signUp: (data: UserData) => Promise<AuthResult>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<AuthResult>
  updatePassword: (password: string) => Promise<AuthResult>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // 강화된 초기화 (타임아웃 방어 로직 포함)
  useEffect(() => {
    console.log('AuthProvider: Starting enhanced initialization...')
    
    let mounted = true
    let timeoutId: NodeJS.Timeout

    // 10초 후 강제로 로딩 완료 (방어 로직)
    const setTimeoutDefense = () => {
      timeoutId = setTimeout(() => {
        if (mounted) {
          console.warn('AuthProvider: Timeout reached, forcing isLoading to false')
          setIsLoading(false)
        }
      }, 10000)
    }

    // 타임아웃 클리어 헬퍼
    const clearTimeoutDefense = () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }

    // 즉시 세션 확인
    const checkSession = async () => {
      try {
        console.log('AuthProvider: Checking session...')
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (!mounted) return

        if (error) {
          console.error('Session check error:', error)
          setUser(null)
        } else {
          console.log('Session check:', session?.user ? 'User found' : 'No user')
          
          if (session?.user) {
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || '',
              provider: 'email',
            })
          } else {
            setUser(null)
          }
        }
      } catch (error) {
        console.error('Session check error:', error)
        setUser(null)
      } finally {
        if (mounted) {
          clearTimeoutDefense()
          setIsLoading(false)
        }
      }
    }

    // 타임아웃 방어 로직 시작
    setTimeoutDefense()

    // 세션 확인 실행
    checkSession()

    // Auth 상태 변경 리스너 (에러 처리 포함)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        try {
          console.log('Auth state change:', event)
          
          if (!mounted) return

          if (session?.user) {
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || '',
              provider: 'email',
            })
          } else {
            setUser(null)
          }
          
          clearTimeoutDefense()
          setIsLoading(false)
        } catch (error) {
          console.error('Auth state change error:', error)
          if (mounted) {
            setUser(null)
            clearTimeoutDefense()
            setIsLoading(false)
          }
        }
      }
    )

    return () => {
      mounted = false
      clearTimeoutDefense()
      subscription.unsubscribe()
    }
  }, [])

  // Auth 함수들 (에러 처리 강화)
  const signIn = async (email: string, password: string) => {
    try {
      return await auth.signIn(email, password)
    } catch (error) {
      console.error('SignIn error:', error)
      throw error
    }
  }

  const signUp = async (userData: UserData) => {
    try {
      return await auth.signUp(userData)
    } catch (error) {
      console.error('SignUp error:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      await auth.signOut()
      setUser(null)
      router.push('/auth/signin')
    } catch (error) {
      console.error('SignOut error:', error)
      // 에러가 있어도 로컬 상태는 클리어
      setUser(null)
      router.push('/auth/signin')
    }
  }

  const resetPassword = async (email: string) => {
    try {
      return await auth.resetPassword(email)
    } catch (error) {
      console.error('ResetPassword error:', error)
      throw error
    }
  }

  const updatePassword = async (password: string) => {
    try {
      return await auth.updatePassword(password)
    } catch (error) {
      console.error('UpdatePassword error:', error)
      throw error
    }
  }

  const value = {
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}