import { NextRequest, NextResponse } from 'next/server'
import { createUserSupabaseClient, getUserFromRequest } from '@/lib/auth-utils'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { logDelete, extractMetadata } from '@/lib/audit-log'
import type { Database } from '@/lib/database.types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ quoteId: string }> }
) {
  try {
    const { quoteId } = await params;

    if (!quoteId) {
      return NextResponse.json({ error: 'Quote ID is required' }, { status: 400 })
    }

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

    // RLS가 적용된 클라이언트 사용 (사용자 본인 데이터만 접근 가능)
    const supabase = createUserSupabaseClient(request)

    // 특정 견적서 조회
    // RLS 정책으로 user_id가 자동으로 필터링됨
    const { data: quote, error } = await supabase
      .from('quotes')
      .select('*')
      .eq('id', quoteId)
      .single()

    // supplier_info가 DB에 저장되어 있으면 사용, 없으면 users 테이블에서 조회
    if (quote && !error) {
      const quoteWithSupplier = quote as any
      if (!quoteWithSupplier.supplier_info) {
        const { data: supplier } = await supabase
          .from('users')
          .select('name, email, phone, business_name, business_registration_number, company_name, business_address')
          .eq('id', quote.user_id)
          .single()

        if (supplier) {
          quoteWithSupplier.supplier = supplier
        }
      } else {
        quoteWithSupplier.supplier = quoteWithSupplier.supplier_info
      }
    }

    if (error) {
      console.error('Error fetching quote:', error)

      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
      }

      return NextResponse.json({ error: 'Failed to fetch quote' }, { status: 500 })
    }

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }

    return NextResponse.json(quote)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ quoteId: string }> }
) {
  try {
    const { quoteId } = await params;

    if (!quoteId) {
      return NextResponse.json({ error: 'Quote ID is required' }, { status: 400 })
    }

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

    const body = await request.json()
    console.log('API Route: PUT /api/quotes/[quoteId] called')
    console.log('Request body:', body)

    // RLS가 적용된 클라이언트 사용 (사용자 본인 데이터만 수정 가능)
    const supabase = createUserSupabaseClient(request)

    // 기존 견적서 조회 (상태 확인용)
    const { data: existingQuote, error: fetchError } = await supabase
      .from('quotes')
      .select('status')
      .eq('id', quoteId)
      .single()

    if (fetchError) {
      console.error('Error fetching quote:', fetchError)
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }

    // 견적서 아이템들의 subtotal, tax, total 계산
    const subtotal = body.items?.reduce((sum: number, item: { unit_price: number; quantity: number }) => {
      return sum + (item.unit_price * item.quantity)
    }, 0) || 0

    const tax = Math.round(subtotal * 0.1) // 10% VAT
    const total = subtotal + tax

    console.log('Calculated amounts:', { subtotal, tax, total })

    // expiry_date 처리
    const expiryDate = body.expiry_date ? new Date(body.expiry_date).toISOString() :
                       (body.valid_until ? new Date(body.valid_until).toISOString() : null)

    // 견적서 업데이트 데이터 준비
    const quoteData: any = {
      client_name: body.client_name,
      client_email: body.client_email,
      client_phone: body.client_phone,
      client_company: body.client_company,
      title: body.title,
      items: body.items,
      subtotal: subtotal,
      tax: tax,
      total: total,
      status: body.status || 'draft',
      expiry_date: expiryDate,
      client_business_number: body.client_business_number || null,
      notes: body.notes || null,
      updated_at: new Date().toISOString()
    }

    // supplier_info 업데이트 (발송된 견적서는 수정 불가)
    if (body.supplier_info) {
      // 발송되지 않은 견적서(draft, rejected, expired)만 supplier_info 수정 가능
      const isNotSent = existingQuote.status === 'draft' ||
                        existingQuote.status === 'rejected' ||
                        existingQuote.status === 'expired'

      if (isNotSent) {
        quoteData.supplier_info = body.supplier_info
      } else {
        console.log('Quote is sent/approved - supplier_info update blocked')
        // 발송된 견적서는 supplier_info 수정 불가 (무시)
      }
    }

    console.log('Quote data to update:', quoteData)

    // 견적서 업데이트 (RLS 정책으로 본인 견적서만 수정 가능)
    const { data: quote, error } = await supabase
      .from('quotes')
      .update(quoteData)
      .eq('id', quoteId)
      .select()
      .single()

    if (error) {
      console.error('Error updating quote:', error)
      return NextResponse.json({ error: 'Failed to update quote' }, { status: 500 })
    }

    console.log('Quote updated successfully:', quote)

    return NextResponse.json(quote, { status: 200 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ quoteId: string }> }
) {
  try {
    const { quoteId } = await params;

    if (!quoteId) {
      return NextResponse.json({ error: 'Quote ID is required' }, { status: 400 })
    }

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

    console.log('API Route: DELETE /api/quotes/[quoteId] called')
    console.log('Quote ID:', quoteId)

    // RLS가 적용된 클라이언트 사용 (사용자 본인 데이터만 삭제 가능)
    const supabase = createUserSupabaseClient(request)

    // 삭제 전 데이터 조회 (audit log용)
    const { data: quoteToDelete } = await supabase
      .from('quotes')
      .select('*')
      .eq('id', quoteId)
      .single()

    // 견적서 삭제 (RLS 정책으로 본인 견적서만 삭제 가능)
    const { error } = await supabase
      .from('quotes')
      .delete()
      .eq('id', quoteId)

    if (error) {
      console.error('Error deleting quote:', error)

      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
      }

      return NextResponse.json({ error: 'Failed to delete quote' }, { status: 500 })
    }

    console.log('Quote deleted successfully:', quoteId)

    // Audit logging
    if (quoteToDelete) {
      await logDelete(userId, 'quote', quoteId, quoteToDelete, extractMetadata(request))
    }

    return NextResponse.json({ message: 'Quote deleted successfully' }, { status: 200 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}