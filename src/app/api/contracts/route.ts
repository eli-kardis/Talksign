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
    
    // For now, return mock data since contracts table doesn't exist yet
    const mockContracts = [
      {
        id: "90cfcedd-b86d-4f13-96c0-bce2d9072665",
        client: "스타트업 A",
        project: "웹사이트 리뉴얼 프로젝트",
        amount: 3000000,
        status: "signed",
        createdDate: "2024-01-15",
        signedDate: "2024-01-16",
        contractUrl: "#",
        phone: "010-1234-5678"
      },
      {
        id: "7b4e3f2a-c5d6-4e8f-9a1b-2c3d4e5f6789",
        client: "기업 B",
        project: "모바일 앱 개발",
        amount: 8000000,
        status: "sent",
        createdDate: "2024-01-14",
        contractUrl: "#",
        phone: "010-2345-6789"
      },
      {
        id: "a1b2c3d4-e5f6-4789-abc1-23456789abcd",
        client: "개인 C",
        project: "브랜딩 디자인 패키지",
        amount: 1500000,
        status: "completed",
        createdDate: "2024-01-13",
        signedDate: "2024-01-14",
        contractUrl: "#",
        phone: "010-3456-7890"
      },
      {
        id: "f9e8d7c6-b5a4-4321-9876-543210fedcba",
        client: "소상공인 D",
        project: "온라인 쇼핑몰 구축",
        amount: 2500000,
        status: "pending",
        createdDate: "2024-01-12",
        contractUrl: "#",
        phone: "010-4567-8901"
      }
    ]

    return NextResponse.json(mockContracts)
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

    // Generate UUID similar to quote pattern (matches Supabase UUID format)
    const generateUUID = () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    };

    // Handle quote-based contract creation
    const contractData = {
      id: generateUUID(),
      title: body.title || 'New Contract',
      status: body.status || 'draft',
      client_name: body.client_name,
      client_email: body.client_email,
      client_phone: body.client_phone,
      client_company: body.client_company,
      client_business_number: body.client_business_number,
      client_address: body.client_address,
      supplier: body.supplier_info,
      items: body.items || [],
      subtotal: body.subtotal || 0,
      tax_amount: body.tax_amount || 0,
      tax_rate: body.tax_rate || 0.1,
      total_amount: body.total_amount || 0,
      description: body.description,
      project_start_date: body.project_start_date,
      project_end_date: body.project_end_date,
      terms: body.terms || [],
      quote_id: body.quote_id,
      createdDate: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
      signed_date: null,
      contractUrl: "#"
    };

    // For now, return a mock response since the contracts table doesn't exist
    const mockContract = contractData;

    console.log('Contract created successfully (mock):', mockContract)

    return NextResponse.json(mockContract, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}