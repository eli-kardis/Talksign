import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseClient, getUserFromRequest } from '@/lib/auth-utils'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'

/**
 * Dashboard API - Single Query for All Dashboard Data
 *
 * Solves N+1 query problem by fetching all dashboard data in one request
 */

interface DashboardSummary {
  totalCustomers: number
  totalQuotes: number
  totalContracts: number
  activeContracts: number
  pendingQuotes: number
  revenueThisMonth: number
}

interface DashboardData {
  summary: DashboardSummary
  recentQuotes: any[]
  recentContracts: any[]
  recentCustomers: any[]
}

export async function GET(request: NextRequest) {
  try {
    logger.api.request('GET', '/api/dashboard')

    // 사용자 인증 확인
    const userId = await getUserFromRequest(request)
    if (!userId) {
      logger.warn('Unauthorized access attempt to GET /api/dashboard')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting 체크
    const rateLimitError = checkRateLimit(userId, RATE_LIMITS.DEFAULT)
    if (rateLimitError) {
      return rateLimitError
    }

    logger.debug('Fetching dashboard data', { userId })

    const supabase = createSupabaseClient(request)

    // Parallel queries for better performance
    const [
      customersCount,
      quotesCount,
      contractsCount,
      activeContractsCount,
      pendingQuotesCount,
      recentQuotes,
      recentContracts,
      recentCustomers,
    ] = await Promise.all([
      // Count queries
      supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId),

      supabase
        .from('quotes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId),

      supabase
        .from('contracts')
        .select('*', { count: 'exact', head: true }),

      supabase
        .from('contracts')
        .select('*', { count: 'exact', head: true })
        .in('status', ['active', 'signed']),

      supabase
        .from('quotes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .in('status', ['draft', 'sent']),

      // Recent data queries (limit 5)
      supabase
        .from('quotes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5),

      supabase
        .from('contracts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5),

      supabase
        .from('customers')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5),
    ])

    // Calculate revenue this month (from active contracts)
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    const { data: monthContracts } = await supabase
      .from('contracts')
      .select('total_amount')
      .gte('created_at', firstDayOfMonth)
      .in('status', ['signed', 'active'])

    const revenueThisMonth = monthContracts?.reduce(
      (sum, contract) => sum + (contract.total_amount || 0),
      0
    ) || 0

    // Build response
    const dashboardData: DashboardData = {
      summary: {
        totalCustomers: customersCount.count || 0,
        totalQuotes: quotesCount.count || 0,
        totalContracts: contractsCount.count || 0,
        activeContracts: activeContractsCount.count || 0,
        pendingQuotes: pendingQuotesCount.count || 0,
        revenueThisMonth,
      },
      recentQuotes: recentQuotes.data || [],
      recentContracts: recentContracts.data || [],
      recentCustomers: recentCustomers.data || [],
    }

    logger.debug('Dashboard data fetched successfully', {
      totalCustomers: dashboardData.summary.totalCustomers,
      totalQuotes: dashboardData.summary.totalQuotes,
      totalContracts: dashboardData.summary.totalContracts,
    })

    return NextResponse.json(dashboardData)
  } catch (error) {
    logger.api.error('GET', '/api/dashboard', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
