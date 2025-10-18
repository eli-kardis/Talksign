/**
 * Input Validation Schemas using Zod
 *
 * All user inputs should be validated against these schemas
 * before being processed or stored in the database.
 */

import { z } from 'zod'

// ============================================================================
// Common Schemas
// ============================================================================

/**
 * Korean phone number format: 010-1234-5678
 */
export const phoneNumberSchema = z
  .string()
  .regex(/^\d{3}-\d{4}-\d{4}$/, 'Invalid phone number format. Expected: 010-1234-5678')
  .optional()
  .or(z.literal(''))

/**
 * Korean business registration number: 123-12-12345
 */
export const businessNumberSchema = z
  .string()
  .regex(/^\d{3}-\d{2}-\d{5}$/, 'Invalid business number format. Expected: 123-12-12345')
  .optional()
  .or(z.literal(''))

/**
 * Email validation
 */
export const emailSchema = z
  .string()
  .email('Invalid email address')
  .min(3, 'Email must be at least 3 characters')
  .max(255, 'Email must not exceed 255 characters')

/**
 * Strong password requirements
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must not exceed 128 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[@$!%*?&]/, 'Password must contain at least one special character (@$!%*?&)')

/**
 * UUID format
 */
export const uuidSchema = z
  .string()
  .uuid('Invalid UUID format')

/**
 * Positive number
 */
export const positiveNumberSchema = z
  .number()
  .nonnegative('Number must be positive or zero')

/**
 * Positive integer
 */
export const positiveIntegerSchema = z
  .number()
  .int('Must be an integer')
  .positive('Must be a positive number')

// ============================================================================
// User & Auth Schemas
// ============================================================================

/**
 * User signup schema
 */
export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  name: z.string().min(1, 'Name is required').max(100, 'Name must not exceed 100 characters'),
  phone: phoneNumberSchema,
  businessRegistrationNumber: businessNumberSchema,
  companyName: z.string().max(200, 'Company name must not exceed 200 characters').optional(),
  businessName: z.string().max(200, 'Business name must not exceed 200 characters').optional(),
  agreeTerms: z.literal(true, { errorMap: () => ({ message: 'You must agree to the terms' }) }),
  agreePrivacy: z.literal(true, { errorMap: () => ({ message: 'You must agree to the privacy policy' }) }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

/**
 * User login schema
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

/**
 * User profile update schema
 */
export const profileUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  phone: phoneNumberSchema,
  businessRegistrationNumber: businessNumberSchema,
  companyName: z.string().max(200).optional(),
  businessName: z.string().max(200).optional(),
})

// ============================================================================
// Customer Schemas
// ============================================================================

/**
 * Customer creation schema
 */
export const customerCreateSchema = z.object({
  name: z.string().min(1, 'Customer name is required').max(100),
  email: emailSchema.optional().or(z.literal('')),
  phone: phoneNumberSchema,
  company: z.string().max(200).optional().or(z.literal('')),
  businessRegistrationNumber: businessNumberSchema,
  address: z.string().max(500).optional().or(z.literal('')),
  notes: z.string().max(2000).optional().or(z.literal('')),
})

/**
 * Customer update schema (all fields optional)
 */
export const customerUpdateSchema = customerCreateSchema.partial()

// ============================================================================
// Quote Schemas
// ============================================================================

/**
 * Quote item schema
 */
export const quoteItemSchema = z.object({
  description: z.string().min(1, 'Item description is required').max(500),
  quantity: positiveNumberSchema.min(0.01, 'Quantity must be at least 0.01'),
  unit_price: positiveNumberSchema,
  amount: positiveNumberSchema,
  sort_order: z.number().int().optional(),
})

/**
 * Quote creation schema
 */
export const quoteCreateSchema = z.object({
  customer_id: uuidSchema.optional(),
  client_name: z.string().min(1, 'Client name is required').max(100),
  client_email: emailSchema.optional().or(z.literal('')),
  client_phone: phoneNumberSchema,
  client_business_number: businessNumberSchema,
  client_company: z.string().max(200).optional().or(z.literal('')),
  quote_number: z.string().min(1).max(50).optional(),
  title: z.string().min(1, 'Quote title is required').max(200),
  issue_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Expected: YYYY-MM-DD'),
  expiry_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional().or(z.literal('')),
  status: z.enum(['draft', 'sent', 'accepted', 'rejected', 'expired']).optional(),
  items: z.array(quoteItemSchema).min(1, 'At least one item is required'),
  notes: z.string().max(5000).optional().or(z.literal('')),
})

/**
 * Quote update schema
 */
export const quoteUpdateSchema = quoteCreateSchema.partial().extend({
  id: uuidSchema,
})

// ============================================================================
// Contract Schemas
// ============================================================================

/**
 * Contract item schema
 */
export const contractItemSchema = z.object({
  description: z.string().min(1, 'Item description is required').max(500),
  quantity: positiveNumberSchema.min(0.01, 'Quantity must be at least 0.01'),
  unit_price: positiveNumberSchema,
  amount: positiveNumberSchema,
  sort_order: z.number().int().optional(),
})

/**
 * Contract creation schema
 */
export const contractCreateSchema = z.object({
  customer_id: uuidSchema.optional(),
  quote_id: uuidSchema.optional(),
  client_name: z.string().min(1, 'Client name is required').max(100),
  client_email: emailSchema.optional().or(z.literal('')),
  client_phone: phoneNumberSchema,
  client_business_number: businessNumberSchema,
  client_company: z.string().max(200).optional().or(z.literal('')),
  contract_number: z.string().min(1).max(50).optional(),
  title: z.string().min(1, 'Contract title is required').max(200),
  issue_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional().or(z.literal('')),
  status: z.enum(['draft', 'pending', 'signed', 'active', 'completed', 'cancelled']).optional(),
  items: z.array(contractItemSchema).min(1, 'At least one item is required'),
  terms: z.string().max(10000).optional().or(z.literal('')),
  notes: z.string().max(5000).optional().or(z.literal('')),
})

/**
 * Contract update schema
 */
export const contractUpdateSchema = contractCreateSchema.partial().extend({
  id: uuidSchema,
})

/**
 * Contract signature schema
 */
export const contractSignatureSchema = z.object({
  contract_id: uuidSchema,
  signer_type: z.enum(['supplier', 'customer']),
  signer_name: z.string().min(1).max(100),
  signer_email: emailSchema.optional(),
  signature_data: z.string().max(100000), // Base64 encoded image
})

// ============================================================================
// API Query Schemas
// ============================================================================

/**
 * Pagination schema
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

/**
 * Sort schema
 */
export const sortSchema = z.object({
  sort_by: z.string().optional(),
  sort_order: z.enum(['asc', 'desc']).optional().default('desc'),
})

/**
 * List query schema (pagination + sort)
 */
export const listQuerySchema = paginationSchema.merge(sortSchema)

// ============================================================================
// Type exports (inferred from schemas)
// ============================================================================

export type SignupInput = z.infer<typeof signupSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>

export type CustomerCreateInput = z.infer<typeof customerCreateSchema>
export type CustomerUpdateInput = z.infer<typeof customerUpdateSchema>

export type QuoteItemInput = z.infer<typeof quoteItemSchema>
export type QuoteCreateInput = z.infer<typeof quoteCreateSchema>
export type QuoteUpdateInput = z.infer<typeof quoteUpdateSchema>

export type ContractItemInput = z.infer<typeof contractItemSchema>
export type ContractCreateInput = z.infer<typeof contractCreateSchema>
export type ContractUpdateInput = z.infer<typeof contractUpdateSchema>
export type ContractSignatureInput = z.infer<typeof contractSignatureSchema>

export type PaginationInput = z.infer<typeof paginationSchema>
export type SortInput = z.infer<typeof sortSchema>
export type ListQueryInput = z.infer<typeof listQuerySchema>

// ============================================================================
// Validation Helper Functions
// ============================================================================

/**
 * Validate data against schema and return typed result
 */
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  try {
    const validated = schema.parse(data)
    return { success: true, data: validated }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')
      return { success: false, error: messages }
    }
    return { success: false, error: 'Validation failed' }
  }
}

/**
 * Validate data and throw on error
 */
export function validateOrThrow<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data)
}

/**
 * Safe parse with formatted error messages
 */
export function safeParse<T>(schema: z.ZodSchema<T>, data: unknown) {
  const result = schema.safeParse(data)

  if (!result.success) {
    const formattedErrors: Record<string, string> = {}

    result.error.errors.forEach(err => {
      const path = err.path.join('.')
      formattedErrors[path] = err.message
    })

    return {
      success: false as const,
      errors: formattedErrors,
      formattedMessage: Object.values(formattedErrors).join(', ')
    }
  }

  return {
    success: true as const,
    data: result.data
  }
}
