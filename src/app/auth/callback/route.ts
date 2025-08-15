import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    try {
      // OAuth 코드를 세션으로 교환
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('OAuth callback error:', error)
        return NextResponse.redirect(`${requestUrl.origin}/auth/error?message=${encodeURIComponent(error.message)}`)
      }

      if (data.user) {
        // 사용자 프로필이 없으면 생성
        const { error: profileError } = await supabase
          .from('users')
          .select('id')
          .eq('id', data.user.id)
          .single()

        if (profileError && profileError.code === 'PGRST116') {
          // 프로필이 없으면 생성
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: data.user.id,
              email: data.user.email!,
              name: data.user.user_metadata?.name || data.user.user_metadata?.full_name || '사용자',
              avatar_url: data.user.user_metadata?.avatar_url,
              role: 'freelancer', // 기본값
            })

          if (insertError) {
            console.error('프로필 생성 실패:', insertError)
          }
        }

        // 대시보드로 리다이렉트
        return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
      }
    } catch (error) {
      console.error('OAuth callback error:', error)
      return NextResponse.redirect(`${requestUrl.origin}/auth/error?message=${encodeURIComponent('인증 처리 중 오류가 발생했습니다.')}`)
    }
  }

  // 기본적으로 홈페이지로 리다이렉트
  return NextResponse.redirect(`${requestUrl.origin}/`)
}
