/**
 * 환경 변수 검증 및 타입 안전성 보장
 *
 * 이 파일은 애플리케이션 시작 시 필수 환경 변수를 검증합니다.
 * 누락된 환경 변수가 있으면 명확한 에러 메시지와 함께 애플리케이션을 중단시킵니다.
 */

interface EnvConfig {
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: string
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string
  SUPABASE_SERVICE_ROLE_KEY?: string  // 서버 전용, 선택적
  SUPABASE_JWT_SECRET?: string        // JWT 검증용, 선택적

  // App
  NODE_ENV: 'development' | 'production' | 'test'
  NEXT_PUBLIC_APP_URL?: string
  NEXT_PUBLIC_BASE_URL?: string

  // Lunasoft KakaoTalk API
  LUNASOFT_API_KEY?: string
  LUNASOFT_API_ENDPOINT?: string
  LUNASOFT_USER_ID?: string

  // KakaoTalk Template IDs
  KAKAO_TEMPLATE_QUOTE_SEND?: string
  KAKAO_TEMPLATE_QUOTE_APPROVED?: string
  KAKAO_TEMPLATE_QUOTE_REJECTED?: string
  KAKAO_TEMPLATE_CONTRACT_SEND?: string
  KAKAO_TEMPLATE_CONTRACT_APPROVED?: string
  KAKAO_TEMPLATE_CONTRACT_REJECTED?: string
  KAKAO_TEMPLATE_PAYMENT_REQUEST?: string
  KAKAO_TEMPLATE_PAYMENT_CONFIRMED?: string
}

class EnvironmentError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'EnvironmentError'
  }
}

/**
 * 환경 변수 검증
 *
 * @throws {EnvironmentError} 필수 환경 변수가 누락되었거나 잘못된 경우
 */
function validateEnv(): EnvConfig {
  const errors: string[] = []

  // 필수 환경 변수 검증
  const requiredVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NODE_ENV: process.env.NODE_ENV || 'development',
  }

  // 누락된 변수 확인
  for (const [key, value] of Object.entries(requiredVars)) {
    if (!value || value.trim() === '') {
      errors.push(`Missing required environment variable: ${key}`)
    }
  }

  // Production 환경에서만 검증하는 변수
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      errors.push('Missing SUPABASE_SERVICE_ROLE_KEY in production')
    }
    if (!process.env.SUPABASE_JWT_SECRET) {
      errors.push('Missing SUPABASE_JWT_SECRET in production')
    }
  }

  // URL 형식 검증
  if (requiredVars.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      new URL(requiredVars.NEXT_PUBLIC_SUPABASE_URL)
    } catch {
      errors.push('NEXT_PUBLIC_SUPABASE_URL must be a valid URL')
    }
  }

  // 에러가 있으면 모두 출력하고 중단
  if (errors.length > 0) {
    const errorMessage = [
      '❌ Environment Variable Validation Failed:',
      '',
      ...errors.map(err => `  - ${err}`),
      '',
      'Please check your .env.local file and ensure all required variables are set.',
      '',
      'Required variables:',
      '  - NEXT_PUBLIC_SUPABASE_URL',
      '  - NEXT_PUBLIC_SUPABASE_ANON_KEY',
      '',
      'Production only:',
      '  - SUPABASE_SERVICE_ROLE_KEY',
      '  - SUPABASE_JWT_SECRET',
    ].join('\n')

    throw new EnvironmentError(errorMessage)
  }

  return {
    NEXT_PUBLIC_SUPABASE_URL: requiredVars.NEXT_PUBLIC_SUPABASE_URL!,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: requiredVars.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_JWT_SECRET: process.env.SUPABASE_JWT_SECRET,
    NODE_ENV: requiredVars.NODE_ENV as 'development' | 'production' | 'test',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    LUNASOFT_API_KEY: process.env.LUNASOFT_API_KEY,
    LUNASOFT_API_ENDPOINT: process.env.LUNASOFT_API_ENDPOINT,
    LUNASOFT_USER_ID: process.env.LUNASOFT_USER_ID,
    KAKAO_TEMPLATE_QUOTE_SEND: process.env.KAKAO_TEMPLATE_QUOTE_SEND,
    KAKAO_TEMPLATE_QUOTE_APPROVED: process.env.KAKAO_TEMPLATE_QUOTE_APPROVED,
    KAKAO_TEMPLATE_QUOTE_REJECTED: process.env.KAKAO_TEMPLATE_QUOTE_REJECTED,
    KAKAO_TEMPLATE_CONTRACT_SEND: process.env.KAKAO_TEMPLATE_CONTRACT_SEND,
    KAKAO_TEMPLATE_CONTRACT_APPROVED: process.env.KAKAO_TEMPLATE_CONTRACT_APPROVED,
    KAKAO_TEMPLATE_CONTRACT_REJECTED: process.env.KAKAO_TEMPLATE_CONTRACT_REJECTED,
    KAKAO_TEMPLATE_PAYMENT_REQUEST: process.env.KAKAO_TEMPLATE_PAYMENT_REQUEST,
    KAKAO_TEMPLATE_PAYMENT_CONFIRMED: process.env.KAKAO_TEMPLATE_PAYMENT_CONFIRMED,
  }
}

// 환경 변수 검증 실행
export const env = validateEnv()

// 타입 안전한 환경 변수 접근
export function getEnv(): Readonly<EnvConfig> {
  return env
}

// 서버 전용 환경 변수 (브라우저에서 접근 시 에러)
export function getServerEnv() {
  if (typeof window !== 'undefined') {
    throw new Error('getServerEnv() can only be called on the server side')
  }

  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not available')
  }

  return {
    SUPABASE_SERVICE_ROLE_KEY: env.SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_JWT_SECRET: env.SUPABASE_JWT_SECRET,
    LUNASOFT_API_KEY: env.LUNASOFT_API_KEY,
    LUNASOFT_API_ENDPOINT: env.LUNASOFT_API_ENDPOINT,
    LUNASOFT_USER_ID: env.LUNASOFT_USER_ID,
  }
}

// 환경별 플래그
export const isDevelopment = env.NODE_ENV === 'development'
export const isProduction = env.NODE_ENV === 'production'
export const isTest = env.NODE_ENV === 'test'
