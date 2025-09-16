-- Enhanced RLS Policies for Contracts Schema
-- This migration adds Row Level Security policies for the enhanced contracts tables

-- RLS Policies for enhanced contracts table
-- Users can only see their own contracts
CREATE POLICY "Users can view their own contracts" ON public.contracts
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own contracts  
CREATE POLICY "Users can create their own contracts" ON public.contracts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own contracts (but not if signed/completed)
CREATE POLICY "Users can update their own contracts" ON public.contracts
    FOR UPDATE USING (
        auth.uid() = user_id 
        AND status NOT IN ('signed', 'completed')
    );

-- Users can delete their own draft contracts only
CREATE POLICY "Users can delete their own draft contracts" ON public.contracts
    FOR DELETE USING (
        auth.uid() = user_id 
        AND status = 'draft'
    );

-- RLS Policies for contract_items table
CREATE POLICY "Users can view contract items for their own contracts" ON public.contract_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.contracts c 
            WHERE c.id = contract_items.contract_id 
            AND c.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert contract items for their own contracts" ON public.contract_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.contracts c 
            WHERE c.id = contract_items.contract_id 
            AND c.user_id = auth.uid()
            AND c.status NOT IN ('signed', 'completed')
        )
    );

CREATE POLICY "Users can update contract items for their own contracts" ON public.contract_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.contracts c 
            WHERE c.id = contract_items.contract_id 
            AND c.user_id = auth.uid()
            AND c.status NOT IN ('signed', 'completed')
        )
    );

CREATE POLICY "Users can delete contract items for their own contracts" ON public.contract_items
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.contracts c 
            WHERE c.id = contract_items.contract_id 
            AND c.user_id = auth.uid()
            AND c.status NOT IN ('signed', 'completed')
        )
    );

-- RLS Policies for contract_terms table
CREATE POLICY "Users can view contract terms for their own contracts" ON public.contract_terms
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.contracts c 
            WHERE c.id = contract_terms.contract_id 
            AND c.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert contract terms for their own contracts" ON public.contract_terms
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.contracts c 
            WHERE c.id = contract_terms.contract_id 
            AND c.user_id = auth.uid()
            AND c.status NOT IN ('signed', 'completed')
        )
    );

CREATE POLICY "Users can update contract terms for their own contracts" ON public.contract_terms
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.contracts c 
            WHERE c.id = contract_terms.contract_id 
            AND c.user_id = auth.uid()
            AND c.status NOT IN ('signed', 'completed')
        )
    );

CREATE POLICY "Users can delete contract terms for their own contracts" ON public.contract_terms
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.contracts c 
            WHERE c.id = contract_terms.contract_id 
            AND c.user_id = auth.uid()
            AND c.status NOT IN ('signed', 'completed')
        )
    );

-- RLS Policies for contract_revisions table
CREATE POLICY "Users can view contract revisions for their own contracts" ON public.contract_revisions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.contracts c 
            WHERE c.id = contract_revisions.contract_id 
            AND c.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create contract revisions for their own contracts" ON public.contract_revisions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.contracts c 
            WHERE c.id = contract_revisions.contract_id 
            AND c.user_id = auth.uid()
        )
        AND created_by = auth.uid()
    );

-- Contract revisions are immutable - no update or delete policies

-- RLS Policies for contract_activities table
CREATE POLICY "Users can view contract activities for their own contracts" ON public.contract_activities
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.contracts c 
            WHERE c.id = contract_activities.contract_id 
            AND c.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert contract activities for their own contracts" ON public.contract_activities
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.contracts c 
            WHERE c.id = contract_activities.contract_id 
            AND c.user_id = auth.uid()
        )
    );

-- Contract activities are immutable - no update or delete policies for data integrity

-- Special policies for client access (public contracts)
-- Clients can view contracts sent to them via a secure link
CREATE POLICY "Clients can view contracts sent to them" ON public.contracts
    FOR SELECT USING (
        status IN ('sent', 'signed', 'completed') 
        AND contract_url IS NOT NULL
        AND client_email IS NOT NULL
    );

-- Function to check if user has access to contract via secure link
CREATE OR REPLACE FUNCTION public.has_contract_access(contract_uuid UUID, access_token TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- This would integrate with a secure token system
    -- For now, we'll use a simple check based on contract_url
    RETURN EXISTS (
        SELECT 1 FROM public.contracts 
        WHERE id = contract_uuid 
        AND status IN ('sent', 'signed', 'completed')
        AND contract_url IS NOT NULL
        AND MD5(id::TEXT || client_email || created_at::TEXT) = access_token
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policy for contract access via secure token
CREATE POLICY "Allow access via secure token" ON public.contracts
    FOR SELECT USING (
        public.has_contract_access(id, 
            COALESCE(
                current_setting('app.contract_access_token', true), 
                ''
            )
        )
    );

-- Enable RLS on the main contracts table (if not already enabled)
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

-- Additional security functions
CREATE OR REPLACE FUNCTION public.generate_contract_access_token(contract_id UUID)
RETURNS TEXT AS $$
DECLARE
    contract_rec RECORD;
    access_token TEXT;
BEGIN
    SELECT id, client_email, created_at INTO contract_rec
    FROM public.contracts 
    WHERE id = contract_id 
    AND user_id = auth.uid();
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Contract not found or access denied';
    END IF;
    
    -- Generate secure access token
    access_token := MD5(contract_rec.id::TEXT || contract_rec.client_email || contract_rec.created_at::TEXT);
    
    -- Update contract with public URL
    UPDATE public.contracts 
    SET contract_url = format('/contracts/%s/view?token=%s', contract_id, access_token)
    WHERE id = contract_id;
    
    RETURN access_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate contract signature
CREATE OR REPLACE FUNCTION public.sign_contract(
    contract_id UUID,
    signature_data JSONB,
    signer_email TEXT,
    signer_ip INET DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    contract_rec RECORD;
BEGIN
    -- Get contract details
    SELECT * INTO contract_rec
    FROM public.contracts 
    WHERE id = contract_id 
    AND status = 'sent'
    AND client_email = signer_email;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Contract not found, already signed, or email mismatch';
    END IF;
    
    -- Update contract with signature
    UPDATE public.contracts 
    SET 
        client_signature_data = signature_data,
        signed_at = NOW(),
        signing_ip_address = signer_ip,
        status = 'signed',
        updated_at = NOW()
    WHERE id = contract_id;
    
    -- Log the signing activity
    PERFORM log_contract_activity(
        contract_id,
        'signed',
        format('Contract digitally signed by %s', signer_email),
        NULL,
        jsonb_build_object(
            'signer_email', signer_email,
            'ip_address', signer_ip,
            'signature_timestamp', NOW()
        )
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to send contract to client
CREATE OR REPLACE FUNCTION public.send_contract(contract_id UUID)
RETURNS TEXT AS $$
DECLARE
    contract_rec RECORD;
    access_token TEXT;
BEGIN
    -- Verify ownership
    SELECT * INTO contract_rec
    FROM public.contracts 
    WHERE id = contract_id 
    AND user_id = auth.uid()
    AND status = 'draft';
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Contract not found, not owned by user, or already sent';
    END IF;
    
    -- Generate access token
    access_token := public.generate_contract_access_token(contract_id);
    
    -- Update contract status
    UPDATE public.contracts 
    SET 
        status = 'sent',
        sent_at = NOW(),
        updated_at = NOW()
    WHERE id = contract_id;
    
    -- Log the sending activity
    PERFORM log_contract_activity(
        contract_id,
        'sent',
        format('Contract sent to client %s', contract_rec.client_email),
        auth.uid(),
        jsonb_build_object(
            'client_email', contract_rec.client_email,
            'access_token', access_token
        )
    );
    
    RETURN format('/contracts/%s/view?token=%s', contract_id, access_token);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.has_contract_access(UUID, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.generate_contract_access_token(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.sign_contract(UUID, JSONB, TEXT, INET) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.send_contract(UUID) TO authenticated;

-- Create indexes for efficient policy checking
CREATE INDEX IF NOT EXISTS idx_contracts_client_email_status 
    ON public.contracts(client_email, status) 
    WHERE status IN ('sent', 'signed', 'completed');

CREATE INDEX IF NOT EXISTS idx_contracts_url_status 
    ON public.contracts(contract_url, status) 
    WHERE contract_url IS NOT NULL;

-- Comments for documentation
COMMENT ON FUNCTION public.has_contract_access(UUID, TEXT) IS 'Validates if a user has access to a contract via secure token';
COMMENT ON FUNCTION public.generate_contract_access_token(UUID) IS 'Generates a secure access token for client contract access';
COMMENT ON FUNCTION public.sign_contract(UUID, JSONB, TEXT, INET) IS 'Handles digital signing of contracts by clients';
COMMENT ON FUNCTION public.send_contract(UUID) IS 'Sends a contract to client and generates secure access URL';