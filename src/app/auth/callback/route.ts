import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/auth/reset-password'

  if (code) {
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Code exchange error:', error)
        return NextResponse.redirect(`${requestUrl.origin}/auth/reset-password?error=invalid_link`)
      }
      
      // 성공적으로 세션을 설정했으면 reset-password 페이지로 리다이렉트
      return NextResponse.redirect(`${requestUrl.origin}${next}`)
    } catch (error) {
      console.error('Callback error:', error)
      return NextResponse.redirect(`${requestUrl.origin}/auth/reset-password?error=callback_error`)
    }
  }

  // 코드가 없으면 에러 페이지로 리다이렉트
  return NextResponse.redirect(`${requestUrl.origin}/auth/reset-password?error=no_code`)
}