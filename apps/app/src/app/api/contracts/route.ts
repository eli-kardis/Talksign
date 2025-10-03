import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseClient, getUserFromRequest } from '@/lib/auth-utils'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { logCreate, extractMetadata } from '@/lib/audit-log'

// Type for selected contract fields from Supabase
interface ContractSelectResult {
  id: string
  title: string | null
  client_name: string | null
  client_phone: string | null
  total_amount: number | null
  status: string | null
  created_at: string
  signed_at: string | null
  contract_url: string | null
}

export async function GET(request: NextRequest) {
  try {
    // 사용자 인증 확인
    const userId = await getUserFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting 체크
    const rateLimitError = checkRateLimit(userId, RATE_LIMITS.DEFAULT)
    if (rateLimitError) {
      return rateLimitError
    }

    console.log('API Route: GET /api/contracts called for user:', userId)

    // 환경에 맞는 Supabase 클라이언트 생성
    const supabase = createSupabaseClient(request)
    
    // Get contracts from Supabase
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
    
    if (error) {
      console.error('Error fetching contracts:', error)
      return NextResponse.json({ error: 'Failed to fetch contracts' }, { status: 500 })
    }
    
    console.log('Fetched contracts from Supabase:', contracts)
    
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
    
    console.log('Transformed contracts:', transformedContracts)

    return NextResponse.json(transformedContracts)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // 사용자 인증 확인 (가장 먼저 수행)
    const userId = await getUserFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting 체크
    const rateLimitError = checkRateLimit(userId, RATE_LIMITS.DEFAULT)
    if (rateLimitError) {
      return rateLimitError
    }

    const body = await request.json()
    console.log('API Route: POST /api/contracts called')
    console.log('User ID:', userId)
    console.log('Request body:', body)

    // 환경에 맞는 Supabase 클라이언트 생성
    const supabase = createSupabaseClient(request)

    // Prepare contract data for Supabase
    // user_id는 인증된 userId 사용 (절대 클라이언트에서 받지 않음)
    const contractData = {
      title: body.title || 'New Contract',
      content: body.description || '',
      status: body.status || 'draft',
      user_id: userId,  // ✅ 인증된 사용자 ID 사용
      quote_id: body.quote_id || null,
      client_name: body.client_name,
      client_email: body.client_email,
      client_phone: body.client_phone,
      client_company: body.client_company,
      client_business_number: body.client_business_number,
      client_address: body.client_address,
      supplier_info: body.supplier_info || {},
      project_description: body.project_description || body.description,
      project_start_date: body.project_start_date || null,
      project_end_date: body.project_end_date || null,
      items: body.items || [],
      subtotal: body.subtotal || 0,
      tax_amount: body.taxAmount || body.tax_amount || 0,
      tax_rate: body.tax_rate || 10.0,
      total_amount: body.total || body.total_amount || 0,
      contract_terms: body.terms || [],
      payment_terms: body.payment_terms || null,
      payment_method: body.payment_method || null,
      additional_payment_terms: body.additional_terms || null,
      contract_url: '#'
    }

    console.log('Saving contract data to Supabase:', contractData)

    // Insert the contract into Supabase (RLS 정책으로 본인 계약서만 생성 가능)
    const { data: contract, error } = await supabase
      .from('contracts')
      .insert([contractData])
      .select()
      .single()

    if (error) {
      console.error('Error creating contract:', error)
      return NextResponse.json({ error: 'Failed to create contract', details: error }, { status: 500 })
    }

    console.log('Contract created successfully:', contract)

    // Audit logging
    await logCreate(userId, 'contract', contract.id, contractData, extractMetadata(request))

    return NextResponse.json(contract, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}