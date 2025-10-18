import { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

/**
 * BaseRepository
 *
 * 모든 Repository의 기본 클래스
 * - Supabase 클라이언트 관리
 * - 공통 CRUD 메서드 제공
 * - 타입 안정성 보장
 */
export abstract class BaseRepository<T extends keyof Database['public']['Tables']> {
  protected supabase: SupabaseClient<Database>
  protected tableName: T

  constructor(supabase: SupabaseClient<Database>, tableName: T) {
    this.supabase = supabase
    this.tableName = tableName
  }

  /**
   * 단일 레코드 조회
   */
  protected async findOne(
    filters: Partial<Record<string, any>>
  ): Promise<any | null> {
    let query = this.supabase.from(this.tableName).select('*')

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value)
    })

    const { data, error } = await query.single()

    if (error) {
      console.error(`Error finding one ${String(this.tableName)}:`, error)
      return null
    }

    return data
  }

  /**
   * 여러 레코드 조회
   */
  protected async findMany(
    filters?: Partial<Record<string, any>>,
    options?: {
      orderBy?: { column: string; ascending?: boolean }
      limit?: number
      offset?: number
    }
  ): Promise<any[]> {
    let query = this.supabase.from(this.tableName).select('*')

    // Apply filters
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value)
      })
    }

    // Apply ordering
    if (options?.orderBy) {
      query = query.order(options.orderBy.column, {
        ascending: options.orderBy.ascending ?? false,
      })
    }

    // Apply pagination
    if (options?.limit !== undefined && options?.offset !== undefined) {
      query = query.range(options.offset, options.offset + options.limit - 1)
    }

    const { data, error } = await query

    if (error) {
      console.error(`Error finding many ${String(this.tableName)}:`, error)
      return []
    }

    return data || []
  }

  /**
   * 레코드 생성
   */
  protected async create(
    data: any
  ): Promise<any | null> {
    const { data: created, error } = await this.supabase
      .from(this.tableName)
      .insert(data)
      .select('*')
      .single()

    if (error) {
      console.error(`Error creating ${String(this.tableName)}:`, error)
      return null
    }

    return created
  }

  /**
   * 레코드 업데이트
   */
  protected async update(
    filters: Partial<Record<string, any>>,
    updates: any
  ): Promise<any | null> {
    let query = this.supabase.from(this.tableName).update(updates)

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value)
    })

    const { data, error } = await query.select('*').single()

    if (error) {
      console.error(`Error updating ${String(this.tableName)}:`, error)
      return null
    }

    return data
  }

  /**
   * 레코드 삭제
   */
  protected async delete(filters: Partial<Record<string, any>>): Promise<boolean> {
    let query = this.supabase.from(this.tableName).delete()

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value)
    })

    const { error } = await query

    if (error) {
      console.error(`Error deleting ${String(this.tableName)}:`, error)
      return false
    }

    return true
  }

  /**
   * 레코드 개수 조회
   */
  protected async count(filters?: Partial<Record<string, any>>): Promise<number> {
    let query = this.supabase.from(this.tableName).select('*', { count: 'exact', head: true })

    // Apply filters
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value)
      })
    }

    const { count, error } = await query

    if (error) {
      console.error(`Error counting ${String(this.tableName)}:`, error)
      return 0
    }

    return count || 0
  }
}
