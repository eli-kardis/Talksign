import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url)
    const token_hash = requestUrl.searchParams.get('token_hash')
    const code = requestUrl.searchParams.get('code')
    const type = requestUrl.searchParams.get('type')
    const next = requestUrl.searchParams.get('next')

    console.log('[Callback] Request URL:', requestUrl.toString())
    console.log('[Callback] Params:', { token_hash: !!token_hash, code: !!code, type, next })

    // 환경 변수 체크
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('[Callback] Missing environment variables')
      return new NextResponse('Server configuration error - Missing environment variables', { status: 500 })
    }

    console.log('[Callback] Environment variables OK')

    // 리다이렉트 응답 생성
    let redirectUrl = 'https://app.talksign.co.kr/dashboard'
    const response = NextResponse.redirect(redirectUrl)

    // Supabase 클라이언트 생성 - 쿠키를 response에 직접 설정
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
            // Supabase가 설정하려는 쿠키를 response에 추가
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options as any)
            })
          },
        },
      }
    )

  // token_hash를 사용하는 이메일 링크 (회원가입 인증)
  if (token_hash && type) {
    try {
      console.log('[Callback] Verifying OTP with type:', type)

      const { data, error } = await supabase.auth.verifyOtp({
        token_hash,
        type: type === 'recovery' ? 'recovery' : 'email',
      })

      if (error) {
        console.error('[Callback] OTP error:', error)
        const redirectUrl = type === 'recovery'
          ? `${requestUrl.origin}/auth/reset-password?error=invalid_link`
          : `${requestUrl.origin}/auth/signin?error=verification_failed&message=${encodeURIComponent(error.message)}`
        return NextResponse.redirect(redirectUrl)
      }

      console.log('[Callback] OTP verified:', data.user?.email)

      // 비밀번호 재설정
      if (type === 'recovery' || next === '/auth/reset-password') {
        const resetResponse = NextResponse.redirect(`${requestUrl.origin}/auth/reset-password`)
        return resetResponse
      }

      // 이메일 인증 성공 - 바로 대시보드로 리다이렉트
      console.log('[Callback] Email verified, redirecting to dashboard')
      return response
    } catch (error) {
      console.error('[Callback] Exception:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      return NextResponse.redirect(`${requestUrl.origin}/auth/signin?error=callback_error&message=${encodeURIComponent(errorMessage)}`)
    }
  }

  // OAuth code 처리 (Google OAuth 로그인 또는 비밀번호 재설정)
  if (code) {
    try {
      console.log('[Callback] Exchanging code for session...')
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error('[Callback] Code exchange error:', error)
        // 비밀번호 재설정 요청인 경우에만 reset-password로
        if (next === '/auth/reset-password') {
          return NextResponse.redirect(`${requestUrl.origin}/auth/reset-password?error=invalid_link`)
        }
        return NextResponse.redirect(`${requestUrl.origin}/auth/signin?error=auth_failed`)
      }

      console.log('[Callback] Session exchanged successfully for user:', data.user?.email)
      console.log('[Callback] Session cookies should be set by Supabase client')

      // 비밀번호 재설정 요청인지 확인
      if (next === '/auth/reset-password') {
        const resetResponse = NextResponse.redirect(`${requestUrl.origin}/auth/reset-password`)
        return resetResponse
      }

      // Google OAuth 로그인 - 대시보드로 리다이렉트
      // response는 이미 위에서 생성되었고, Supabase가 setAll을 통해 쿠키를 설정함
      console.log('[Callback] Redirecting to dashboard with session cookies')
      return response
    } catch (error) {
      console.error('[Callback] Exception:', error)
      if (next === '/auth/reset-password') {
        return NextResponse.redirect(`${requestUrl.origin}/auth/reset-password?error=callback_error`)
      }
      return NextResponse.redirect(`${requestUrl.origin}/auth/signin?error=callback_error`)
    }
  }

    // 코드가 없으면 에러
    console.log('[Callback] No code or token_hash provided')
    return NextResponse.redirect(`${requestUrl.origin}/auth/signin?error=no_code`)
  } catch (error) {
    console.error('[Callback] Unexpected error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new NextResponse(`Callback error: ${errorMessage}`, { status: 500 })
  }
}