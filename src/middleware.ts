import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const hostname = request.headers.get('host') || ''

  // 개발 환경에서는 미들웨어 비활성화
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    return NextResponse.next()
  }

  // app.talksign.co.kr에서만 앱 기능 허용
  if (hostname === 'app.talksign.co.kr') {
    // 앱 도메인에서는 모든 라우트 허용
    return NextResponse.next()
  }

  // talksign.co.kr (메인 도메인)에서는 랜딩 페이지만 허용
  if (hostname === 'talksign.co.kr') {
    // 앱 관련 라우트 접근 시 app 도메인으로 리다이렉트
    const appRoutes = ['/dashboard', '/documents', '/finance', '/schedule', '/customers', '/auth']

    if (appRoutes.some(route => url.pathname.startsWith(route))) {
      url.hostname = 'app.talksign.co.kr'
      return NextResponse.redirect(url)
    }

    // 루트 경로가 아닌 경우 app 도메인으로 리다이렉트
    if (url.pathname !== '/' && !url.pathname.startsWith('/api/')) {
      url.hostname = 'app.talksign.co.kr'
      return NextResponse.redirect(url)
    }
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