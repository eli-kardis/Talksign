import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const hostname = request.headers.get('host') || ''

  // 개발 환경에서는 미들웨어 비활성화
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    return NextResponse.next()
  }

  // 도메인별 라우팅 처리
  switch (hostname) {
    case 'talksign.co.kr':
      // 랜딩 페이지 도메인: 오직 마케팅 페이지만 허용
      const authRoutes = ['/auth', '/login', '/signup', '/signin']
      const appRoutes = ['/dashboard', '/documents', '/finance', '/schedule', '/customers']

      // 인증 관련 라우트는 accounts 도메인으로 리다이렉트
      if (authRoutes.some(route => url.pathname.startsWith(route))) {
        url.hostname = 'accounts.talksign.co.kr'
        url.pathname = url.pathname.replace('/auth', '') // /auth 접두사 제거
        return NextResponse.redirect(url)
      }

      // 앱 관련 라우트는 app 도메인으로 리다이렉트
      if (appRoutes.some(route => url.pathname.startsWith(route))) {
        url.hostname = 'app.talksign.co.kr'
        return NextResponse.redirect(url)
      }

      // 랜딩 페이지 허용 경로: /, /pricing, /features, /about, /contact
      const allowedLandingPaths = ['/', '/pricing', '/features', '/about', '/contact', '/api']
      if (!allowedLandingPaths.some(path => url.pathname.startsWith(path))) {
        // 허용되지 않은 경로는 홈으로 리다이렉트
        url.pathname = '/'
        return NextResponse.redirect(url)
      }
      break

    case 'accounts.talksign.co.kr':
      // 인증 도메인: 로그인/회원가입만 허용
      const allowedAuthPaths = ['/', '/login', '/signup', '/signin', '/forgot-password', '/reset-password', '/api']
      if (!allowedAuthPaths.some(path => url.pathname.startsWith(path))) {
        // 허용되지 않은 경로는 로그인 페이지로 리다이렉트
        url.pathname = '/login'
        return NextResponse.redirect(url)
      }
      break

    case 'app.talksign.co.kr':
      // 앱 도메인: 모든 앱 기능 허용
      // 인증되지 않은 사용자의 경우 accounts 도메인으로 리다이렉트는 각 페이지에서 처리
      return NextResponse.next()

    default:
      // 알 수 없는 도메인은 메인 랜딩 페이지로 리다이렉트
      url.hostname = 'talksign.co.kr'
      url.pathname = '/'
      return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}