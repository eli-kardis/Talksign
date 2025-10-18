/**
 * React Query Hooks for Quotes API
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query'
import { logger } from '@/lib/logger'
import { apiClient } from '@/lib/api-client'
import type { PaginatedResponse } from './useCustomers'

// Types
export interface QuoteItem {
  description: string
  quantity: number
  unit_price: number
  amount: number
  sort_order?: number
}

export interface Quote {
  id: string
  user_id: string
  customer_id?: string | null
  client_name: string
  client_email?: string | null
  client_phone?: string | null
  client_company?: string | null
  client_business_number?: string | null
  quote_number?: string | null
  title: string
  issue_date: string
  expiry_date?: string | null
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'
  items: QuoteItem[]
  subtotal: number
  notes?: string | null
  created_at: string
  updated_at: string
}

export interface QuoteCreateInput {
  customer_id?: string
  client_name: string
  client_email?: string
  client_phone?: string
  client_company?: string
  client_business_number?: string
  quote_number?: string
  title: string
  issue_date: string
  expiry_date?: string
  status?: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'
  items: QuoteItem[]
  notes?: string
}

// Query Keys
export const quoteKeys = {
  all: ['quotes'] as const,
  lists: () => [...quoteKeys.all, 'list'] as const,
  list: (page: number, limit: number) => [...quoteKeys.lists(), { page, limit }] as const,
  detail: (id: string) => [...quoteKeys.all, 'detail', id] as const,
}

// API Functions
async function fetchQuotes(page: number = 1, limit: number = 20): Promise<PaginatedResponse<Quote>> {
  const response = await apiClient.get(`/api/quotes?page=${page}&limit=${limit}`)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch quotes')
  }

  return response.json()
}

async function createQuote(data: QuoteCreateInput): Promise<Quote> {
  const response = await apiClient.post('/api/quotes', data)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create quote')
  }

  return response.json()
}

// Hooks
export function useQuotes(
  page: number = 1,
  limit: number = 20,
  options?: Omit<UseQueryOptions<PaginatedResponse<Quote>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: quoteKeys.list(page, limit),
    queryFn: () => fetchQuotes(page, limit),
    ...options,
  })
}

export function useCreateQuote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createQuote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quoteKeys.lists() })
      logger.info('Quote created successfully')
    },
    onError: (error) => {
      logger.error('Failed to create quote', error)
    },
  })
}
