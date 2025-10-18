import { NextRequest, NextResponse } from 'next/server'
import { createUserSupabaseClient, getUserFromRequest } from '@/lib/auth-utils'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'
import { customerCreateSchema, paginationSchema, safeParse } from '@/lib/validation/schemas'


export async function GET(request: NextRequest) {
  try {
    logger.api.request('GET', '/api/customers')

    // 사용자 인증 확인
    const userId = await getUserFromRequest(request)
    if (!userId) {
      logger.warn('Unauthorized access attempt to GET /api/customers')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting 체크
    const rateLimitError = checkRateLimit(userId, RATE_LIMITS.DEFAULT)
    if (rateLimitError) {
      return rateLimitError
    }

    // Pagination 파라미터 파싱
    const { searchParams } = new URL(request.url)
    const paginationParams = {
      page: searchParams.get('page'),
      limit: searchParams.get('limit')
    }

    const paginationValidation = safeParse(paginationSchema, paginationParams)
    const { page, limit } = paginationValidation.success
      ? paginationValidation.data
      : { page: 1, limit: 20 }

    logger.debug('Fetching customers', { userId, page, limit })

    // RLS가 적용된 Supabase 클라이언트로 데이터 가져오기
    const supabase = createUserSupabaseClient(request)
    logger.db.query('customers', 'SELECT')

    // Calculate offset for pagination
    const from = (page - 1) * limit
    const to = from + limit - 1

    // Get total count for pagination metadata
    const { count } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    // Get paginated data
    const { data: customers, error } = await supabase
      .from('customers')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) {
      logger.db.error('customers', 'SELECT', error)
      return NextResponse.json(
        { error: 'Database query failed' },
        { status: 500 }
      )
    }

    const totalPages = count ? Math.ceil(count / limit) : 0

    logger.debug('Customers fetched successfully', {
      count: customers?.length || 0,
      total: count,
      page,
      totalPages
    })

    return NextResponse.json({
      data: customers || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })
  } catch (error) {
    logger.api.error('GET', '/api/customers', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    logger.api.request('POST', '/api/customers')

    // 사용자 인증 확인
    const userId = await getUserFromRequest(request)
    if (!userId) {
      logger.warn('Unauthorized access attempt to POST /api/customers')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting 체크
    const rateLimitError = checkRateLimit(userId, RATE_LIMITS.DEFAULT)
    if (rateLimitError) {
      return rateLimitError
    }

    const body = await request.json()
    logger.debug('Creating new customer', { userId })

    // Zod 스키마로 입력값 검증
    const validation = safeParse(customerCreateSchema, body)

    if (!validation.success) {
      logger.warn('Customer validation failed', { errors: validation.errors })
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      )
    }

    const validatedData = validation.data

    // Supabase에 데이터 저장 (user_id 포함)
    const supabase = createUserSupabaseClient(request)
    logger.db.query('customers', 'INSERT')

    const { data: newCustomer, error } = await supabase
      .from('customers')
      .insert([
        {
          user_id: userId,
          name: validatedData.name,
          email: validatedData.email || null,
          phone: validatedData.phone || null,
          company: validatedData.company || null,
          business_registration_number: validatedData.businessRegistrationNumber || null,
          address: validatedData.address || null,
          notes: validatedData.notes || null
        } as any
      ])
      .select()
      .single()

    if (error) {
      logger.db.error('customers', 'INSERT', error)
      return NextResponse.json(
        { error: 'Failed to create customer' },
        { status: 500 }
      )
    }

    logger.info('Customer created successfully', { customerId: newCustomer.id })
    return NextResponse.json(newCustomer, { status: 201 })
  } catch (error) {
    logger.api.error('POST', '/api/customers', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    logger.api.request('DELETE', '/api/customers')

    // 사용자 인증 확인
    const userId = await getUserFromRequest(request)
    if (!userId) {
      logger.warn('Unauthorized access attempt to DELETE /api/customers')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting 체크
    const rateLimitError = checkRateLimit(userId, RATE_LIMITS.DEFAULT)
    if (rateLimitError) {
      return rateLimitError
    }

    const body = await request.json()
    const { customerIds } = body

    logger.debug('Deleting customers', { userId, count: customerIds?.length })

    if (!customerIds || !Array.isArray(customerIds) || customerIds.length === 0) {
      logger.warn('Invalid customer IDs provided for deletion')
      return NextResponse.json(
        { error: 'Customer IDs array is required' },
        { status: 400 }
      )
    }

    // RLS가 적용된 Supabase 클라이언트로 삭제 (사용자 소유 데이터만 삭제 가능)
    const supabase = createUserSupabaseClient(request)
    logger.db.query('customers', 'DELETE')

    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('user_id', userId)  // ✅ Defense in Depth: 명시적 user_id 필터 추가
      .in('id', customerIds)

    if (error) {
      logger.db.error('customers', 'DELETE', error)
      return NextResponse.json(
        { error: 'Failed to delete customers' },
        { status: 500 }
      )
    }

    logger.info('Customers deleted successfully', { count: customerIds.length })
    return NextResponse.json({
      message: `${customerIds.length} customers deleted successfully`,
      deletedCount: customerIds.length
    }, { status: 200 })
  } catch (error) {
    logger.api.error('DELETE', '/api/customers', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}