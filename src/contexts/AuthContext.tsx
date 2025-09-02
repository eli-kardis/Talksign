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

  // 단순하고 안정적인 초기화
  useEffect(() => {
    console.log('AuthProvider: Starting initialization...')
    
    let mounted = true
    let timeoutId: NodeJS.Timeout

    // 1.5초 후 강제로 로딩 완료 (더 빠른 타임아웃)
    timeoutId = setTimeout(() => {
      if (mounted) {
        console.warn('AuthProvider: Initialization timeout, setting loading to false')
        setIsLoading(false)
      }
    }, 1500)

    // 즉시 세션 확인
    const checkSession = async () => {
      try {
        console.log('AuthProvider: Checking session...')
        
        // Supabase 연결 상태 빠른 확인
        const healthCheck = Promise.race([
          supabase.auth.getSession(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Supabase connection timeout')), 2000)
          )
        ])
        
        const { data: { session }, error } = await healthCheck as any
        
        if (!mounted) return

        if (error) {
          console.error('Session check error:', error)
          // Refresh token 오류인 경우 로컬 스토리지 클리어
          if (error.message?.includes('Refresh Token') || error.message?.includes('Invalid Refresh Token')) {
            console.log('Clearing invalid refresh token from storage')
            await supabase.auth.signOut()
          }
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
          clearTimeout(timeoutId)
          setIsLoading(false)
        }
      }
    }

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
          
          clearTimeout(timeoutId)
          setIsLoading(false)
        } catch (error) {
          console.error('Auth state change error:', error)
          if (mounted) {
            setUser(null)
            clearTimeout(timeoutId)
            setIsLoading(false)
          }
        }
      }
    )

    return () => {
      mounted = false
      clearTimeout(timeoutId)
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