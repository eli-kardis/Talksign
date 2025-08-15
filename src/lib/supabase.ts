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

// 타입 정의
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          phone?: string
          business_number?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          phone?: string
          business_number?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          phone?: string
          business_number?: string
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
          title: string
          items: unknown
          total_amount: number
          status: 'draft' | 'sent' | 'approved' | 'rejected'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          client_name: string
          client_email: string
          client_phone?: string
          title: string
          items: unknown
          total_amount: number
          status?: 'draft' | 'sent' | 'approved' | 'rejected'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          client_name?: string
          client_email?: string
          client_phone?: string
          title?: string
          items?: unknown
          total_amount?: number
          status?: 'draft' | 'sent' | 'approved' | 'rejected'
          updated_at?: string
        }
      }
      contracts: {
        Row: {
          id: string
          quote_id: string
          user_id: string
          content: string
          attachments?: unknown
          client_signature?: string
          signed_at?: string
          status: 'draft' | 'sent' | 'signed' | 'completed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          quote_id: string
          user_id: string
          content: string
          attachments?: unknown
          client_signature?: string
          signed_at?: string
          status?: 'draft' | 'sent' | 'signed' | 'completed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          quote_id?: string
          user_id?: string
          content?: string
          attachments?: unknown
          client_signature?: string
          signed_at?: string
          status?: 'draft' | 'sent' | 'signed' | 'completed'
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          contract_id: string
          user_id: string
          amount: number
          status: 'pending' | 'completed' | 'failed' | 'refunded'
          payment_method?: string
          transaction_id?: string
          paid_at?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          contract_id: string
          user_id: string
          amount: number
          status?: 'pending' | 'completed' | 'failed' | 'refunded'
          payment_method?: string
          transaction_id?: string
          paid_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          contract_id?: string
          user_id?: string
          amount?: number
          status?: 'pending' | 'completed' | 'failed' | 'refunded'
          payment_method?: string
          transaction_id?: string
          paid_at?: string
          updated_at?: string
        }
      }
    }
  }
}
