import { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'
import { BaseRepository } from './BaseRepository'

type ContractRow = Database['public']['Tables']['contracts']['Row']
type ContractInsert = Database['public']['Tables']['contracts']['Insert']
type ContractUpdate = Database['public']['Tables']['contracts']['Update']

/**
 * ContractRepository
 *
 * 단일 책임: 계약서 데이터 접근
 * - Supabase 계약서 테이블 CRUD
 * - 비즈니스 로직 없음 (순수 데이터 레이어)
 */
export class ContractRepository extends BaseRepository<'contracts'> {
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase, 'contracts')
  }

  /**
   * ID로 계약서 조회
   */
  async findById(id: string, userId: string): Promise<ContractRow | null> {
    return this.findOne({ id, user_id: userId })
  }

  /**
   * 사용자의 모든 계약서 조회
   */
  async findByUserId(
    userId: string,
    options?: {
      limit?: number
      offset?: number
      status?: string
    }
  ): Promise<ContractRow[]> {
    const filters: Record<string, any> = { user_id: userId }

    if (options?.status) {
      filters.status = options.status
    }

    return this.findMany(filters, {
      orderBy: { column: 'created_at', ascending: false },
      limit: options?.limit,
      offset: options?.offset,
    })
  }

  /**
   * 계약서 생성
   */
  async create(data: ContractInsert): Promise<ContractRow | null> {
    return super.create(data)
  }

  /**
   * 계약서 업데이트
   */
  async updateById(
    id: string,
    userId: string,
    updates: ContractUpdate
  ): Promise<ContractRow | null> {
    return this.update({ id, user_id: userId }, updates)
  }

  /**
   * 계약서 삭제
   */
  async deleteById(id: string, userId: string): Promise<boolean> {
    return this.delete({ id, user_id: userId })
  }

  /**
   * 사용자의 계약서 개수
   */
  async countByUserId(userId: string, status?: string): Promise<number> {
    const filters: Record<string, any> = { user_id: userId }

    if (status) {
      filters.status = status
    }

    return this.count(filters)
  }

  /**
   * 계약서 존재 여부 확인
   */
  async exists(id: string, userId: string): Promise<boolean> {
    const contract = await this.findById(id, userId)
    return contract !== null
  }

  /**
   * 상태별 계약서 조회
   */
  async findByStatus(
    userId: string,
    status: string,
    limit?: number
  ): Promise<ContractRow[]> {
    return this.findByUserId(userId, { status, limit })
  }
}
