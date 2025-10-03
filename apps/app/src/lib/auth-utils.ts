import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { jwtVerify, createRemoteJWKSet } from 'jose'
import type { Database } from './supabase'

// 서버 사이드에서 인증된 Supabase 클라이언트 생성
export function createAuthenticatedSupabaseClient(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
  }

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

// JWT 토큰 검증 함수
async function verifySupabaseJWT(token: string): Promise<string | null> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!supabaseUrl) {
      console.error('Missing NEXT_PUBLIC_SUPABASE_URL for JWT verification')
      return null
    }

    // Supabase JWT 검증을 위한 JWKS URL
    const jwksUrl = new URL(`${supabaseUrl}/rest/v1/jwks`)
    const JWKS = createRemoteJWKSet(jwksUrl)

    // JWT 검증
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: 'supabase',
      audience: 'authenticated',
    })

    // 사용자 ID 반환
    return payload.sub || null
  } catch (error) {
    console.log('JWT verification failed:', error)
    return null
  }
}

// 사용자 인증 확인 및 user_id 반환
export async function getUserFromRequest(request: NextRequest): Promise<string | null> {
  try {
    console.log('Getting user from request, NODE_ENV:', process.env.NODE_ENV)

    // 인증 토큰 확인 시도
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (token) {
      console.log('Token found, attempting validation...')

      try {
        // JWT 토큰 검증 (보안 강화)
        const userId = await verifySupabaseJWT(token)

        if (userId && userId !== 'undefined') {
          console.log('Valid authenticated user from token:', userId)

          // 사용자 존재 확인 (선택적)
          const supabase = createServerSupabaseClient()
          const { data: user } = await supabase
            .from('users')
            .select('id')
            .eq('id', userId)
            .single()

          if (user) {
            console.log('User exists in database:', user.id)
            return user.id
          } else {
            console.log('User not found in database, creating demo user')
          }
        }
      } catch (tokenError) {
        console.log('Token verification failed:', tokenError)
      }
    } else {
      console.log('No authorization token found')
    }

    // 토큰이 없거나 검증 실패 시 처리
    // ⚠️ 임시: 프로덕션에서도 데모 유저 허용 (인증 시스템 완성 전까지)
    console.log('No valid authentication, falling back to demo user')
    return await getOrCreateDemoUser()

  } catch (error) {
    console.error('Error getting user from request:', error)

    // ⚠️ 임시: 에러 발생 시에도 데모 사용자 반환
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
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
  }

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

/**
 * 개발/프로덕션 환경에 맞는 Supabase 클라이언트를 생성합니다.
 * ⚠️ 임시: 토큰이 없으면 항상 Service Role Key 사용 (데모 모드)
 * TODO: 프로덕션에서 인증 필수로 변경 필요
 */
export function createSupabaseClient(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const hasToken = !!authHeader

  // 토큰이 없으면 Service Role Key 사용 (데모 유저용)
  if (!hasToken) {
    return createServerSupabaseClient()
  }

  // 토큰이 있으면 User 클라이언트 사용 (RLS 적용)
  return createUserSupabaseClient(request)
}

// 서버 사이드에서 사용할 Supabase 클라이언트 생성 (service role key 사용)
export function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
  }

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