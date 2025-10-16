import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

/**
 * accounts 도메인에서 로그인 후 app 도메인으로 세션을 전달하는 엔드포인트
 *
 * Flow:
 * 1. accounts.talksign.co.kr에서 OAuth 로그인 완료
 * 2. accounts 콜백이 세션 토큰을 URL 파라미터로 app.talksign.co.kr/auth/session에 전달
 * 3. 이 엔드포인트가 토큰을 받아서 app 도메인에 쿠키 설정
 * 4. 대시보드로 리다이렉트
 */
export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url)
    const access_token = requestUrl.searchParams.get('access_token')
    const refresh_token = requestUrl.searchParams.get('refresh_token')

    console.log('[Session] Received tokens:', {
      has_access: !!access_token,
      has_refresh: !!refresh_token
    })

    if (!access_token || !refresh_token) {
      console.error('[Session] Missing tokens')
      return NextResponse.redirect(`${requestUrl.origin}/auth/signin?error=missing_tokens`)
    }

    // Supabase 클라이언트 생성
    const response = NextResponse.redirect(`${requestUrl.origin}/dashboard`)

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, {
                ...options,
                domain: '.talksign.co.kr',
                path: '/',
                sameSite: 'lax',
                secure: true,
              })
            })
          },
        },
      }
    )

    // 세션 설정
    const { data, error } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    })

    if (error) {
      console.error('[Session] Set session error:', error)
      return NextResponse.redirect(`${requestUrl.origin}/auth/signin?error=session_failed`)
    }

    console.log('[Session] Session set successfully for user:', data.user?.email)

    return response
  } catch (error) {
    console.error('[Session] Unexpected error:', error)
    const url = new URL(request.url)
    return NextResponse.redirect(`${url.origin}/auth/signin?error=session_error`)
  }
}
