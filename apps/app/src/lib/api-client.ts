import { supabase } from './supabase'

// 인증된 API 요청을 위한 유틸리티 클래스
export class AuthenticatedApiClient {
  private static async getAuthHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    try {
      console.log('[AuthenticatedApiClient] Getting authenticated user...')

      // 보안 경고 해결: getSession() 대신 getUser() 사용
      // getUser()는 서버에 인증을 요청하므로 더 안전함
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError) {
        console.error('[AuthenticatedApiClient] User authentication error:', userError)
        return headers
      }

      if (!user) {
        console.warn('[AuthenticatedApiClient] No authenticated user found')
        return headers
      }

      console.log('[AuthenticatedApiClient] User authenticated:', user.email)

      // 인증된 사용자가 있으면 세션에서 토큰 가져오기
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError) {
        console.error('[AuthenticatedApiClient] Session error:', sessionError)
        return headers
      }

      if (session?.access_token) {
        console.log('[AuthenticatedApiClient] Adding Authorization header')
        console.log('[AuthenticatedApiClient] Token preview:', session.access_token.substring(0, 20) + '...')
        headers['Authorization'] = `Bearer ${session.access_token}`
      } else {
        console.warn('[AuthenticatedApiClient] No access_token in session')
      }
    } catch (error) {
      console.error('[AuthenticatedApiClient] Failed to get auth headers:', error)
    }

    return headers
  }

  static async get(url: string): Promise<Response> {
    const headers = await this.getAuthHeaders()
    // ✅ 캐시 무효화: 항상 최신 데이터 가져오기 (사용자 격리 문제 해결)
    headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    headers['Pragma'] = 'no-cache'
    headers['Expires'] = '0'

    return fetch(url, {
      method: 'GET',
      headers,
      cache: 'no-store',  // Next.js fetch 캐시 무효화
    })
  }

  static async post(url: string, data: any): Promise<Response> {
    const headers = await this.getAuthHeaders()
    return fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    })
  }

  static async put(url: string, data: any): Promise<Response> {
    const headers = await this.getAuthHeaders()
    return fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    })
  }

  static async delete(url: string, data?: any): Promise<Response> {
    const headers = await this.getAuthHeaders()
    const config: RequestInit = {
      method: 'DELETE',
      headers,
    }
    
    if (data) {
      config.body = JSON.stringify(data)
    }
    
    return fetch(url, config)
  }
}

// 편의를 위한 단축 함수들
export const apiClient = {
  get: AuthenticatedApiClient.get.bind(AuthenticatedApiClient),
  post: AuthenticatedApiClient.post.bind(AuthenticatedApiClient),
  put: AuthenticatedApiClient.put.bind(AuthenticatedApiClient),
  delete: AuthenticatedApiClient.delete.bind(AuthenticatedApiClient),
}