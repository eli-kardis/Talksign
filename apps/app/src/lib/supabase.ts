import { createBrowserClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

// 환경 변수에서 Supabase 설정 가져오기
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// 런타임 환경 변수 검증 (브라우저에서만)
if (typeof window !== 'undefined') {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
  }
}

if (!supabaseServiceKey) {
  console.warn('Missing SUPABASE_SERVICE_ROLE_KEY - using anon key for service operations')
}

// 쿠키 도메인 설정 (프로덕션에서만 사용)
const isProduction = typeof window !== 'undefined' && 
  (window.location.hostname.includes('talksign.co.kr'))

const cookieOptions = isProduction ? {
  domain: '.talksign.co.kr',
  path: '/',
  sameSite: 'lax' as const,
  secure: true
} : undefined

// Supabase 브라우저 클라이언트 생성 (쿠키 기반)
export const supabase = createBrowserClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    cookies: {
      get(name: string) {
        if (typeof document === 'undefined') return undefined
        const value = `; ${document.cookie}`
        const parts = value.split(`; ${name}=`)
        if (parts.length === 2) return parts.pop()?.split(';').shift()
      },
      set(name: string, value: string, options: { maxAge?: number } = {}) {
        if (typeof document === 'undefined') return
        let cookieString = `${name}=${value}`

        if (cookieOptions) {
          cookieString += `; domain=${cookieOptions.domain}`
          cookieString += `; path=${cookieOptions.path}`
          cookieString += `; samesite=${cookieOptions.sameSite}`
          if (cookieOptions.secure) cookieString += '; secure'
        }

        if (options?.maxAge) {
          cookieString += `; max-age=${options.maxAge}`
        }

        document.cookie = cookieString
      },
      remove(name: string) {
        if (typeof document === 'undefined') return
        let cookieString = `${name}=; max-age=0`

        if (cookieOptions) {
          cookieString += `; domain=${cookieOptions.domain}`
          cookieString += `; path=${cookieOptions.path}`
        }

        document.cookie = cookieString
      }
    }
  }
)

// 서버 사이드에서 사용할 클라이언트 (Service Role Key 사용)
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey || supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// 서버 API 호출을 위한 기본 URL
export const API_BASE_URL = `${supabaseUrl}/functions/v1/make-server-e83d4894`

// API 요청 헬퍼 함수
export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  // 현재 세션에서 액세스 토큰 가져오기
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.access_token) {
    defaultHeaders['Authorization'] = `Bearer ${session.access_token}`
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
  }

  return response.json()
}

// Enhanced type definitions based on database schema
export type UserRole = 'freelancer' | 'client' | 'admin'
export type QuoteStatus = 'draft' | 'sent' | 'approved' | 'rejected' | 'expired'
export type ContractStatus = 'draft' | 'sent' | 'completed'
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'

export interface QuoteItem {
  id: string
  description: string
  quantity: number
  unit_price: number
  total: number
}

export interface DigitalSignature {
  signature_data: string
  signed_by: string
  signed_at: string
  ip_address?: string
}

export interface NotificationChannel {
  type: 'in_app' | 'email' | 'kakao_talk'
  enabled: boolean
}

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          phone?: string
          role: UserRole
          business_name?: string
          business_number?: string
          business_address?: string
          avatar_url?: string
          timezone: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          phone?: string
          role?: UserRole
          business_name?: string
          business_number?: string
          business_address?: string
          avatar_url?: string
          timezone?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          email?: string
          name?: string
          phone?: string
          role?: UserRole
          business_name?: string
          business_number?: string
          business_address?: string
          avatar_url?: string
          timezone?: string
          updated_at?: string
        }
      }
      quotes: {
        Row: {
          id: string
          user_id: string
          client_name: string
          client_email: string
          client_phone?: string
          client_company?: string
          client_business_number?: string
          client_address?: string
          client_logo_url?: string
          title: string
          description?: string
          items: QuoteItem[]
          subtotal: number
          tax_rate: number
          tax_amount: number
          total_amount: number
          status: QuoteStatus
          expires_at?: string
          approved_at?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          client_name: string
          client_email: string
          client_phone?: string
          client_company?: string
          client_business_number?: string
          client_address?: string
          client_logo_url?: string
          title: string
          description?: string
          items: QuoteItem[]
          subtotal: number
          tax_rate?: number
          status?: QuoteStatus
          expires_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          client_name?: string
          client_email?: string
          client_phone?: string
          client_company?: string
          client_business_number?: string
          client_address?: string
          client_logo_url?: string
          title?: string
          description?: string
          items?: QuoteItem[]
          subtotal?: number
          tax_rate?: number
          status?: QuoteStatus
          expires_at?: string
          approved_at?: string
          updated_at?: string
        }
      }
      contracts: {
        Row: {
          id: string
          quote_id: string
          user_id: string
          title: string
          content: string
          terms_and_conditions?: string
          attachments: unknown[]
          client_signature?: DigitalSignature
          freelancer_signature?: DigitalSignature
          signed_at?: string
          status: ContractStatus
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          quote_id: string
          user_id: string
          title: string
          content: string
          terms_and_conditions?: string
          attachments?: unknown[]
          client_signature?: DigitalSignature
          freelancer_signature?: DigitalSignature
          signed_at?: string
          status?: ContractStatus
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          content?: string
          terms_and_conditions?: string
          attachments?: unknown[]
          client_signature?: DigitalSignature
          freelancer_signature?: DigitalSignature
          signed_at?: string
          status?: ContractStatus
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          contract_id: string
          user_id: string
          amount: number
          currency: string
          payment_method?: string
          pg_provider?: string
          transaction_id?: string
          pg_transaction_id?: string
          status: PaymentStatus
          paid_at?: string
          receipt_url?: string
          tax_invoice_url?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          contract_id: string
          user_id: string
          amount: number
          currency?: string
          payment_method?: string
          pg_provider?: string
          transaction_id?: string
          pg_transaction_id?: string
          status?: PaymentStatus
          paid_at?: string
          receipt_url?: string
          tax_invoice_url?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          payment_method?: string
          pg_provider?: string
          transaction_id?: string
          pg_transaction_id?: string
          status?: PaymentStatus
          paid_at?: string
          receipt_url?: string
          tax_invoice_url?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          quote_id?: string
          contract_id?: string
          payment_id?: string
          channels: NotificationChannel[]
          sent_at?: string
          read_at?: string
          kakao_template_id?: string
          kakao_message_id?: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          message: string
          quote_id?: string
          contract_id?: string
          payment_id?: string
          channels?: NotificationChannel[]
          sent_at?: string
          kakao_template_id?: string
          kakao_message_id?: string
          created_at?: string
        }
        Update: {
          sent_at?: string
          read_at?: string
          kakao_message_id?: string
        }
      }
      recurring_payments: {
        Row: {
          id: string
          user_id: string
          contract_id?: string
          amount: number
          currency: string
          interval_type: string
          interval_count: number
          start_date: string
          end_date?: string
          next_payment_date?: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          contract_id?: string
          amount: number
          currency?: string
          interval_type: string
          interval_count?: number
          start_date: string
          end_date?: string
          next_payment_date?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          currency?: string
          interval_type?: string
          interval_count?: number
          start_date?: string
          end_date?: string
          next_payment_date?: string
          is_active?: boolean
          updated_at?: string
        }
      }
      access_tokens: {
        Row: {
          id: string
          token: string
          entity_type: string
          entity_id: string
          expires_at: string
          used_at?: string
          created_at: string
        }
        Insert: {
          id?: string
          token: string
          entity_type: string
          entity_id: string
          expires_at: string
          used_at?: string
          created_at?: string
        }
        Update: {
          used_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          user_id: string
          company_name: string
          representative_name: string
          contact_person?: string
          business_registration_number?: string
          email: string
          phone: string
          address?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          company_name: string
          representative_name: string
          contact_person?: string
          business_registration_number?: string
          email: string
          phone: string
          address?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          company_name?: string
          representative_name?: string
          contact_person?: string
          business_registration_number?: string
          email?: string
          phone?: string
          address?: string
          updated_at?: string
        }
      }
    }
  }
}
