-- Audit Logs Table
-- Records all CUD (Create, Update, Delete) operations for compliance and security

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete', 'read', 'export', 'send', 'sign')),
    resource_type TEXT NOT NULL CHECK (resource_type IN ('quote', 'contract', 'payment', 'tax_invoice', 'customer', 'schedule', 'user', 'notification')),
    resource_id TEXT NOT NULL,
    changes JSONB, -- Stores old and new values for updates
    metadata JSONB, -- Additional context (IP, user agent, etc.)
    status TEXT NOT NULL CHECK (status IN ('success', 'failure')),
    error_message TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast queries by user
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);

-- Index for fast queries by resource
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON public.audit_logs(resource_type, resource_id);

-- Index for fast queries by timestamp
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(timestamp DESC);

-- Index for fast queries by action
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);

-- RLS Policies for audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Users can only view their own audit logs
CREATE POLICY "Users can view own audit logs" ON public.audit_logs
    FOR SELECT
    USING (auth.uid() = user_id);

-- Only service role can insert audit logs (via server-side code)
-- Regular users cannot insert audit logs directly
CREATE POLICY "Service role can insert audit logs" ON public.audit_logs
    FOR INSERT
    WITH CHECK (false); -- This will be bypassed by service role key

-- Nobody can update or delete audit logs (immutable)
CREATE POLICY "Audit logs are immutable" ON public.audit_logs
    FOR UPDATE
    USING (false);

CREATE POLICY "Audit logs cannot be deleted" ON public.audit_logs
    FOR DELETE
    USING (false);

-- Grant permissions
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT INSERT ON public.audit_logs TO service_role;

-- Add comment
COMMENT ON TABLE public.audit_logs IS 'Audit trail for all user operations. Immutable once created.';
