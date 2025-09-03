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

// public.users 테이블에 사용자 레코드가 있는지 확인하고 없으면 생성
async function ensureUserExists(authUser: any) {
  try {
    // 기존 사용자 확인
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('id', authUser.id)
      .single()

    if (checkError && checkError.code === 'PGRST116') {
      // 사용자가 없으면 생성
      console.log('Creating user record in public.users table')
      const { error: insertError } = await supabase
        .from('users')
        .insert([{
          id: authUser.id,
          email: authUser.email || '',
          name: authUser.user_metadata?.name || authUser.user_metadata?.full_name || 'Unknown User',
          phone: authUser.user_metadata?.phone || null,
          business_name: authUser.user_metadata?.business_name || null,
          role: 'freelancer'
        }])

      if (insertError) {
        console.error('Error creating user record:', insertError)
      } else {
        console.log('User record created successfully')
      }
    } else if (checkError) {
      console.error('Error checking user existence:', checkError)
    }
  } catch (error) {
    console.error('Error in ensureUserExists:', error)
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // 간단하고 안정적인 초기화
  useEffect(() => {
    console.log('AuthProvider: Starting initialization...')
    
    let mounted = true

    // 즉시 세션 확인
    const checkSession = async () => {
      try {
        console.log('AuthProvider: Checking session...')
        
        // 타임아웃과 함께 세션 확인
        const sessionPromise = supabase.auth.getSession()
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session check timeout')), 3000)
        )
        
        const result = await Promise.race([sessionPromise, timeoutPromise])
        const { data: { session }, error } = result as any
        
        if (!mounted) return

        if (error) {
          console.error('Session check error:', error)
          // 네트워크 오류나 타임아웃인 경우 로그아웃 처리하지 않음
          if (error.message?.includes('network') || error.message?.includes('timeout')) {
            console.warn('Network/timeout error, treating as no session')
            setUser(null)
          } else if (error.message?.includes('Refresh Token') || error.message?.includes('Invalid Refresh Token')) {
            console.log('Clearing invalid refresh token from storage')
            try {
              await supabase.auth.signOut()
            } catch (signOutError) {
              console.error('Error signing out:', signOutError)
            }
            setUser(null)
          } else {
            console.warn('Unknown auth error, treating as no session:', error)
            setUser(null)
          }
        } else {
          console.log('Session check:', session?.user ? 'User found' : 'No user')
          
          if (session?.user) {
            // public.users 테이블에 사용자 레코드 확인/생성
            await ensureUserExists(session.user)
            
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
        console.error('Session check failed:', error)
        // 네트워크 오류 등의 경우 사용자를 null로 설정
        setUser(null)
      } finally {
        if (mounted) {
          console.log('AuthProvider: Setting loading to false')
          setIsLoading(false)
        }
      }
    }

    // 강제 타임아웃 (최대 1초)
    const forceTimeout = setTimeout(() => {
      if (mounted) {
        console.warn('AuthProvider: Force timeout reached')
        setIsLoading(false)
      }
    }, 1000)

    // 세션 확인 실행
    checkSession()

    // Auth 상태 변경 리스너 (에러 처리 포함)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        try {
          console.log('Auth state change:', event)
          
          if (!mounted) return

          if (session?.user) {
            ensureUserExists(session.user)
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || '',
              provider: 'email',
            })
          } else {
            setUser(null)
          }
          
          clearTimeout(forceTimeout)
          setIsLoading(false)
        } catch (error) {
          console.error('Auth state change error:', error)
          if (mounted) {
            setUser(null)
            clearTimeout(forceTimeout)
            setIsLoading(false)
          }
        }
      }
    )

    return () => {
      mounted = false
      clearTimeout(forceTimeout)
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