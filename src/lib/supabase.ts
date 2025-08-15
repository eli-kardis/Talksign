import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 서버 사이드에서 사용할 클라이언트 (Service Role Key 사용)
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Enhanced type definitions based on database schema
export type UserRole = 'freelancer' | 'client' | 'admin'
export type QuoteStatus = 'draft' | 'sent' | 'approved' | 'rejected' | 'expired'
export type ContractStatus = 'draft' | 'sent' | 'signed' | 'completed' | 'cancelled'
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
    }
  }
}
