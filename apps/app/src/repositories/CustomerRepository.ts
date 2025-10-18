import { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'
import { BaseRepository } from './BaseRepository'

type CustomerRow = Database['public']['Tables']['customers']['Row']
type CustomerInsert = Database['public']['Tables']['customers']['Insert']
type CustomerUpdate = Database['public']['Tables']['customers']['Update']

/**
 * CustomerRepository
 *
 * 단일 책임: 고객 데이터 접근
 * - Supabase 고객 테이블 CRUD
 * - 비즈니스 로직 없음 (순수 데이터 레이어)
 */
export class CustomerRepository extends BaseRepository<'customers'> {
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase, 'customers')
  }

  /**
   * ID로 고객 조회
   */
  async findById(id: string, userId: string): Promise<CustomerRow | null> {
    return this.findOne({ id, user_id: userId })
  }

  /**
   * 사용자의 모든 고객 조회
   */
  async findByUserId(
    userId: string,
    options?: {
      limit?: number
      offset?: number
    }
  ): Promise<CustomerRow[]> {
    return this.findMany(
      { user_id: userId },
      {
        orderBy: { column: 'created_at', ascending: false },
        limit: options?.limit,
        offset: options?.offset,
      }
    )
  }

  /**
   * 고객 생성
   */
  async create(data: CustomerInsert): Promise<CustomerRow | null> {
    return super.create(data)
  }

  /**
   * 고객 업데이트
   */
  async updateById(
    id: string,
    userId: string,
    updates: CustomerUpdate
  ): Promise<CustomerRow | null> {
    return this.update({ id, user_id: userId }, updates)
  }

  /**
   * 고객 삭제
   */
  async deleteById(id: string, userId: string): Promise<boolean> {
    return this.delete({ id, user_id: userId })
  }

  /**
   * 여러 고객 삭제
   */
  async deleteMany(ids: string[], userId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('customers')
      .delete()
      .in('id', ids)
      .eq('user_id', userId)

    if (error) {
      console.error('Error deleting customers:', error)
      return false
    }

    return true
  }

  /**
   * 사용자의 고객 개수
   */
  async countByUserId(userId: string): Promise<number> {
    return this.count({ user_id: userId })
  }

  /**
   * 고객 존재 여부 확인
   */
  async exists(id: string, userId: string): Promise<boolean> {
    const customer = await this.findById(id, userId)
    return customer !== null
  }

  /**
   * 이메일로 고객 검색
   */
  async findByEmail(email: string, userId: string): Promise<CustomerRow | null> {
    return this.findOne({ email, user_id: userId })
  }

  /**
   * 이름으로 고객 검색
   */
  async searchByName(name: string, userId: string, limit = 10): Promise<CustomerRow[]> {
    const { data, error } = await this.supabase
      .from('customers')
      .select('*')
      .eq('user_id', userId)
      .ilike('name', `%${name}%`)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error searching customers by name:', error)
      return []
    }

    return data || []
  }
}
