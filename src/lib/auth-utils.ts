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
      headers: token ? {
        Authorization: `Bearer ${token}`
      } : {}
    }
  })

  return client
}

// 사용자 인증 확인 및 user_id 반환
export async function getUserFromRequest(request: NextRequest): Promise<string | null> {
  try {
    console.log('Getting user from request, NODE_ENV:', process.env.NODE_ENV)

    // 인증 토큰 확인 시도
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (token) {
      // 토큰이 있으면 Supabase에서 검증
      const supabase = createUserSupabaseClient(request)
      const { data: { user }, error } = await supabase.auth.getUser(token)

      if (!error && user) {
        console.log('Authenticated user:', user.id)
        return user.id
      } else {
        console.log('Token validation failed:', error?.message)
      }
    }

    // 토큰이 없거나 검증 실패 시 데모 사용자 생성/반환
    console.log('No valid token found, creating/finding demo user')
    return await getOrCreateDemoUser()

  } catch (error) {
    console.error('Error getting user from request:', error)
    // 에러 발생 시에도 데모 사용자 반환
    return await getOrCreateDemoUser()
  }
}

// 데모 사용자 생성 또는 기존 사용자 반환
async function getOrCreateDemoUser(): Promise<string> {
  try {
    const supabase = createServerSupabaseClient()

    // 기존 데모 사용자 확인
    const { data: existingUsers } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'demo@talksign.app')
      .limit(1)

    if (existingUsers && existingUsers.length > 0) {
      console.log('Using existing demo user:', existingUsers[0].id)
      return existingUsers[0].id
    }

    // 데모 사용자 생성
    const demoUserData = {
      id: '80d20e48-7189-4874-b792-9e514aaa0572', // 고정 UUID
      email: 'demo@talksign.app',
      name: '데모 사용자',
      phone: '010-1234-5678',
      company_name: '데모 회사',
      business_name: '데모 비즈니스',
      business_registration_number: '123-45-67890',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data: newUser, error } = await supabase
      .from('users')
      .upsert(demoUserData, { onConflict: 'id' })
      .select('id')
      .single()

    if (error) {
      console.error('Failed to create demo user:', error)
      // 실패해도 고정 ID 반환
      return '80d20e48-7189-4874-b792-9e514aaa0572'
    }

    console.log('Created demo user:', newUser.id)
    return newUser.id

  } catch (error) {
    console.error('Error in getOrCreateDemoUser:', error)
    // 모든 것이 실패해도 고정 ID 반환
    return '80d20e48-7189-4874-b792-9e514aaa0572'
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
      headers: token ? {
        Authorization: `Bearer ${token}`
      } : {}
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