/**
 * React Query Hook for Dashboard API
 *
 * Single query that replaces multiple sequential API calls
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { logger } from '@/lib/logger'

// Types
export interface DashboardSummary {
  totalCustomers: number
  totalQuotes: number
  totalContracts: number
  activeContracts: number
  pendingQuotes: number
  revenueThisMonth: number
}

export interface DashboardData {
  summary: DashboardSummary
  recentQuotes: any[]
  recentContracts: any[]
  recentCustomers: any[]
}

// Query Keys
export const dashboardKeys = {
  all: ['dashboard'] as const,
  data: () => [...dashboardKeys.all, 'data'] as const,
}

// API Function
async function fetchDashboard(): Promise<DashboardData> {
  const response = await fetch('/api/dashboard', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  })

  if (!response.ok) {
    const error = await response.json()
    logger.error('Failed to fetch dashboard', new Error(error.error || 'Unknown error'))
    throw new Error(error.error || 'Failed to fetch dashboard')
  }

  return response.json()
}

// Hook
export function useDashboard(
  options?: Omit<UseQueryOptions<DashboardData>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: dashboardKeys.data(),
    queryFn: fetchDashboard,
    // Refresh every 5 minutes
    staleTime: 5 * 60 * 1000,
    // Keep data for 10 minutes
    gcTime: 10 * 60 * 1000,
    ...options,
  })
}
