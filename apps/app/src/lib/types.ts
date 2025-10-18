/**
 * 공통 타입 정의
 * Supabase database.types.ts를 기반으로 하는 애플리케이션 레벨 타입
 *
 * 중요: 이 파일의 타입들은 database.types.ts의 타입을 확장하거나 변환한 것입니다.
 * 절대로 database.types.ts와 불일치하는 수동 타입을 정의하지 마세요.
 */

import type { Database } from './database.types'

// Database 테이블 타입 추출
export type DbContract = Database['public']['Tables']['contracts']['Row']
export type DbQuote = Database['public']['Tables']['quotes']['Row']
export type DbUser = Database['public']['Tables']['users']['Row']
export type DbCustomer = Database['public']['Tables']['customers']['Row']
export type DbPayment = Database['public']['Tables']['payments']['Row']

// Json 타입을 구체적인 타입으로 변환하는 유틸리티
export interface ContractItem {
  id?: string
  name: string
  description?: string
  quantity: number
  unit_price: number
  amount: number
  category?: string
  unit?: string
}

export interface QuoteItem {
  id?: string
  name: string
  description?: string
  quantity: number
  unit_price: number
  amount: number
  category?: string
  unit?: string
}

export interface SupplierInfo {
  name?: string
  email?: string
  phone?: string
  business_name?: string
  business_registration_number?: string
  company_name?: string
  business_address?: string
}

export interface DigitalSignature {
  signature_data: string
  signed_by: string
  signed_at: string
  ip_address?: string
  user_agent?: string
}

// DB Row 타입을 애플리케이션 타입으로 변환
export interface Contract extends Omit<DbContract, 'items' | 'supplier_info'> {
  items: ContractItem[]
  supplier_info?: SupplierInfo
  // Note: freelancer_signature, client_signature, additional_payment_terms
  // are not in the database schema - use contract_signatures table instead
}

export interface Quote extends Omit<DbQuote, 'items'> {
  items: QuoteItem[]
}

// API 응답 타입
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

// 스케줄 관련 타입
export interface ScheduleItem {
  id: string
  title: string
  start_date: string
  start_time?: string
  end_date?: string
  end_time?: string
  description?: string
  type?: Database['public']['Enums']['schedule_type']
  priority?: Database['public']['Enums']['schedule_priority']
  is_all_day?: boolean
  is_completed?: boolean
  contract_id?: string
  quote_id?: string
  user_id: string
  created_at?: string
  updated_at?: string
}

// 타입 변환 헬퍼 함수
export function parseContractFromDb(dbContract: DbContract): Contract {
  return {
    ...dbContract,
    items: (dbContract.items as unknown as ContractItem[]) || [],
    supplier_info: (dbContract.supplier_info as unknown as SupplierInfo) || undefined,
    // Note: Signatures are stored in contract_signatures table, not in the contract record
  }
}

export function parseQuoteFromDb(dbQuote: DbQuote): Quote {
  return {
    ...dbQuote,
    items: (dbQuote.items as unknown as QuoteItem[]) || [],
    // Note: supplier_info is not stored in quotes table
  }
}

// Insert/Update 타입
export type ContractInsert = Database['public']['Tables']['contracts']['Insert']
export type ContractUpdate = Database['public']['Tables']['contracts']['Update']
export type QuoteInsert = Database['public']['Tables']['quotes']['Insert']
export type QuoteUpdate = Database['public']['Tables']['quotes']['Update']
export type UserUpdate = Database['public']['Tables']['users']['Update']
export type CustomerInsert = Database['public']['Tables']['customers']['Insert']
export type CustomerUpdate = Database['public']['Tables']['customers']['Update']
