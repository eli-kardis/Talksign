/**
 * Access Token Utility
 *
 * 공개 열람 링크용 토큰 생성 및 검증
 * access_tokens 테이블을 사용하여 토큰 관리
 */

import { createServerSupabaseClient } from '@/lib/auth-utils'
import { randomBytes } from 'crypto'

/**
 * 토큰 엔티티 타입
 */
export type TokenEntityType = 'quote' | 'contract'

/**
 * 토큰 정보
 */
export interface AccessTokenInfo {
  id: string
  token: string
  entity_type: TokenEntityType
  entity_id: string
  expires_at: string
  created_at: string | null
  used_at: string | null
}

/**
 * 안전한 랜덤 토큰 생성 (32 bytes = 64 hex characters)
 */
function generateSecureToken(): string {
  return randomBytes(32).toString('hex')
}

/**
 * 공개 접근용 토큰 생성
 *
 * @param entityType - 엔티티 타입 (quote 또는 contract)
 * @param entityId - 엔티티 ID
 * @param expiresInDays - 만료일 (기본 30일)
 * @returns 생성된 토큰 문자열
 */
export async function createAccessToken(
  entityType: TokenEntityType,
  entityId: string,
  expiresInDays: number = 30
): Promise<string> {
  const supabase = createServerSupabaseClient()
  const token = generateSecureToken()

  // 만료 시간 계산
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + expiresInDays)

  // 토큰 저장
  const { error } = await supabase.from('access_tokens').insert({
    token,
    entity_type: entityType,
    entity_id: entityId,
    expires_at: expiresAt.toISOString(),
  })

  if (error) {
    console.error('Failed to create access token:', error)
    throw new Error('Failed to create access token')
  }

  return token
}

/**
 * 토큰 검증 및 정보 조회
 *
 * @param token - 검증할 토큰
 * @returns 토큰 정보 (유효하지 않으면 null)
 */
export async function validateAccessToken(token: string): Promise<AccessTokenInfo | null> {
  const supabase = createServerSupabaseClient()

  // 토큰 조회
  const { data, error } = await supabase
    .from('access_tokens')
    .select('*')
    .eq('token', token)
    .single()

  if (error || !data) {
    return null
  }

  // 만료 확인
  const now = new Date()
  const expiresAt = new Date(data.expires_at)

  if (now > expiresAt) {
    return null
  }

  return data as AccessTokenInfo
}

/**
 * 토큰 사용 기록
 *
 * @param token - 토큰
 */
export async function markTokenAsUsed(token: string): Promise<void> {
  const supabase = createServerSupabaseClient()

  const { error } = await supabase
    .from('access_tokens')
    .update({ used_at: new Date().toISOString() })
    .eq('token', token)

  if (error) {
    console.error('Failed to mark token as used:', error)
  }
}

/**
 * 엔티티의 기존 토큰 조회 (재사용)
 *
 * @param entityType - 엔티티 타입
 * @param entityId - 엔티티 ID
 * @returns 유효한 기존 토큰 (없으면 null)
 */
export async function getExistingToken(
  entityType: TokenEntityType,
  entityId: string
): Promise<string | null> {
  const supabase = createServerSupabaseClient()

  const now = new Date().toISOString()

  // 만료되지 않은 토큰 조회
  const { data, error } = await supabase
    .from('access_tokens')
    .select('token')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .gt('expires_at', now)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error || !data) {
    return null
  }

  return data.token
}

/**
 * 엔티티의 모든 토큰 무효화
 *
 * @param entityType - 엔티티 타입
 * @param entityId - 엔티티 ID
 */
export async function revokeAllTokens(
  entityType: TokenEntityType,
  entityId: string
): Promise<void> {
  const supabase = createServerSupabaseClient()

  // 만료일을 현재 시간으로 설정하여 무효화
  const { error } = await supabase
    .from('access_tokens')
    .update({ expires_at: new Date().toISOString() })
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)

  if (error) {
    console.error('Failed to revoke tokens:', error)
  }
}

/**
 * 공개 열람 URL 생성
 *
 * @param entityType - 엔티티 타입
 * @param token - 토큰
 * @returns 공개 열람 URL
 */
export function generatePublicUrl(entityType: TokenEntityType, token: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://app.talksign.co.kr'
  return `${baseUrl}/public/${entityType}/${token}`
}

/**
 * 토큰 생성 및 URL 반환 (헬퍼 함수)
 *
 * @param entityType - 엔티티 타입
 * @param entityId - 엔티티 ID
 * @returns 공개 열람 URL
 */
export async function createPublicAccessUrl(
  entityType: TokenEntityType,
  entityId: string
): Promise<string> {
  // 기존 토큰이 있으면 재사용
  let token = await getExistingToken(entityType, entityId)

  // 없으면 새로 생성
  if (!token) {
    token = await createAccessToken(entityType, entityId)
  }

  return generatePublicUrl(entityType, token)
}
