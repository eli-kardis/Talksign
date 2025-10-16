import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
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
        url.hostname = 'account.talksign.co.kr'
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

    case 'account.talksign.co.kr':
      // 인증 도메인: 로그인/회원가입만 허용
      const allowedAuthPaths = ['/', '/login', '/signup', '/signin', '/forgot-password', '/reset-password', '/api', '/auth']
      if (!allowedAuthPaths.some(path => url.pathname.startsWith(path))) {
        // 허용되지 않은 경로는 로그인 페이지로 리다이렉트
        url.pathname = '/auth/signin'
        return NextResponse.redirect(url)
      }
      break

    case 'app.talksign.co.kr':
      // 앱 도메인: 인증 체크 후 보호된 라우트 처리
      // /[username]/* 형식의 라우트 감지
      const usernamePattern = /^\/[^\/]+\/(dashboard|documents|finance|schedule|customers)/
      const isProtectedRoute = usernamePattern.test(url.pathname)
      
      // 공개 라우트 (인증 불필요)
      const publicRoutes = ['/api', '/_next', '/favicon.ico']
      const isPublicRoute = publicRoutes.some(route => url.pathname.startsWith(route))

      if (isProtectedRoute) {
        // 서버 사이드에서 쿠키 기반 세션 확인
        let response = NextResponse.next()
        
        const supabase = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            cookies: {
              get(name: string) {
                return request.cookies.get(name)?.value
              },
              set(name: string, value: string, options: any) {
                response.cookies.set({
                  name,
                  value,
                  ...options,
                  domain: '.talksign.co.kr',
                  sameSite: 'lax',
                  secure: true
                })
              },
              remove(name: string, options: any) {
                response.cookies.set({
                  name,
                  value: '',
                  maxAge: 0,
                  ...options,
                  domain: '.talksign.co.kr'
                })
              }
            }
          }
        )

        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
          // 세션이 없으면 accounts 도메인 로그인 페이지로 리다이렉트
          const redirectUrl = new URL('https://account.talksign.co.kr/auth/signin')
          redirectUrl.searchParams.set('redirect', url.pathname)
          return NextResponse.redirect(redirectUrl)
        }

        // 세션이 있으면 username 검증
        const userEmail = session.user.email
        if (userEmail) {
          const username = userEmail.split('@')[0]
          const pathSegments = url.pathname.split('/').filter(Boolean)

          // URL의 첫 번째 세그먼트가 username인지 확인
          if (pathSegments.length > 0 && pathSegments[0] !== username) {
            // 잘못된 username이면 올바른 경로로 리다이렉트
            const correctPath = `/${username}/${pathSegments.slice(1).join('/')}`
            url.pathname = correctPath
            return NextResponse.redirect(url)
          }
        }

        return response
      }

      if (!isPublicRoute) {
        return NextResponse.next()
      }
      
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