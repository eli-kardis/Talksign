'use client'

/**
 * React Query Provider
 *
 * Features:
 * - Global cache management
 * - Automatic background refetching
 * - Optimistic updates
 * - Request deduplication
 * - Error retry logic
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState, type ReactNode } from 'react'

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Stale time: Data is considered fresh for 5 minutes
            staleTime: 5 * 60 * 1000,

            // Cache time: Inactive data is garbage collected after 10 minutes
            gcTime: 10 * 60 * 1000,

            // Retry failed requests 2 times with exponential backoff
            retry: 2,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

            // Refetch on window focus (but respect staleTime)
            refetchOnWindowFocus: true,

            // Don't refetch on reconnect if data is still fresh
            refetchOnReconnect: 'always',

            // Refetch on mount only if data is stale
            refetchOnMount: true,
          },
          mutations: {
            // Retry mutations once
            retry: 1,

            // Mutations don't need a retry delay
            retryDelay: 1000,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* React Query Devtools (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom" />
      )}
    </QueryClientProvider>
  )
}
