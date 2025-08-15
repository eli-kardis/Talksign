'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { AuthService, onAuthStateChange } from '@/lib/auth'
import type { Database } from '@/lib/supabase'

type UserProfile = Database['public']['Tables']['users']['Row']

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (data: {
    email: string
    password: string
    name: string
    phone?: string
    role?: 'freelancer' | 'client'
    business_name?: string
    business_number?: string
  }) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInWithKakao: () => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Database['public']['Tables']['users']['Update']) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // 사용자 프로필 로드
  const loadUserProfile = async (userId: string) => {
    try {
      const userProfile = await AuthService.getUserProfile(userId)
      setProfile(userProfile)
    } catch (error) {
      console.error('프로필 로드 실패:', error)
      setProfile(null)
    }
  }

  // 초기 인증 상태 확인
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const currentUser = await AuthService.getCurrentUser()
        setUser(currentUser)
        
        if (currentUser) {
          await loadUserProfile(currentUser.id)
        }
      } catch (error) {
        console.error('인증 초기화 실패:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])

  // 인증 상태 변화 감지
  useEffect(() => {
    const { data: { subscription } } = onAuthStateChange(async (user) => {
      setUser(user)
      
      if (user) {
        await loadUserProfile(user.id)
      } else {
        setProfile(null)
      }
      
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      await AuthService.signIn({ email, password })
      // 인증 상태 변화 리스너가 자동으로 처리함
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const signUp = async (data: {
    email: string
    password: string
    name: string
    phone?: string
    role?: 'freelancer' | 'client'
    business_name?: string
    business_number?: string
  }) => {
    setLoading(true)
    try {
      await AuthService.signUp(data)
      // 인증 상태 변화 리스너가 자동으로 처리함
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const signInWithGoogle = async () => {
    setLoading(true)
    try {
      await AuthService.signInWithGoogle()
      // OAuth 리다이렉트로 인해 페이지가 이동함
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const signInWithKakao = async () => {
    setLoading(true)
    try {
      await AuthService.signInWithKakao()
      // OAuth 리다이렉트로 인해 페이지가 이동함
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      await AuthService.signOut()
      // 인증 상태 변화 리스너가 자동으로 처리함
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const updateProfile = async (updates: Database['public']['Tables']['users']['Update']) => {
    if (!user) throw new Error('로그인이 필요합니다.')
    
    try {
      const updatedProfile = await AuthService.updateUserProfile(user.id, updates)
      setProfile(updatedProfile)
    } catch (error) {
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signInWithKakao,
    signOut,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// 인증이 필요한 라우트를 보호하는 HOC
export function withAuth<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  return function AuthenticatedComponent(props: P) {
    const { user, loading } = useAuth()

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
        </div>
      )
    }

    if (!user) {
      // 로그인 페이지로 리다이렉트하거나 로그인 모달 표시
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              로그인이 필요합니다
            </h2>
            <p className="text-gray-600">
              이 페이지에 접근하려면 로그인해주세요.
            </p>
          </div>
        </div>
      )
    }

    return <Component {...props} />
  }
}
