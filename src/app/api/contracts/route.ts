import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase'

// 서버 사이드에서 사용할 Supabase 클라이언트 생성
function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseServiceKey) {
    throw new Error('Missing Supabase service role key')
  }

  const client = createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  return client
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    
    console.log('API Route: GET /api/contracts called')
    
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
    const transformedContracts = contracts?.map(contract => ({
      id: contract.id,
      client: contract.client_name || 'Unknown Client',
      project: contract.title || 'Untitled Project',
      amount: contract.total_amount || 0,
      status: contract.status || 'draft',
      createdDate: contract.created_at ? new Date(contract.created_at).toISOString().split('T')[0] : '',
      signedDate: contract.signed_at ? new Date(contract.signed_at).toISOString().split('T')[0] : undefined,
      contractUrl: contract.contract_url || '#',
      phone: contract.client_phone || ''
    })) || []
    
    console.log('Transformed contracts:', transformedContracts)

    return NextResponse.json(transformedContracts)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('API Route: POST /api/contracts called')
    console.log('Request body:', body)

    const supabase = createServerSupabaseClient()

    // Get user ID from session (you may need to adjust this based on your auth setup)
    const authHeader = request.headers.get('authorization')
    let userId = null
    
    // For now, get the first user as a fallback
    const { data: users } = await supabase.from('users').select('id').limit(1)
    if (users && users.length > 0) {
      userId = users[0].id
    }

    // Prepare contract data for Supabase
    const contractData = {
      title: body.title || 'New Contract',
      content: body.description || '',
      status: body.status || 'draft',
      user_id: userId,
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

    // Insert the contract into Supabase
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

    return NextResponse.json(contract, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}