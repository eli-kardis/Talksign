import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from './supabase'

// 서버 사이드에서 인증된 Supabase 클라이언트 생성
export function createAuthenticatedSupabaseClient(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseServiceKey) {
    throw new Error('Missing Supabase service role key')
  }

  // Authorization 헤더에서 토큰 추출
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')

  const client = createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    global: {
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined
      }
    }
  })

  return client
}

// 사용자 인증 확인 및 user_id 반환
export async function getUserFromRequest(request: NextRequest): Promise<string | null> {
  try {
    // 개발 환경에서는 첫 번째 사용자를 기본으로 사용
    // 실제 운영에서는 아래 주석 해제하고 개발용 코드는 제거해야 함
    if (process.env.NODE_ENV === 'development') {
      const supabase = createServerSupabaseClient()
      const { data: users, error } = await supabase
        .from('users')
        .select('id')
        .order('created_at', { ascending: true })
        .limit(1)
      
      if (users && users.length > 0) {
        console.log('Development mode: Using first user:', users[0].id)
        return users[0].id
      }
      
      // 사용자가 없으면 기본 개발 사용자 ID 반환
      console.log('No users found, using default dev user')
      return '80d20e48-7189-4874-b792-9e514aaa0572'
    }
    
    // 운영 환경에서의 실제 인증 로직
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    if (!token) {
      console.log('No authorization token found')
      return null
    }
    
    // Supabase에서 토큰 검증
    const supabase = createUserSupabaseClient(request)
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      console.error('Token validation failed:', error)
      return null
    }
    
    console.log('Authenticated user:', user.id)
    return user.id
  } catch (error) {
    console.error('Error getting user from request:', error)
    return null
  }
}

// RLS가 적용된 Supabase 클라이언트 생성 (사용자 토큰 사용)
export function createUserSupabaseClient(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseAnonKey) {
    throw new Error('Missing Supabase anon key')
  }

  // Authorization 헤더에서 토큰 추출
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')

  const client = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    global: {
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined
      }
    }
  })

  return client
}

// 서버 사이드에서 사용할 Supabase 클라이언트 생성 (service role key 사용)
export function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseServiceKey) {
    throw new Error('Missing Supabase service role key')
  }

  const client = createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  return client
}