/**
 * React Query Hooks for Contracts API
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query'
import { logger } from '@/lib/logger'
import type { PaginatedResponse } from './useCustomers'

// Types
export interface ContractItem {
  description: string
  quantity: number
  unit_price: number
  amount: number
  sort_order?: number
}

export interface Contract {
  id: string
  user_id: string
  customer_id?: string | null
  quote_id?: string | null
  contract_number?: string | null
  client_name: string
  client_email?: string | null
  client_phone?: string | null
  client_company?: string | null
  client_business_number?: string | null
  title: string
  issue_date: string
  start_date: string
  end_date?: string | null
  status: 'draft' | 'pending' | 'signed' | 'active' | 'completed' | 'cancelled'
  items: ContractItem[]
  subtotal: number
  total_amount: number
  terms?: string | null
  notes?: string | null
  created_at: string
  updated_at: string
}

export interface ContractCreateInput {
  customer_id?: string
  quote_id?: string
  client_name: string
  client_email?: string
  client_phone?: string
  client_company?: string
  client_business_number?: string
  contract_number?: string
  title: string
  issue_date: string
  start_date: string
  end_date?: string
  status?: 'draft' | 'pending' | 'signed' | 'active' | 'completed' | 'cancelled'
  items: ContractItem[]
  terms?: string
  notes?: string
}

// Query Keys
export const contractKeys = {
  all: ['contracts'] as const,
  lists: () => [...contractKeys.all, 'list'] as const,
  list: (page: number, limit: number) => [...contractKeys.lists(), { page, limit }] as const,
  detail: (id: string) => [...contractKeys.all, 'detail', id] as const,
}

// API Functions
async function fetchContracts(page: number = 1, limit: number = 20): Promise<PaginatedResponse<Contract>> {
  const response = await fetch(`/api/contracts?page=${page}&limit=${limit}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch contracts')
  }

  return response.json()
}

async function createContract(data: ContractCreateInput): Promise<Contract> {
  const response = await fetch('/api/contracts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create contract')
  }

  return response.json()
}

// Hooks
export function useContracts(
  page: number = 1,
  limit: number = 20,
  options?: Omit<UseQueryOptions<PaginatedResponse<Contract>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: contractKeys.list(page, limit),
    queryFn: () => fetchContracts(page, limit),
    ...options,
  })
}

export function useCreateContract() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createContract,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contractKeys.lists() })
      logger.info('Contract created successfully')
    },
    onError: (error) => {
      logger.error('Failed to create contract', error)
    },
  })
}
