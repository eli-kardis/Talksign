/**
 * React Query Hooks for Customers API
 *
 * Features:
 * - Automatic caching and revalidation
 * - Optimistic updates
 * - Loading and error states
 * - Pagination support
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query'
import { logger } from '@/lib/logger'
import { apiClient } from '@/lib/api-client'

// Types
export interface Customer {
  id: string
  user_id: string
  name: string
  email?: string | null
  phone?: string | null
  company?: string | null
  business_registration_number?: string | null
  address?: string | null
  notes?: string | null
  created_at: string
  updated_at: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface CustomerCreateInput {
  name: string
  email?: string
  phone?: string
  company?: string
  businessRegistrationNumber?: string
  address?: string
  notes?: string
}

export interface CustomerUpdateInput extends Partial<CustomerCreateInput> {
  id: string
}

// Query Keys
export const customerKeys = {
  all: ['customers'] as const,
  lists: () => [...customerKeys.all, 'list'] as const,
  list: (page: number, limit: number) => [...customerKeys.lists(), { page, limit }] as const,
  detail: (id: string) => [...customerKeys.all, 'detail', id] as const,
}

// API Functions
async function fetchCustomers(page: number = 1, limit: number = 20): Promise<PaginatedResponse<Customer>> {
  const response = await apiClient.get(`/api/customers?page=${page}&limit=${limit}`)

  if (!response.ok) {
    const error = await response.json()
    logger.error('Failed to fetch customers', new Error(error.error || 'Unknown error'))
    throw new Error(error.error || 'Failed to fetch customers')
  }

  return response.json()
}

async function createCustomer(data: CustomerCreateInput): Promise<Customer> {
  const response = await apiClient.post('/api/customers', data)

  if (!response.ok) {
    const error = await response.json()
    logger.error('Failed to create customer', new Error(error.error || 'Unknown error'))
    throw new Error(error.error || 'Failed to create customer')
  }

  return response.json()
}

async function deleteCustomers(customerIds: string[]): Promise<void> {
  const response = await apiClient.delete('/api/customers', { customerIds })

  if (!response.ok) {
    const error = await response.json()
    logger.error('Failed to delete customers', new Error(error.error || 'Unknown error'))
    throw new Error(error.error || 'Failed to delete customers')
  }
}

// Hooks
export function useCustomers(
  page: number = 1,
  limit: number = 20,
  options?: Omit<UseQueryOptions<PaginatedResponse<Customer>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: customerKeys.list(page, limit),
    queryFn: () => fetchCustomers(page, limit),
    ...options,
  })
}

export function useCreateCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createCustomer,
    onSuccess: () => {
      // Invalidate all customer list queries
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() })
      logger.info('Customer created successfully')
    },
    onError: (error) => {
      logger.error('Failed to create customer', error)
    },
  })
}

export function useDeleteCustomers() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteCustomers,
    onMutate: async (customerIds) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: customerKeys.lists() })

      // Snapshot the previous value
      const previousCustomers = queryClient.getQueriesData({ queryKey: customerKeys.lists() })

      // Optimistically update to remove deleted customers
      queryClient.setQueriesData<PaginatedResponse<Customer>>(
        { queryKey: customerKeys.lists() },
        (old) => {
          if (!old) return old
          return {
            ...old,
            data: old.data.filter((customer) => !customerIds.includes(customer.id)),
            pagination: {
              ...old.pagination,
              total: old.pagination.total - customerIds.length,
            },
          }
        }
      )

      // Return context with snapshot
      return { previousCustomers }
    },
    onError: (error, _customerIds, context) => {
      // Rollback to previous value on error
      if (context?.previousCustomers) {
        context.previousCustomers.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
      logger.error('Failed to delete customers', error)
    },
    onSettled: () => {
      // Refetch after error or success
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() })
    },
  })
}
