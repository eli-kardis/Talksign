import { supabase } from './supabase'

// 인증된 API 요청을 위한 유틸리티 클래스
export class AuthenticatedApiClient {
  private static async getAuthHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    try {
      console.log('[AuthenticatedApiClient] Getting session...')
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error) {
        console.error('[AuthenticatedApiClient] Session error:', error)
        return headers
      }

      if (session?.access_token) {
        console.log('[AuthenticatedApiClient] Session found, adding Authorization header')
        console.log('[AuthenticatedApiClient] Token preview:', session.access_token.substring(0, 20) + '...')
        headers['Authorization'] = `Bearer ${session.access_token}`
      } else {
        console.warn('[AuthenticatedApiClient] No session or access_token found')
        console.log('[AuthenticatedApiClient] Session data:', session)
      }
    } catch (error) {
      console.error('[AuthenticatedApiClient] Failed to get session token:', error)
    }

    return headers
  }

  static async get(url: string): Promise<Response> {
    const headers = await this.getAuthHeaders()
    return fetch(url, {
      method: 'GET',
      headers,
    })
  }

  static async post(url: string, data: unknown): Promise<Response> {
    const headers = await this.getAuthHeaders()
    return fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    })
  }

  static async put(url: string, data: unknown): Promise<Response> {
    const headers = await this.getAuthHeaders()
    return fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    })
  }

  static async delete(url: string, data?: unknown): Promise<Response> {
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