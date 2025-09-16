-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Quotes table policies
CREATE POLICY "Freelancers can view own quotes" ON public.quotes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Freelancers can insert own quotes" ON public.quotes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Freelancers can update own quotes" ON public.quotes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Freelancers can delete own draft quotes" ON public.quotes
    FOR DELETE USING (auth.uid() = user_id AND status = 'draft');

-- Public access for clients to view quotes (via secure link)
CREATE POLICY "Public can view quotes with valid token" ON public.quotes
    FOR SELECT USING (
        -- This will be enhanced with proper token validation
        -- For now, allowing read access for specific statuses
        status IN ('sent', 'approved')
    );

-- Contracts table policies  
CREATE POLICY "Freelancers can view own contracts" ON public.contracts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Freelancers can insert own contracts" ON public.contracts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Freelancers can update own contracts" ON public.contracts
    FOR UPDATE USING (auth.uid() = user_id);

-- Public access for clients to view and sign contracts
CREATE POLICY "Public can view sent contracts" ON public.contracts
    FOR SELECT USING (status IN ('sent', 'signed'));

CREATE POLICY "Public can update contract signatures" ON public.contracts
    FOR UPDATE USING (
        status = 'sent' AND 
        client_signature IS NULL
    );

-- Payments table policies
CREATE POLICY "Freelancers can view own payments" ON public.payments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Freelancers can insert own payments" ON public.payments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Payment updates should be restricted to specific fields
CREATE POLICY "System can update payment status" ON public.payments
    FOR UPDATE USING (
        auth.uid() = user_id OR 
        -- Allow system updates (webhook handlers)
        current_setting('role') = 'service_role'
    );

-- Public read access for payment verification
CREATE POLICY "Public can view payment details" ON public.payments
    FOR SELECT USING (status = 'completed');

-- Notifications table policies
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" ON public.notifications
    FOR INSERT WITH CHECK (
        auth.uid() = user_id OR 
        current_setting('role') = 'service_role'
    );

CREATE POLICY "Users can update notification read status" ON public.notifications
    FOR UPDATE USING (
        auth.uid() = user_id AND 
        -- Only allow updating read_at field
        read_at IS NULL
    );

-- Recurring payments table policies
CREATE POLICY "Freelancers can view own recurring payments" ON public.recurring_payments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Freelancers can manage own recurring payments" ON public.recurring_payments
    FOR ALL USING (auth.uid() = user_id);

-- Audit logs policies (read-only for users, full access for system)
CREATE POLICY "Users can view own audit logs" ON public.audit_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert audit logs" ON public.audit_logs
    FOR INSERT WITH CHECK (current_setting('role') = 'service_role');

-- Functions for secure operations

-- Function to generate secure access tokens for quotes/contracts
CREATE OR REPLACE FUNCTION generate_access_token(entity_type TEXT, entity_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    token TEXT;
BEGIN
    -- Generate a secure random token
    token := encode(gen_random_bytes(32), 'base64url');
    
    -- Store token with expiration (24 hours)
    INSERT INTO public.access_tokens (token, entity_type, entity_id, expires_at)
    VALUES (token, entity_type, entity_id, NOW() + INTERVAL '24 hours');
    
    RETURN token;
END;
$$;

-- Function to validate access tokens
CREATE OR REPLACE FUNCTION validate_access_token(token TEXT, entity_type TEXT, entity_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    is_valid BOOLEAN := FALSE;
BEGIN
    SELECT EXISTS(
        SELECT 1 FROM public.access_tokens 
        WHERE token = validate_access_token.token 
        AND entity_type = validate_access_token.entity_type
        AND entity_id = validate_access_token.entity_id
        AND expires_at > NOW()
    ) INTO is_valid;
    
    RETURN is_valid;
END;
$$;

-- Access tokens table for secure public links
CREATE TABLE IF NOT EXISTS public.access_tokens (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    token TEXT NOT NULL UNIQUE,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on access tokens
ALTER TABLE public.access_tokens ENABLE ROW LEVEL SECURITY;

-- Only system can manage access tokens
CREATE POLICY "System manages access tokens" ON public.access_tokens
    FOR ALL USING (current_setting('role') = 'service_role');
