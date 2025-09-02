import { apiRequest } from './supabase'

// API 호출을 위한 헬퍼 함수 (기존 apiCall을 apiRequest로 대체)
const apiCall = apiRequest

// 회원가입
export async function signUp(userData: {
  name: string
  email: string
  password: string
  businessName?: string
  phone: string
}) {
  return apiCall('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(userData),
  })
}

// 로그인 검증 및 사용자 정보 조회
export async function verifyUser() {
  return apiCall('/auth/verify', {
    method: 'POST',
  })
}

// 소셜 로그인 사용자 정보 완성
export async function completeSocialProfile(data: {
  businessName?: string
  phone: string
}) {
  return apiCall('/auth/social-complete', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// 사용자 프로필 조회
export async function getUserProfile() {
  return apiCall('/user/profile')
}

// 사용자 데이터 저장 (견적서, 계약서, 일정 등)
export async function saveUserData(type: string, data: Record<string, unknown>) {
  return apiCall(`/user/data/${type}`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// 사용자 데이터 조회
export async function getUserData(type: string) {
  return apiCall(`/user/data/${type}`)
}

// 특정 타입의 데이터 저장/조회를 위한 편의 함수들

// 견적서 저장
export async function saveQuotes(quotes: unknown[]) {
  return saveUserData('quotes', { quotes })
}

// 견적서 조회
export async function getQuotes() {
  const result = await getUserData('quotes')
  return result.data?.quotes || []
}

// 계약서 저장
export async function saveContracts(contracts: unknown[]) {
  return saveUserData('contracts', { contracts })
}

// 계약서 조회
export async function getContracts() {
  const result = await getUserData('contracts')
  return result.data?.contracts || []
}

// 일정 저장
export async function saveSchedules(schedules: unknown[]) {
  return saveUserData('schedules', { schedules })
}

// 일정 조회
export async function getSchedules() {
  const result = await getUserData('schedules')
  return result.data?.schedules || []
}

// 재무 데이터 저장
export async function saveFinancialData(financialData: Record<string, unknown>) {
  return saveUserData('finance', financialData)
}

// 재무 데이터 조회
export async function getFinancialData() {
  const result = await getUserData('finance')
  return result.data || {}
}

// 설정 저장
export async function saveSettings(settings: Record<string, unknown>) {
  return saveUserData('settings', settings)
}

// 설정 조회
export async function getSettings() {
  const result = await getUserData('settings')
  return result.data || {}
}
