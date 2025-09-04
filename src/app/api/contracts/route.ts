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

    // For now, return a mock response since the contracts table doesn't exist
    const mockContract = {
      id: Date.now(),
      ...body,
      status: body.isDraft ? 'pending' : 'sent',
      createdDate: new Date().toISOString().split('T')[0],
      contractUrl: "#"
    }

    console.log('Contract created successfully (mock):', mockContract)

    return NextResponse.json(mockContract, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}