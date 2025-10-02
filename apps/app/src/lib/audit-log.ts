/**
 * Audit Logging Utility
 *
 * Records all CUD (Create, Update, Delete) operations for compliance and security
 * Required for production environments and regulatory compliance
 */

import { createServerSupabaseClient } from './auth-utils'

export type AuditAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'read'
  | 'export'
  | 'send'
  | 'sign'

export type AuditResourceType =
  | 'quote'
  | 'contract'
  | 'payment'
  | 'tax_invoice'
  | 'customer'
  | 'schedule'
  | 'user'
  | 'notification'

export interface AuditLogEntry {
  user_id: string
  action: AuditAction
  resource_type: AuditResourceType
  resource_id: string
  changes?: Record<string, any> // Old and new values for updates
  metadata?: Record<string, any> // Additional context (IP, user agent, etc.)
  status: 'success' | 'failure'
  error_message?: string
  timestamp?: string
}

/**
 * Create an audit log entry
 *
 * @param entry - Audit log entry data
 * @returns Promise<boolean> - Success status
 */
export async function createAuditLog(entry: AuditLogEntry): Promise<boolean> {
  try {
    // Only log in production or if explicitly enabled
    if (process.env.NODE_ENV !== 'production' && process.env.ENABLE_AUDIT_LOGS !== 'true') {
      console.log('[Audit Log - Dev Mode]:', entry)
      return true
    }

    const supabase = createServerSupabaseClient()

    const { error } = await supabase
      .from('audit_logs')
      .insert({
        user_id: entry.user_id,
        action: entry.action,
        resource_type: entry.resource_type,
        resource_id: entry.resource_id,
        changes: entry.changes || null,
        metadata: entry.metadata || null,
        status: entry.status,
        error_message: entry.error_message || null,
        timestamp: entry.timestamp || new Date().toISOString()
      })

    if (error) {
      console.error('Failed to create audit log:', error)
      // Don't throw error - audit logging should never break the main flow
      return false
    }

    return true
  } catch (error) {
    console.error('Audit log exception:', error)
    return false
  }
}

/**
 * Log a successful create operation
 */
export async function logCreate(
  userId: string,
  resourceType: AuditResourceType,
  resourceId: string,
  data: any,
  metadata?: Record<string, any>
): Promise<void> {
  await createAuditLog({
    user_id: userId,
    action: 'create',
    resource_type: resourceType,
    resource_id: resourceId,
    changes: { new: data },
    metadata,
    status: 'success'
  })
}

/**
 * Log a successful update operation
 */
export async function logUpdate(
  userId: string,
  resourceType: AuditResourceType,
  resourceId: string,
  oldData: any,
  newData: any,
  metadata?: Record<string, any>
): Promise<void> {
  await createAuditLog({
    user_id: userId,
    action: 'update',
    resource_type: resourceType,
    resource_id: resourceId,
    changes: { old: oldData, new: newData },
    metadata,
    status: 'success'
  })
}

/**
 * Log a successful delete operation
 */
export async function logDelete(
  userId: string,
  resourceType: AuditResourceType,
  resourceId: string,
  data: any,
  metadata?: Record<string, any>
): Promise<void> {
  await createAuditLog({
    user_id: userId,
    action: 'delete',
    resource_type: resourceType,
    resource_id: resourceId,
    changes: { deleted: data },
    metadata,
    status: 'success'
  })
}

/**
 * Log a failed operation
 */
export async function logFailure(
  userId: string,
  action: AuditAction,
  resourceType: AuditResourceType,
  resourceId: string,
  errorMessage: string,
  metadata?: Record<string, any>
): Promise<void> {
  await createAuditLog({
    user_id: userId,
    action,
    resource_type: resourceType,
    resource_id: resourceId,
    metadata,
    status: 'failure',
    error_message: errorMessage
  })
}

/**
 * Log a sensitive operation (PDF export, document send, etc.)
 */
export async function logSensitiveOperation(
  userId: string,
  action: AuditAction,
  resourceType: AuditResourceType,
  resourceId: string,
  metadata?: Record<string, any>
): Promise<void> {
  await createAuditLog({
    user_id: userId,
    action,
    resource_type: resourceType,
    resource_id: resourceId,
    metadata: {
      ...metadata,
      sensitive: true,
      timestamp_utc: new Date().toISOString()
    },
    status: 'success'
  })
}

/**
 * Extract metadata from request
 */
export function extractMetadata(request: Request): Record<string, any> {
  return {
    ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
    user_agent: request.headers.get('user-agent') || 'unknown',
    referer: request.headers.get('referer') || null,
    timestamp: new Date().toISOString()
  }
}
