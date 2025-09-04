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

// Mock data
const mockContracts: any[] = [
  {
    id: 1,
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
    id: 2,
    client: "기업 B",
    project: "모바일 앱 개발",
    amount: 8000000,
    status: "sent",
    createdDate: "2024-01-14",
    contractUrl: "#",
    phone: "010-2345-6789"
  },
  {
    id: 3,
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
    id: 4,
    client: "소상공인 D",
    project: "온라인 쇼핑몰 구축",
    amount: 2500000,
    status: "pending",
    createdDate: "2024-01-12",
    contractUrl: "#",
    phone: "010-4567-8901"
  }
]

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ contractId: string }> }
) {
  try {
    const { contractId } = await params;
    
    if (!contractId) {
      return NextResponse.json({ error: 'Contract ID is required' }, { status: 400 })
    }

    console.log('API Route: GET /api/contracts/[contractId] called')
    console.log('Contract ID:', contractId)

    // Find contract in mock data
    const contract = mockContracts.find(c => c.id === parseInt(contractId))

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 })
    }

    console.log('Contract found:', contract)

    return NextResponse.json(contract)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ contractId: string }> }
) {
  try {
    const { contractId } = await params;
    
    if (!contractId) {
      return NextResponse.json({ error: 'Contract ID is required' }, { status: 400 })
    }

    const body = await request.json()
    console.log('API Route: PUT /api/contracts/[contractId] called')
    console.log('Contract ID:', contractId)
    console.log('Request body:', body)

    // Find contract in mock data
    const contractIndex = mockContracts.findIndex(c => c.id === parseInt(contractId))

    if (contractIndex === -1) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 })
    }

    // Update contract in mock data
    const updatedContract = {
      ...mockContracts[contractIndex],
      client: body.clientInfo?.name || mockContracts[contractIndex].client,
      project: body.contractInfo?.title || mockContracts[contractIndex].project,
      amount: body.clientInfo?.amount || mockContracts[contractIndex].amount,
      phone: body.clientInfo?.phone || mockContracts[contractIndex].phone,
      status: body.isDraft ? 'pending' : 'sent',
      updatedDate: new Date().toISOString().split('T')[0]
    }

    mockContracts[contractIndex] = updatedContract

    console.log('Contract updated successfully (mock):', updatedContract)

    return NextResponse.json(updatedContract, { status: 200 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}