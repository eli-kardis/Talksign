/**
 * Enhanced Database Types
 *
 * This file extends the auto-generated Supabase types with proper enum types
 * for CHECK constraints that Supabase doesn't automatically infer.
 *
 * DO NOT modify the auto-generated database.types.ts file directly.
 * Instead, extend types here and use these types throughout the application.
 */

import { Database } from '@/lib/database.types'

// ============================================================================
// Enums (from CHECK constraints)
// ============================================================================

/**
 * Contract status enum
 * Matches database CHECK constraint in contracts table
 */
export type ContractStatus =
  | 'draft'      // Initial state, being edited
  | 'pending'    // Sent to client, awaiting signature
  | 'signed'     // Signed by both parties
  | 'active'     // Currently in effect
  | 'completed'  // Finished successfully
  | 'cancelled'  // Cancelled/terminated

/**
 * Quote status enum
 * Matches database CHECK constraint in quotes table
 */
export type QuoteStatus =
  | 'draft'      // Being created/edited
  | 'sent'       // Sent to client
  | 'accepted'   // Client accepted
  | 'rejected'   // Client rejected
  | 'expired'    // Past expiry date
  | 'completed'  // Converted to contract

// ============================================================================
// Enhanced Table Types
// ============================================================================

/**
 * Base generated types from Supabase
 */
type Tables = Database['public']['Tables']

/**
 * Enhanced Contract type with proper status enum
 */
export type Contract = Omit<Tables['contracts']['Row'], 'status'> & {
  status: ContractStatus | null
}

/**
 * Enhanced Contract Insert type
 */
export type ContractInsert = Omit<Tables['contracts']['Insert'], 'status'> & {
  status?: ContractStatus | null
}

/**
 * Enhanced Contract Update type
 */
export type ContractUpdate = Omit<Tables['contracts']['Update'], 'status'> & {
  status?: ContractStatus | null
}

/**
 * Enhanced Quote type with proper status enum
 */
export type Quote = Omit<Tables['quotes']['Row'], 'status'> & {
  status: QuoteStatus | null
}

/**
 * Enhanced Quote Insert type
 */
export type QuoteInsert = Omit<Tables['quotes']['Insert'], 'status'> & {
  status?: QuoteStatus | null
}

/**
 * Enhanced Quote Update type
 */
export type QuoteUpdate = Omit<Tables['quotes']['Update'], 'status'> & {
  status?: QuoteStatus | null
}

// ============================================================================
// Re-export unmodified types
// ============================================================================

export type Customer = Tables['customers']['Row']
export type CustomerInsert = Tables['customers']['Insert']
export type CustomerUpdate = Tables['customers']['Update']

export type User = Tables['users']['Row']
export type UserInsert = Tables['users']['Insert']
export type UserUpdate = Tables['users']['Update']

export type ContractItem = Tables['contract_items']['Row']
export type ContractItemInsert = Tables['contract_items']['Insert']
export type ContractItemUpdate = Tables['contract_items']['Update']

export type QuoteItem = Tables['quote_items']['Row']
export type QuoteItemInsert = Tables['quote_items']['Insert']
export type QuoteItemUpdate = Tables['quote_items']['Update']

export type ContractSignature = Tables['contract_signatures']['Row']
export type ContractSignatureInsert = Tables['contract_signatures']['Insert']
export type ContractSignatureUpdate = Tables['contract_signatures']['Update']

// ============================================================================
// Helper Types
// ============================================================================

/**
 * Pagination response wrapper
 */
export type PaginatedResponse<T> = {
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

/**
 * Contract with items (joined data)
 */
export type ContractWithItems = Contract & {
  contract_items?: ContractItem[]
  signatures?: ContractSignature[]
}

/**
 * Quote with items (joined data)
 */
export type QuoteWithItems = Quote & {
  quote_items?: QuoteItem[]
}
