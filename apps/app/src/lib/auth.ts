// 단순화된 인증 서비스
import { supabase } from './supabase'

// 공통 사용자 데이터 타입
export interface UserData {
  email: string
  password: string
  name: string // 대표자명
  phone: string // 연락처
  businessRegistrationNumber?: string // 사업자등록번호 (선택)
  companyName?: string // 회사명 (사업자등록번호 입력시에만)
  businessName?: string // 기존 호환성을 위해 유지
  businessAddress?: string // 사업장 주소 (선택)
  fax?: string // 팩스 (선택)
  businessType?: string // 업태 (선택)
  businessCategory?: string // 업종 (선택)
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
            business_registration_number: userData.businessRegistrationNumber,
            company_name: userData.companyName,
            business_name: userData.businessName // 기존 호환성
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

  // 사용자 프로필 업데이트
  async updateProfile(userData: Partial<UserData>): Promise<AuthResult> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return { success: false, error: '인증되지 않은 사용자입니다.' }
      }

      // 이메일이 변경된 경우 Supabase Auth 업데이트
      if (userData.email && userData.email !== user.email) {
        const { error: authError } = await supabase.auth.updateUser({
          email: userData.email
        })

        if (authError) {
          return { success: false, error: this.getErrorMessage(authError.message) }
        }
      }

      // users 테이블 업데이트
      const { error: dbError } = await supabase
        .from('users')
        .update({
          name: userData.name,
          phone: userData.phone,
          email: userData.email,
          business_registration_number: userData.businessRegistrationNumber || null,
          company_name: userData.companyName || null,
          business_name: userData.businessName || null,
          business_address: userData.businessAddress || null,
          fax: userData.fax || null,
          business_type: userData.businessType || null,
          business_category: userData.businessCategory || null
        })
        .eq('id', user.id)

      if (dbError) {
        return { success: false, error: '공급자 정보 업데이트에 실패했습니다.' }
      }

      return { success: true }
    } catch {
      return { success: false, error: '공급자 정보 업데이트 중 오류가 발생했습니다.' }
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

