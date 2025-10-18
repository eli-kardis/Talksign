import { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'
import { CustomerRepository } from '@/repositories'

type Customer = Database['public']['Tables']['customers']['Row']
type CustomerInsert = Database['public']['Tables']['customers']['Insert']
type CustomerUpdate = Database['public']['Tables']['customers']['Update']

/**
 * CustomerService
 *
 * 단일 책임: 고객 비즈니스 로직
 * - Repository를 통한 데이터 접근
 * - 비즈니스 규칙 적용
 * - 데이터 검증
 */
export class CustomerService {
  private repository: CustomerRepository

  constructor(supabase: SupabaseClient<Database>) {
    this.repository = new CustomerRepository(supabase)
  }

  /**
   * 고객 ID로 단일 고객 조회
   */
  async getCustomerById(customerId: string, userId: string): Promise<Customer | null> {
    return this.repository.findById(customerId, userId)
  }

  /**
   * 사용자의 모든 고객 조회 (페이지네이션)
   */
  async getCustomersByUserId(
    userId: string,
    page = 1,
    limit = 20
  ): Promise<{ customers: Customer[]; total: number; hasMore: boolean }> {
    const offset = (page - 1) * limit

    const [customers, total] = await Promise.all([
      this.repository.findByUserId(userId, { limit, offset }),
      this.repository.countByUserId(userId),
    ])

    const hasMore = offset + customers.length < total

    return { customers, total, hasMore }
  }

  /**
   * 이메일로 고객 조회
   */
  async getCustomerByEmail(email: string, userId: string): Promise<Customer | null> {
    return this.repository.findByEmail(email, userId)
  }

  /**
   * 이름으로 고객 검색
   */
  async searchCustomers(name: string, userId: string, limit = 10): Promise<Customer[]> {
    return this.repository.searchByName(name, userId, limit)
  }

  /**
   * 고객 생성
   */
  async createCustomer(customerData: CustomerInsert): Promise<Customer | null> {
    // 비즈니스 규칙: 이메일 중복 체크
    if (customerData.email && customerData.user_id) {
      const existing = await this.repository.findByEmail(
        customerData.email,
        customerData.user_id
      )

      if (existing) {
        throw new Error('Customer with this email already exists')
      }
    }

    return this.repository.create(customerData)
  }

  /**
   * 고객 업데이트
   */
  async updateCustomer(
    customerId: string,
    userId: string,
    updates: CustomerUpdate
  ): Promise<Customer | null> {
    // 비즈니스 규칙: 이메일 변경 시 중복 체크
    if (updates.email) {
      const existing = await this.repository.findByEmail(updates.email, userId)

      if (existing && existing.id !== customerId) {
        throw new Error('Another customer with this email already exists')
      }
    }

    return this.repository.updateById(customerId, userId, updates)
  }

  /**
   * 고객 삭제
   */
  async deleteCustomer(customerId: string, userId: string): Promise<boolean> {
    return this.repository.deleteById(customerId, userId)
  }

  /**
   * 여러 고객 삭제
   */
  async deleteCustomers(customerIds: string[], userId: string): Promise<boolean> {
    return this.repository.deleteMany(customerIds, userId)
  }

  /**
   * 고객 존재 여부 확인
   */
  async customerExists(customerId: string, userId: string): Promise<boolean> {
    return this.repository.exists(customerId, userId)
  }

  /**
   * 고객 통계
   */
  async getCustomerStats(userId: string): Promise<{
    total: number
  }> {
    const total = await this.repository.countByUserId(userId)
    return { total }
  }
}
