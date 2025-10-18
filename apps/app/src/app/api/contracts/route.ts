import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseClient, getUserFromRequest } from '@/lib/auth-utils'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { logCreate, extractMetadata } from '@/lib/audit-log'
import { logger } from '@/lib/logger'
import { contractCreateSchema, paginationSchema, safeParse } from '@/lib/validation/schemas'

// Type for selected contract fields from Supabase
interface ContractSelectResult {
  id: string
  title: string | null
  client_name: string | null
  client_phone: string | null
  total_amount: number | null
  status: string | null
  created_at: string | null
  signed_at: string | null
  contract_url: string | null
}

export async function GET(request: NextRequest) {
  try {
    logger.api.request('GET', '/api/contracts')

    // 사용자 인증 확인
    const userId = await getUserFromRequest(request)
    if (!userId) {
      logger.warn('Unauthorized access attempt to GET /api/contracts')
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

    logger.debug('Fetching contracts', { userId, page, limit })

    // 환경에 맞는 Supabase 클라이언트 생성
    const supabase = createSupabaseClient(request)
    logger.db.query('contracts', 'SELECT')

    // Calculate offset for pagination
    const from = (page - 1) * limit
    const to = from + limit - 1

    // Get total count
    const { count } = await supabase
      .from('contracts')
      .select('*', { count: 'exact', head: true })

    // Get paginated contracts from Supabase
    const { data: contracts, error } = await supabase
      .from('contracts')
      .select(`
        id,
        title,
        client_name,
        client_phone,
        total_amount,
        status,
        created_at,
        signed_at,
        contract_url
      `)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) {
      logger.db.error('contracts', 'SELECT', error)
      return NextResponse.json({ error: 'Failed to fetch contracts' }, { status: 500 })
    }

    const totalPages = count ? Math.ceil(count / limit) : 0

    logger.debug('Contracts fetched successfully', {
      count: contracts?.length || 0,
      total: count,
      page,
      totalPages
    })

    // Transform data to match frontend expectations
    const transformedContracts = (contracts && Array.isArray(contracts)) ? contracts.map((contract: ContractSelectResult) => ({
      id: contract.id,
      client: contract.client_name || 'Unknown Client',
      project: contract.title || 'Untitled Project',
      amount: contract.total_amount || 0,
      status: contract.status || 'draft',
      createdDate: contract.created_at ? new Date(contract.created_at).toISOString().split('T')[0] : '',
      signedDate: contract.signed_at ? new Date(contract.signed_at).toISOString().split('T')[0] : undefined,
      contractUrl: contract.contract_url || '#',
      phone: contract.client_phone || ''
    })) : []

    return NextResponse.json({
      data: transformedContracts,
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
    logger.api.error('GET', '/api/contracts', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    logger.api.request('POST', '/api/contracts')

    // 사용자 인증 확인 (가장 먼저 수행)
    const userId = await getUserFromRequest(request)
    if (!userId) {
      logger.warn('Unauthorized access attempt to POST /api/contracts')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting 체크
    const rateLimitError = checkRateLimit(userId, RATE_LIMITS.DEFAULT)
    if (rateLimitError) {
      return rateLimitError
    }

    const body = await request.json()
    logger.debug('Creating contract', { userId })

    // Zod 스키마로 입력값 검증
    const validation = safeParse(contractCreateSchema, body)

    if (!validation.success) {
      logger.warn('Contract validation failed', { errors: validation.errors })
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      )
    }

    const validatedData = validation.data

    // 환경에 맞는 Supabase 클라이언트 생성
    const supabase = createSupabaseClient(request)

    // Prepare contract data for Supabase
    // user_id는 인증된 userId 사용 (절대 클라이언트에서 받지 않음)
    const contractData = {
      title: validatedData.title,
      content: body.description || '',
      status: validatedData.status || 'draft',
      user_id: userId,  // ✅ 인증된 사용자 ID 사용
      customer_id: validatedData.customer_id || null,
      quote_id: validatedData.quote_id || null,
      contract_number: validatedData.contract_number || undefined,
      client_name: validatedData.client_name,
      client_email: validatedData.client_email || null,
      client_phone: validatedData.client_phone || null,
      client_company: validatedData.client_company || null,
      client_business_number: validatedData.client_business_number || null,
      client_address: body.client_address || null,
      supplier_info: body.supplier_info || {},
      issue_date: validatedData.issue_date,
      start_date: validatedData.start_date,
      end_date: validatedData.end_date || null,
      project_description: body.project_description || body.description,
      project_start_date: validatedData.start_date,
      project_end_date: validatedData.end_date || null,
      items: validatedData.items,
      subtotal: validatedData.items.reduce((sum, item) => sum + item.amount, 0),
      tax_amount: body.taxAmount || body.tax_amount || 0,
      tax_rate: body.tax_rate || 10.0,
      total_amount: body.total || body.total_amount || 0,
      contract_terms: validatedData.terms || null,
      payment_terms: body.payment_terms || null,
      payment_method: body.payment_method || null,
      additional_payment_terms: body.additional_terms || null,
      notes: validatedData.notes || null,
      contract_url: '#'
    }

    logger.db.query('contracts', 'INSERT')

    // Insert the contract into Supabase (RLS 정책으로 본인 계약서만 생성 가능)
    const { data: contract, error } = await supabase
      .from('contracts')
      .insert([contractData])
      .select()
      .single()

    if (error) {
      logger.db.error('contracts', 'INSERT', error)
      return NextResponse.json({ error: 'Failed to create contract' }, { status: 500 })
    }

    logger.info('Contract created successfully', { contractId: contract.id })

    // Audit logging
    await logCreate(userId, 'contract', contract.id, contractData, extractMetadata(request))

    return NextResponse.json(contract, { status: 201 })
  } catch (error) {
    logger.api.error('POST', '/api/contracts', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}