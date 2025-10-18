import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseClient, getUserFromRequest } from '@/lib/auth-utils'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { logCreate, extractMetadata } from '@/lib/audit-log'
import { logger } from '@/lib/logger'
import { quoteCreateSchema, paginationSchema, safeParse } from '@/lib/validation/schemas'
import { QuoteInsert } from '@/types/database'

export async function GET(request: NextRequest) {
  try {
    logger.api.request('GET', '/api/quotes')

    // 사용자 인증 확인
    const userId = await getUserFromRequest(request)
    if (!userId) {
      logger.warn('Unauthorized access attempt to GET /api/quotes')
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

    logger.debug('Fetching quotes', { userId, page, limit })

    // 환경에 맞는 Supabase 클라이언트 생성
    const supabase = createSupabaseClient(request)
    logger.db.query('quotes', 'SELECT')

    // Calculate offset for pagination
    const from = (page - 1) * limit
    const to = from + limit - 1

    // Get total count
    const { count } = await supabase
      .from('quotes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    // Get paginated data
    const { data: quotes, error } = await supabase
      .from('quotes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) {
      logger.db.error('quotes', 'SELECT', error)
      // Supabase 에러 시 빈 응답 반환
      return NextResponse.json({
        data: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        }
      })
    }

    const totalPages = count ? Math.ceil(count / limit) : 0

    logger.debug('Quotes fetched successfully', {
      count: quotes?.length || 0,
      total: count,
      page,
      totalPages
    })

    return NextResponse.json({
      data: quotes || [],
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
    logger.api.error('GET', '/api/quotes', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    logger.api.request('POST', '/api/quotes')

    // 사용자 인증 확인
    const userId = await getUserFromRequest(request)
    if (!userId) {
      logger.warn('Unauthorized access attempt to POST /api/quotes')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting 체크
    const rateLimitError = checkRateLimit(userId, RATE_LIMITS.DEFAULT)
    if (rateLimitError) {
      return rateLimitError
    }

    logger.debug('Creating quote', { userId })

    // 환경에 맞는 Supabase 클라이언트 생성
    const supabase = createSupabaseClient(request)

    const body = await request.json()

    // Zod 스키마로 입력값 검증
    const validation = safeParse(quoteCreateSchema, body)

    if (!validation.success) {
      logger.warn('Quote validation failed', { errors: validation.errors })
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      )
    }

    const validatedData = validation.data

    // 견적서 항목 총합 계산
    const subtotal = validatedData.items.reduce((sum, item) => sum + item.amount, 0)
    const tax = Math.round(subtotal * 0.1) // 10% VAT
    const total = subtotal + tax
    logger.debug('Calculated quote amounts', { subtotal, tax, total })

    // 공급자 정보로 사용자 프로필 업데이트 (필요시)
    if (body.supplier_info) {
      logger.db.query('users', 'UPDATE')
      const { error: updateError } = await supabase
        .from('users')
        .update({
          name: body.supplier_info.name,
          phone: body.supplier_info.phone,
          business_registration_number: body.supplier_info.business_registration_number,
          business_name: body.supplier_info.business_name,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (updateError) {
        logger.warn('Failed to update user profile', { error: updateError })
        // 사용자 프로필 업데이트 실패는 치명적이지 않으므로 계속 진행
      }
    }

    // 견적서 생성
    const expiresAt = validatedData.expiry_date ? new Date(validatedData.expiry_date).toISOString() : null

    const quoteData: any = {
      user_id: userId,
      customer_id: validatedData.customer_id || null,
      client_name: validatedData.client_name,
      client_email: validatedData.client_email || null,
      client_phone: validatedData.client_phone || null,
      client_company: validatedData.client_company || null,
      client_business_number: validatedData.client_business_number || null,
      quote_number: validatedData.quote_number || undefined,
      title: validatedData.title,
      issue_date: validatedData.issue_date,
      expiry_date: expiresAt ?? undefined,
      items: validatedData.items,
      subtotal: subtotal,
      tax: tax,
      total: total,
      status: validatedData.status || 'draft',
      notes: validatedData.notes || null,
      supplier_info: body.supplier_info || null,
    }

    logger.db.query('quotes', 'INSERT')

    const { data: quote, error } = await supabase
      .from('quotes')
      .insert(quoteData)
      .select()
      .single()

    if (error) {
      logger.db.error('quotes', 'INSERT', error)
      return NextResponse.json({
        error: 'Failed to create quote'
      }, { status: 500 })
    }

    logger.info('Quote created successfully', { quoteId: quote.id })

    // Audit logging
    await logCreate(userId, 'quote', quote.id, quoteData, extractMetadata(request))

    return NextResponse.json(quote, { status: 201 })

  } catch (error) {
    logger.api.error('POST', '/api/quotes', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}
