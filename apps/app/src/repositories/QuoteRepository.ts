import { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'
import { BaseRepository } from './BaseRepository'

type QuoteRow = Database['public']['Tables']['quotes']['Row']
type QuoteInsert = Database['public']['Tables']['quotes']['Insert']
type QuoteUpdate = Database['public']['Tables']['quotes']['Update']

/**
 * QuoteRepository
 *
 * 단일 책임: 견적서 데이터 접근
 * - Supabase 견적서 테이블 CRUD
 * - 비즈니스 로직 없음 (순수 데이터 레이어)
 */
export class QuoteRepository extends BaseRepository<'quotes'> {
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase, 'quotes')
  }

  /**
   * ID로 견적서 조회
   */
  async findById(id: string, userId: string): Promise<QuoteRow | null> {
    return this.findOne({ id, user_id: userId })
  }

  /**
   * 사용자의 모든 견적서 조회
   */
  async findByUserId(
    userId: string,
    options?: {
      limit?: number
      offset?: number
      status?: string
    }
  ): Promise<QuoteRow[]> {
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
   * 견적서 생성
   */
  async create(data: QuoteInsert): Promise<QuoteRow | null> {
    return super.create(data)
  }

  /**
   * 견적서 업데이트
   */
  async updateById(
    id: string,
    userId: string,
    updates: QuoteUpdate
  ): Promise<QuoteRow | null> {
    return this.update({ id, user_id: userId }, updates)
  }

  /**
   * 견적서 삭제
   */
  async deleteById(id: string, userId: string): Promise<boolean> {
    return this.delete({ id, user_id: userId })
  }

  /**
   * 사용자의 견적서 개수
   */
  async countByUserId(userId: string, status?: string): Promise<number> {
    const filters: Record<string, any> = { user_id: userId }

    if (status) {
      filters.status = status
    }

    return this.count(filters)
  }

  /**
   * 견적서 존재 여부 확인
   */
  async exists(id: string, userId: string): Promise<boolean> {
    const quote = await this.findById(id, userId)
    return quote !== null
  }

  /**
   * 상태별 견적서 조회
   */
  async findByStatus(
    userId: string,
    status: string,
    limit?: number
  ): Promise<QuoteRow[]> {
    return this.findByUserId(userId, { status, limit })
  }

  /**
   * 만료된 견적서 조회
   */
  async findExpired(userId: string): Promise<QuoteRow[]> {
    const { data, error } = await this.supabase
      .from('quotes')
      .select('*')
      .eq('user_id', userId)
      .lt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error finding expired quotes:', error)
      return []
    }

    return data || []
  }
}
