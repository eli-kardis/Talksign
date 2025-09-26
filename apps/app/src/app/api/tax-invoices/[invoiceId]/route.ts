import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  try {
    const { invoiceId } = await params;
    
    if (!invoiceId) {
      return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 })
    }

    console.log('API Route: DELETE /api/tax-invoices/[invoiceId] called')
    console.log('Invoice ID:', invoiceId)

    // Mock 삭제 (실제 Supabase 테이블이 없으므로)
    // 실제로는 세금계산서 테이블이 있다면 Supabase 삭제 로직을 구현
    console.log('Tax invoice deleted successfully (mock):', invoiceId)

    return NextResponse.json({ message: 'Tax invoice deleted successfully' }, { status: 200 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}