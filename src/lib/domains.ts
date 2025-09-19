// 도메인별 URL 관리 유틸리티

export const DOMAINS = {
  LANDING: process.env.NEXT_PUBLIC_LANDING_DOMAIN || 'https://talksign.co.kr',
  ACCOUNTS: process.env.NEXT_PUBLIC_ACCOUNTS_DOMAIN || 'https://accounts.talksign.co.kr',
  APP: process.env.NEXT_PUBLIC_APP_DOMAIN || 'https://app.talksign.co.kr',
} as const

export const ROUTES = {
  // 랜딩 페이지 라우트
  LANDING: {
    HOME: '/',
    PRICING: '/pricing',
    FEATURES: '/features',
    ABOUT: '/about',
    CONTACT: '/contact',
  },
  // 인증 페이지 라우트
  ACCOUNTS: {
    LOGIN: '/login',
    SIGNUP: '/signup',
    SIGNIN: '/signin',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
  },
  // 앱 라우트
  APP: {
    DASHBOARD: '/dashboard',
    DOCUMENTS: '/documents',
    CUSTOMERS: '/customers',
    FINANCE: '/finance',
    SCHEDULE: '/schedule',
  },
} as const

/**
 * 도메인별 URL 생성 헬퍼
 */
export const createUrl = {
  landing: (path: string = '/') => `${DOMAINS.LANDING}${path}`,
  accounts: (path: string = '/') => `${DOMAINS.ACCOUNTS}${path}`,
  app: (path: string = '/') => `${DOMAINS.APP}${path}`,
}

/**
 * 현재 도메인 확인
 */
export const getCurrentDomain = (): keyof typeof DOMAINS | null => {
  if (typeof window === 'undefined') return null

  const hostname = window.location.hostname

  if (hostname.includes('accounts.talksign.co.kr')) return 'ACCOUNTS'
  if (hostname.includes('app.talksign.co.kr')) return 'APP'
  if (hostname.includes('talksign.co.kr')) return 'LANDING'

  return null
}

/**
 * 도메인별 리다이렉트 헬퍼
 */
export const redirect = {
  toLogin: () => {
    window.location.href = createUrl.accounts(ROUTES.ACCOUNTS.LOGIN)
  },
  toSignup: () => {
    window.location.href = createUrl.accounts(ROUTES.ACCOUNTS.SIGNUP)
  },
  toApp: (path: string = ROUTES.APP.DASHBOARD) => {
    window.location.href = createUrl.app(path)
  },
  toLanding: (path: string = ROUTES.LANDING.HOME) => {
    window.location.href = createUrl.landing(path)
  },
}

/**
 * 인증 성공 후 앱으로 리다이렉트
 */
export const redirectToAppAfterAuth = (returnTo?: string) => {
  const appUrl = returnTo || createUrl.app(ROUTES.APP.DASHBOARD)
  window.location.href = appUrl
}

/**
 * 인증 실패 시 로그인으로 리다이렉트
 */
export const redirectToLoginIfNotAuth = (returnTo?: string) => {
  const loginUrl = createUrl.accounts(ROUTES.ACCOUNTS.LOGIN)
  const redirectUrl = returnTo ? `${loginUrl}?returnTo=${encodeURIComponent(returnTo)}` : loginUrl
  window.location.href = redirectUrl
}