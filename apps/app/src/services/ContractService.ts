import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database, DbContract } from '@/lib/types'
import { parseContractFromDb, type Contract } from '@/lib/types'

/**
 * ContractService
 *
 * 단일 책임: 계약서 데이터 관리
 * - 계약서 조회, 생성, 수정, 삭제
 * - 비즈니스 로직과 데이터베이스 액세스 분리
 */
export class ContractService {
  private supabase: SupabaseClient<Database>

  constructor(supabase: SupabaseClient<Database>) {
    this.supabase = supabase
  }

  /**
   * 계약서 ID로 단일 계약서 조회
   * @param contractId 계약서 ID
   * @param userId 사용자 ID (RLS 적용)
   * @returns Contract 또는 null
   */
  async getContractById(contractId: string, userId: string): Promise<Contract | null> {
    const { data, error } = await this.supabase
      .from('contracts')
      .select('*')
      .eq('id', contractId)
      .eq('user_id', userId)
      .single()

    if (error || !data) {
      return null
    }

    return parseContractFromDb(data)
  }

  /**
   * 사용자의 모든 계약서 조회
   * @param userId 사용자 ID
   * @returns Contract 배열
   */
  async getContractsByUserId(userId: string): Promise<Contract[]> {
    const { data, error } = await this.supabase
      .from('contracts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error || !data) {
      return []
    }

    return data.map(parseContractFromDb)
  }

  /**
   * 계약서 생성
   * @param contractData 계약서 데이터
   * @returns 생성된 Contract 또는 null
   */
  async createContract(contractData: Database['public']['Tables']['contracts']['Insert']): Promise<Contract | null> {
    const { data, error } = await this.supabase
      .from('contracts')
      .insert(contractData)
      .select('*')
      .single()

    if (error || !data) {
      console.error('Error creating contract:', error)
      return null
    }

    return parseContractFromDb(data)
  }

  /**
   * 계약서 업데이트
   * @param contractId 계약서 ID
   * @param userId 사용자 ID (RLS 적용)
   * @param updates 업데이트할 데이터
   * @returns 업데이트된 Contract 또는 null
   */
  async updateContract(
    contractId: string,
    userId: string,
    updates: Database['public']['Tables']['contracts']['Update']
  ): Promise<Contract | null> {
    const { data, error } = await this.supabase
      .from('contracts')
      .update(updates)
      .eq('id', contractId)
      .eq('user_id', userId)
      .select('*')
      .single()

    if (error || !data) {
      console.error('Error updating contract:', error)
      return null
    }

    return parseContractFromDb(data)
  }

  /**
   * 계약서 삭제
   * @param contractId 계약서 ID
   * @param userId 사용자 ID (RLS 적용)
   * @returns 성공 여부
   */
  async deleteContract(contractId: string, userId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('contracts')
      .delete()
      .eq('id', contractId)
      .eq('user_id', userId)

    return !error
  }

  /**
   * 계약서 상태 확인 (존재 여부 및 소유권)
   * @param contractId 계약서 ID
   * @param userId 사용자 ID
   * @returns { exists: boolean, status?: string }
   */
  async checkContractOwnership(contractId: string, userId: string): Promise<{ exists: boolean; status?: string }> {
    const { data, error } = await this.supabase
      .from('contracts')
      .select('id, status')
      .eq('id', contractId)
      .eq('user_id', userId)
      .single()

    if (error || !data) {
      return { exists: false }
    }

    return { exists: true, status: data.status }
  }
}
