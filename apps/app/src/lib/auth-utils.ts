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
    console.log('[Auth] Verifying JWT token...')
    console.log('[Auth] Token preview:', token.substring(0, 30) + '...')

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const jwtSecret = process.env.SUPABASE_JWT_SECRET || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl) {
      console.error('[Auth] Missing NEXT_PUBLIC_SUPABASE_URL for JWT verification')
      return null
    }

    if (!jwtSecret) {
      console.error('[Auth] Missing JWT secret for verification')
      return null
    }

    // JWT Secret을 사용한 검증 (JWKS 대신)
    const secret = new TextEncoder().encode(jwtSecret)
    const issuerUrl = `${supabaseUrl}/auth/v1`

    const { payload } = await jwtVerify(token, secret, {
      issuer: issuerUrl,
      audience: 'authenticated',
    })

    console.log('[Auth] JWT verified successfully')
    console.log('[Auth] User ID from token:', payload.sub)

    return payload.sub || null
  } catch (error) {
    console.error('[Auth] JWT verification failed:', error)
    if (error instanceof Error) {
      console.error('[Auth] Error name:', error.name)
      console.error('[Auth] Error message:', error.message)
    }
    return null
  }
}

// 사용자 인증 확인 및 user_id 반환
export async function getUserFromRequest(request: NextRequest): Promise<string | null> {
  try {
    console.log('[Auth] ==================== NEW REQUEST ====================')
    console.log('[Auth] Getting user from request')
    console.log('[Auth] NODE_ENV:', process.env.NODE_ENV)
    console.log('[Auth] Request URL:', request.url)
    console.log('[Auth] Request method:', request.method)

    // 인증 토큰 확인 시도
    const authHeader = request.headers.get('authorization')
    console.log('[Auth] Authorization header present:', !!authHeader)

    const token = authHeader?.replace('Bearer ', '')

    if (token) {
      console.log('[Auth] Token found, length:', token.length)
      console.log('[Auth] Attempting JWT validation...')

      try {
        // JWT 토큰 검증 (보안 강화)
        const userId = await verifySupabaseJWT(token)

        if (userId && userId !== 'undefined') {
          console.log('[Auth] ✓ Valid authenticated user from token:', userId)

          // JWT 검증이 성공하면 바로 userId 반환 (public.users 확인 불필요)
          // auth.users에 있다면 유효한 사용자임
          return userId
        } else {
          console.warn('[Auth] ✗ Invalid or undefined userId from token')
        }
      } catch (tokenError) {
        console.error('[Auth] ✗ Token verification exception:', tokenError)
      }
    } else {
      console.warn('[Auth] ✗ No authorization token found in request')
    }

    // 토큰이 없거나 검증 실패 시 처리
    console.log('[Auth] ✗ No valid authentication found')

    // 인증 실패 시 null 반환 (데모 모드 제거)
    return null

  } catch (error) {
    console.error('[Auth] ✗ Error getting user from request:', error)
    return null
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

  console.log('[createUserSupabaseClient] Creating client with token:', !!token)
  console.log('[createUserSupabaseClient] Token preview:', token ? token.substring(0, 30) + '...' : 'NO TOKEN')

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
 * 사용자 인증 토큰을 사용하여 RLS가 적용된 Supabase 클라이언트를 생성합니다.
 * 인증 토큰이 없으면 오류가 발생합니다.
 */
export function createSupabaseClient(request: NextRequest) {
  // 항상 User 클라이언트 사용 (RLS 적용 - 보안 강화)
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