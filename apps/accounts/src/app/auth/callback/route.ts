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

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set({ name, value, ...options })
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
        return NextResponse.redirect(`${requestUrl.origin}/auth/reset-password`, { headers: response.headers })
      }

      // 이메일 인증 성공 - 바로 대시보드로 리다이렉트
      console.log('[Callback] Email verified, redirecting to dashboard')
      return NextResponse.redirect('https://app.talksign.co.kr/dashboard', { headers: response.headers })
    } catch (error) {
      console.error('[Callback] Exception:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      return NextResponse.redirect(`${requestUrl.origin}/auth/signin?error=callback_error&message=${encodeURIComponent(errorMessage)}`)
    }
  }

  // OAuth code 처리 (비밀번호 재설정)
  if (code) {
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('[Callback] Code exchange error:', error)
        return NextResponse.redirect(`${requestUrl.origin}/auth/reset-password?error=invalid_link`)
      }
      
      // 성공적으로 세션을 설정했으면 reset-password 페이지로 리다이렉트
      return NextResponse.redirect(`${requestUrl.origin}${next || '/auth/reset-password'}`, { headers: response.headers })
    } catch (error) {
      console.error('[Callback] Exception:', error)
      return NextResponse.redirect(`${requestUrl.origin}/auth/reset-password?error=callback_error`)
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