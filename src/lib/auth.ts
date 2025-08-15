import { supabase } from './supabase'
import type { User } from '@supabase/supabase-js'
import type { Database, UserRole } from './supabase'

export type AuthUser = User & {
  user_metadata: {
    name?: string
    avatar_url?: string
  }
}

export interface SignUpData {
  email: string
  password: string
  name: string
  phone?: string
  role?: UserRole
  business_name?: string
  business_number?: string
}

export interface SignInData {
  email: string
  password: string
}

export class AuthService {
  /**
   * 이메일로 회원가입
   */
  static async signUp(data: SignUpData) {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
          }
        }
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('회원가입에 실패했습니다.')

      // 프로필 정보를 users 테이블에 저장
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: data.email,
          name: data.name,
          phone: data.phone,
          role: data.role || 'freelancer',
          business_name: data.business_name,
          business_number: data.business_number,
        })

      if (profileError) {
        console.error('프로필 생성 오류:', profileError)
        // 인증은 성공했지만 프로필 생성 실패시 사용자에게 알림
      }

      return { user: authData.user, session: authData.session }
    } catch (error) {
      console.error('회원가입 오류:', error)
      throw error
    }
  }

  /**
   * 이메일로 로그인
   */
  static async signIn(data: SignInData) {
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) throw error
      return { user: authData.user, session: authData.session }
    } catch (error) {
      console.error('로그인 오류:', error)
      throw error
    }
  }

  /**
   * 구글 소셜 로그인
   */
  static async signInWithGoogle() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('구글 로그인 오류:', error)
      throw error
    }
  }

  /**
   * 카카오 소셜 로그인
   */
  static async signInWithKakao() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'kakao',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('카카오 로그인 오류:', error)
      throw error
    }
  }

  /**
   * 로그아웃
   */
  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('로그아웃 오류:', error)
      throw error
    }
  }

  /**
   * 현재 사용자 정보 가져오기
   */
  static async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error
      return user
    } catch (error) {
      console.error('사용자 정보 조회 오류:', error)
      return null
    }
  }

  /**
   * 현재 세션 가져오기
   */
  static async getCurrentSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error
      return session
    } catch (error) {
      console.error('세션 조회 오류:', error)
      return null
    }
  }

  /**
   * 사용자 프로필 조회
   */
  static async getUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('프로필 조회 오류:', error)
      return null
    }
  }

  /**
   * 사용자 프로필 업데이트
   */
  static async updateUserProfile(
    userId: string, 
    updates: Database['public']['Tables']['users']['Update']
  ) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('프로필 업데이트 오류:', error)
      throw error
    }
  }

  /**
   * 비밀번호 재설정 이메일 발송
   */
  static async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })

      if (error) throw error
    } catch (error) {
      console.error('비밀번호 재설정 오류:', error)
      throw error
    }
  }

  /**
   * 비밀번호 업데이트
   */
  static async updatePassword(newPassword: string) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error
    } catch (error) {
      console.error('비밀번호 업데이트 오류:', error)
      throw error
    }
  }
}

// 인증 상태 변화 감지를 위한 리스너
export function onAuthStateChange(callback: (user: User | null) => void) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user ?? null)
  })
}
