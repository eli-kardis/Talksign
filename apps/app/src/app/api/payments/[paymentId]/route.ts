import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  try {
    const { paymentId } = await params;
    
    if (!paymentId) {
      return NextResponse.json({ error: 'Payment ID is required' }, { status: 400 })
    }

    console.log('API Route: DELETE /api/payments/[paymentId] called')
    console.log('Payment ID:', paymentId)

    // Mock 삭제 (실제 Supabase 테이블이 없으므로)
    // 실제로는 결제 테이블이 있다면 Supabase 삭제 로직을 구현
    console.log('Payment deleted successfully (mock):', paymentId)

    return NextResponse.json({ message: 'Payment deleted successfully' }, { status: 200 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}