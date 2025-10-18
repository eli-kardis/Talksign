import { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'
import { QuoteRepository } from '@/repositories'
import { parseQuoteFromDb, type Quote } from '@/lib/types'

/**
 * QuoteService
 *
 * 단일 책임: 견적서 비즈니스 로직
 * - Repository를 통한 데이터 접근
 * - 비즈니스 규칙 적용
 * - 데이터 변환 및 검증
 */
export class QuoteService {
  private repository: QuoteRepository

  constructor(supabase: SupabaseClient<Database>) {
    this.repository = new QuoteRepository(supabase)
  }

  /**
   * 견적서 ID로 단일 견적서 조회
   */
  async getQuoteById(quoteId: string, userId: string): Promise<Quote | null> {
    const dbQuote = await this.repository.findById(quoteId, userId)

    if (!dbQuote) {
      return null
    }

    return parseQuoteFromDb(dbQuote)
  }

  /**
   * 사용자의 모든 견적서 조회 (페이지네이션)
   */
  async getQuotesByUserId(
    userId: string,
    page = 1,
    limit = 20
  ): Promise<{ quotes: Quote[]; total: number; hasMore: boolean }> {
    const offset = (page - 1) * limit

    const [dbQuotes, total] = await Promise.all([
      this.repository.findByUserId(userId, { limit, offset }),
      this.repository.countByUserId(userId),
    ])

    const quotes = dbQuotes.map(parseQuoteFromDb)
    const hasMore = offset + dbQuotes.length < total

    return { quotes, total, hasMore }
  }

  /**
   * 상태별 견적서 조회
   */
  async getQuotesByStatus(
    userId: string,
    status: string,
    limit = 20
  ): Promise<Quote[]> {
    const dbQuotes = await this.repository.findByStatus(userId, status, limit)
    return dbQuotes.map(parseQuoteFromDb)
  }

  /**
   * 만료된 견적서 조회
   */
  async getExpiredQuotes(userId: string): Promise<Quote[]> {
    const dbQuotes = await this.repository.findExpired(userId)
    return dbQuotes.map(parseQuoteFromDb)
  }

  /**
   * 견적서 생성
   */
  async createQuote(
    quoteData: Database['public']['Tables']['quotes']['Insert']
  ): Promise<Quote | null> {
    const dbQuote = await this.repository.create(quoteData)

    if (!dbQuote) {
      return null
    }

    return parseQuoteFromDb(dbQuote)
  }

  /**
   * 견적서 업데이트
   */
  async updateQuote(
    quoteId: string,
    userId: string,
    updates: Database['public']['Tables']['quotes']['Update']
  ): Promise<Quote | null> {
    // 비즈니스 규칙: 승인된 견적서는 수정 불가
    const existing = await this.repository.findById(quoteId, userId)

    if (!existing) {
      return null
    }

    if (existing.status === 'approved') {
      throw new Error('Cannot update approved quote')
    }

    const dbQuote = await this.repository.updateById(quoteId, userId, updates)

    if (!dbQuote) {
      return null
    }

    return parseQuoteFromDb(dbQuote)
  }

  /**
   * 견적서 삭제
   */
  async deleteQuote(quoteId: string, userId: string): Promise<boolean> {
    // 비즈니스 규칙: 승인된 견적서는 삭제 불가
    const existing = await this.repository.findById(quoteId, userId)

    if (!existing) {
      return false
    }

    if (existing.status === 'approved') {
      throw new Error('Cannot delete approved quote')
    }

    return this.repository.deleteById(quoteId, userId)
  }

  /**
   * 견적서 승인
   */
  async approveQuote(quoteId: string, userId: string): Promise<Quote | null> {
    return this.updateQuote(quoteId, userId, { status: 'approved' })
  }

  /**
   * 견적서 거절
   */
  async rejectQuote(quoteId: string, userId: string): Promise<Quote | null> {
    return this.updateQuote(quoteId, userId, { status: 'rejected' })
  }

  /**
   * 견적서 만료 처리
   */
  async expireQuote(quoteId: string, userId: string): Promise<Quote | null> {
    return this.updateQuote(quoteId, userId, { status: 'expired' })
  }

  /**
   * 견적서 통계
   */
  async getQuoteStats(userId: string): Promise<{
    total: number
    draft: number
    sent: number
    approved: number
    rejected: number
    expired: number
  }> {
    const [total, draft, sent, approved, rejected, expired] = await Promise.all([
      this.repository.countByUserId(userId),
      this.repository.countByUserId(userId, 'draft'),
      this.repository.countByUserId(userId, 'sent'),
      this.repository.countByUserId(userId, 'approved'),
      this.repository.countByUserId(userId, 'rejected'),
      this.repository.countByUserId(userId, 'expired'),
    ])

    return { total, draft, sent, approved, rejected, expired }
  }
}
