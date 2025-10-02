import { NextRequest, NextResponse } from 'next/server'
import { createUserSupabaseClient, getUserFromRequest } from '@/lib/auth-utils'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'

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

    console.log('API Route: GET /api/schedules called for user:', userId)

    // RLS가 적용된 클라이언트 사용 (사용자 본인 데이터만 접근 가능)
    const supabase = createUserSupabaseClient(request)

    // 일정 목록 조회 (RLS 정책으로 user_id가 자동으로 필터링됨)
    const { data: schedules, error } = await supabase
      .from('schedules')
      .select('*')
      .order('start_date', { ascending: true })

    if (error) {
      console.error('Error fetching schedules:', error)
      return NextResponse.json({ error: 'Failed to fetch schedules' }, { status: 500 })
    }

    console.log(`Successfully fetched ${schedules?.length || 0} schedules`)
    return NextResponse.json(schedules || [])
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    console.log('API Route: POST /api/schedules called for user:', userId)
    console.log('Request body:', body)

    // 필수 필드 검증
    if (!body.title || !body.start_date) {
      return NextResponse.json(
        { error: 'Missing required fields: title, start_date' },
        { status: 400 }
      )
    }

    // RLS가 적용된 클라이언트 사용
    const supabase = createUserSupabaseClient(request)

    // 일정 데이터 준비 (user_id는 인증된 userId 사용)
    const scheduleData = {
      user_id: userId,  // ✅ 인증된 사용자 ID 사용
      title: body.title,
      description: body.description || null,
      start_date: body.start_date,
      start_time: body.start_time || '00:00',
      end_date: body.end_date || body.start_date,
      end_time: body.end_time || body.start_time || '00:00',
      type: body.type || 'task',
      priority: body.priority || 'medium'
    }

    console.log('Creating schedule:', scheduleData)

    // 일정 생성 (RLS 정책으로 본인 일정만 생성 가능)
    const { data: schedule, error } = await supabase
      .from('schedules')
      .insert([scheduleData])
      .select()
      .single()

    if (error) {
      console.error('Error creating schedule:', error)
      return NextResponse.json({
        error: 'Failed to create schedule',
        details: error.message
      }, { status: 500 })
    }

    console.log('Schedule created successfully:', schedule)
    return NextResponse.json(schedule, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
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

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: 'Schedule ID is required' }, { status: 400 })
    }

    console.log('API Route: PUT /api/schedules called for user:', userId)
    console.log('Schedule ID:', id)

    // RLS가 적용된 클라이언트 사용
    const supabase = createUserSupabaseClient(request)

    // 일정 업데이트 데이터 준비
    const scheduleUpdateData = {
      title: updateData.title,
      description: updateData.description,
      start_date: updateData.start_date,
      start_time: updateData.start_time,
      end_date: updateData.end_date,
      end_time: updateData.end_time,
      type: updateData.type,
      priority: updateData.priority,
      updated_at: new Date().toISOString()
    }

    // 일정 업데이트 (RLS 정책으로 본인 일정만 수정 가능)
    const { data: schedule, error } = await supabase
      .from('schedules')
      .update(scheduleUpdateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating schedule:', error)
      return NextResponse.json({ error: 'Failed to update schedule' }, { status: 500 })
    }

    console.log('Schedule updated successfully:', schedule)
    return NextResponse.json(schedule)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
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

    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json({ error: 'Schedule ID is required' }, { status: 400 })
    }

    console.log('API Route: DELETE /api/schedules called for user:', userId)
    console.log('Schedule ID:', id)

    // RLS가 적용된 클라이언트 사용
    const supabase = createUserSupabaseClient(request)

    // 일정 삭제 (RLS 정책으로 본인 일정만 삭제 가능)
    const { error } = await supabase
      .from('schedules')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting schedule:', error)

      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Schedule not found' }, { status: 404 })
      }

      return NextResponse.json({ error: 'Failed to delete schedule' }, { status: 500 })
    }

    console.log('Schedule deleted successfully:', id)
    return NextResponse.json({ message: 'Schedule deleted successfully' })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
