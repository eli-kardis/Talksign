// 단순화된 인증 서비스
import { supabase } from './supabase'

// 공통 사용자 데이터 타입
export interface UserData {
  email: string
  password: string
  name: string
  phone?: string
  businessName?: string
}

// 통합된 인증 결과 타입
export interface AuthResult {
  success: boolean
  error?: string
}

// 단순한 Auth 서비스
export const auth = {
  // 회원가입
  async signUp(userData: UserData): Promise<AuthResult> {
    try {
      const { error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            phone: userData.phone,
            business_name: userData.businessName
          }
        }
      })

      if (error) {
        return { success: false, error: this.getErrorMessage(error.message) }
      }

      return { success: true }
    } catch {
      return { success: false, error: '회원가입 중 오류가 발생했습니다.' }
    }
  },

  // 로그인
  async signIn(email: string, password: string): Promise<AuthResult> {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        return { success: false, error: this.getErrorMessage(error.message) }
      }

      return { success: true }
    } catch {
      return { success: false, error: '로그인 중 오류가 발생했습니다.' }
    }
  },

  // 로그아웃
  async signOut(): Promise<void> {
    await supabase.auth.signOut()
  },

  // 비밀번호 재설정
  async resetPassword(email: string): Promise<AuthResult> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`
      })

      if (error) {
        return { success: false, error: this.getErrorMessage(error.message) }
      }

      return { success: true }
    } catch {
      return { success: false, error: '비밀번호 재설정 이메일 전송 중 오류가 발생했습니다.' }
    }
  },

  // 비밀번호 업데이트
  async updatePassword(password: string): Promise<AuthResult> {
    try {
      const { error } = await supabase.auth.updateUser({ password })

      if (error) {
        return { success: false, error: this.getErrorMessage(error.message) }
      }

      return { success: true }
    } catch {
      return { success: false, error: '비밀번호 재설정 중 오류가 발생했습니다.' }
    }
  },

  // 에러 메시지 변환
  getErrorMessage(error: string): string {
    if (error.includes('Invalid login credentials')) {
      return '이메일 또는 비밀번호가 올바르지 않습니다.'
    }
    if (error.includes('Email not confirmed')) {
      return '이메일 인증이 필요합니다.'
    }
    if (error.includes('User already registered')) {
      return '이미 가입된 이메일입니다.'
    }
    if (error.includes('Password should be')) {
      return '비밀번호는 최소 6자 이상이어야 합니다.'
    }
    if (error.includes('Invalid email')) {
      return '올바른 이메일 주소를 입력해주세요.'
    }
    if (error.includes('Too many requests')) {
      return '너무 많은 요청이 있었습니다. 잠시 후 다시 시도해주세요.'
    }
    return error
  }
}

