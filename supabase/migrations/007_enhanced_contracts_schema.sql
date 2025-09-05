-- Enhanced Contracts Schema for LinkFlow
-- This migration enhances the existing contracts table to support the detailed contract form structure

-- First, let's backup the existing contracts table structure and data
-- Create a backup table with current data
CREATE TABLE public.contracts_backup AS SELECT * FROM public.contracts;

-- Drop existing constraints and indexes related to contracts
DROP INDEX IF EXISTS idx_contracts_quote_id;
DROP INDEX IF EXISTS idx_contracts_user_id;
DROP INDEX IF EXISTS idx_contracts_status;

-- Add new columns to existing contracts table to support enhanced contract structure
ALTER TABLE public.contracts 
-- Client Information (발주처 정보)
ADD COLUMN IF NOT EXISTS client_name TEXT,
ADD COLUMN IF NOT EXISTS client_email TEXT,
ADD COLUMN IF NOT EXISTS client_phone TEXT,
ADD COLUMN IF NOT EXISTS client_company TEXT,
ADD COLUMN IF NOT EXISTS client_business_number TEXT,
ADD COLUMN IF NOT EXISTS client_address TEXT,

-- Supplier Information (수급업체 정보) - stored as JSONB for flexibility
ADD COLUMN IF NOT EXISTS supplier_info JSONB DEFAULT '{}'::jsonb,

-- Project Information (프로젝트 정보)
ADD COLUMN IF NOT EXISTS project_description TEXT,
ADD COLUMN IF NOT EXISTS project_start_date DATE,
ADD COLUMN IF NOT EXISTS project_end_date DATE,

-- Contract Items (계약 내역) - detailed items with quantities and pricing
ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '[]'::jsonb,

-- Financial Information (금액 정보)
ADD COLUMN IF NOT EXISTS subtotal DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5,2) DEFAULT 10.0,
ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_amount DECIMAL(12,2) DEFAULT 0,

-- Contract Terms (계약 조건) - array of terms
ADD COLUMN IF NOT EXISTS contract_terms JSONB DEFAULT '[]'::jsonb,

-- Payment Information (결제 정보)
ADD COLUMN IF NOT EXISTS payment_terms TEXT, -- '50-50', 'immediate', 'milestone', etc.
ADD COLUMN IF NOT EXISTS payment_method TEXT, -- 'bank-transfer', 'card', 'cash', 'check'
ADD COLUMN IF NOT EXISTS additional_payment_terms TEXT,

-- Document Management
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS is_template BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS template_name TEXT,

-- Workflow and Status
ADD COLUMN IF NOT EXISTS sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS client_viewed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS expiry_date DATE,

-- Digital Signature Enhancement
ADD COLUMN IF NOT EXISTS client_signature_data JSONB,
ADD COLUMN IF NOT EXISTS freelancer_signature_data JSONB,
ADD COLUMN IF NOT EXISTS signing_ip_address INET,
ADD COLUMN IF NOT EXISTS signing_user_agent TEXT,

-- Integration with external services
ADD COLUMN IF NOT EXISTS external_contract_id TEXT, -- for integration with e-signature services
ADD COLUMN IF NOT EXISTS contract_url TEXT, -- public URL for client access

-- Metadata enhancements
ADD COLUMN IF NOT EXISTS last_modified_by UUID REFERENCES public.users(id),
ADD COLUMN IF NOT EXISTS notes JSONB DEFAULT '[]'::jsonb; -- internal notes/comments

-- Update existing records to have default values for required fields
UPDATE public.contracts 
SET 
    client_name = COALESCE(client_name, ''),
    client_email = COALESCE(client_email, ''),
    subtotal = COALESCE(subtotal, 0),
    tax_amount = COALESCE(tax_amount, 0),
    total_amount = COALESCE(total_amount, 0),
    version = COALESCE(version, 1),
    updated_at = NOW()
WHERE client_name IS NULL OR client_email IS NULL;

-- Create Contract Items table for better normalization (optional approach)
CREATE TABLE IF NOT EXISTS public.contract_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE NOT NULL,
    
    -- Item details
    name TEXT NOT NULL,
    description TEXT,
    quantity INTEGER DEFAULT 1,
    unit TEXT DEFAULT '개',
    unit_price DECIMAL(12,2) NOT NULL DEFAULT 0,
    amount DECIMAL(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    
    -- Order and categorization
    sort_order INTEGER DEFAULT 0,
    category TEXT,
    
    -- Item metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Contract Terms table for better structure
CREATE TABLE IF NOT EXISTS public.contract_terms (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE NOT NULL,
    
    -- Term details
    term_text TEXT NOT NULL,
    term_type TEXT DEFAULT 'general', -- 'payment', 'delivery', 'cancellation', 'general'
    is_required BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Contract Revisions table for version control
CREATE TABLE IF NOT EXISTS public.contract_revisions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE NOT NULL,
    
    -- Revision details
    version_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    changes_summary TEXT,
    
    -- Snapshot of contract data at this revision
    contract_snapshot JSONB NOT NULL,
    
    -- Revision metadata
    created_by UUID REFERENCES public.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Contract Activities table for audit trail
CREATE TABLE IF NOT EXISTS public.contract_activities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE NOT NULL,
    
    -- Activity details
    activity_type TEXT NOT NULL, -- 'created', 'sent', 'viewed', 'signed', 'completed', 'cancelled'
    description TEXT NOT NULL,
    
    -- Actor information
    actor_id UUID REFERENCES public.users(id),
    actor_type TEXT DEFAULT 'user', -- 'user', 'system', 'client'
    actor_name TEXT,
    actor_email TEXT,
    
    -- Additional context
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_address INET,
    user_agent TEXT,
    
    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recreate indexes with enhanced structure
CREATE INDEX idx_contracts_quote_id ON public.contracts(quote_id);
CREATE INDEX idx_contracts_user_id ON public.contracts(user_id);
CREATE INDEX idx_contracts_status ON public.contracts(status);
CREATE INDEX idx_contracts_client_email ON public.contracts(client_email);
CREATE INDEX idx_contracts_project_dates ON public.contracts(project_start_date, project_end_date);
CREATE INDEX idx_contracts_total_amount ON public.contracts(total_amount);
CREATE INDEX idx_contracts_created_at ON public.contracts(created_at DESC);
CREATE INDEX idx_contracts_sent_at ON public.contracts(sent_at DESC);

-- Indexes for related tables
CREATE INDEX idx_contract_items_contract_id ON public.contract_items(contract_id);
CREATE INDEX idx_contract_items_sort_order ON public.contract_items(contract_id, sort_order);

CREATE INDEX idx_contract_terms_contract_id ON public.contract_terms(contract_id);
CREATE INDEX idx_contract_terms_sort_order ON public.contract_terms(contract_id, sort_order);
CREATE INDEX idx_contract_terms_type ON public.contract_terms(term_type);

CREATE INDEX idx_contract_revisions_contract_id ON public.contract_revisions(contract_id);
CREATE INDEX idx_contract_revisions_version ON public.contract_revisions(contract_id, version_number DESC);

CREATE INDEX idx_contract_activities_contract_id ON public.contract_activities(contract_id);
CREATE INDEX idx_contract_activities_type ON public.contract_activities(activity_type);
CREATE INDEX idx_contract_activities_created_at ON public.contract_activities(created_at DESC);

-- Functions for contract management
CREATE OR REPLACE FUNCTION calculate_contract_totals(contract_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.contracts 
    SET 
        subtotal = (
            SELECT COALESCE(SUM((item->>'amount')::decimal), 0)
            FROM jsonb_array_elements(items) AS item
        ),
        tax_amount = (
            SELECT COALESCE(SUM((item->>'amount')::decimal), 0) * tax_rate / 100
            FROM jsonb_array_elements(items) AS item
        ),
        total_amount = (
            SELECT COALESCE(SUM((item->>'amount')::decimal), 0) * (1 + tax_rate / 100)
            FROM jsonb_array_elements(items) AS item
        ),
        updated_at = NOW()
    WHERE id = contract_id;
END;
$$ LANGUAGE plpgsql;

-- Function to create contract activity log
CREATE OR REPLACE FUNCTION log_contract_activity(
    p_contract_id UUID,
    p_activity_type TEXT,
    p_description TEXT,
    p_actor_id UUID DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
    activity_id UUID;
BEGIN
    INSERT INTO public.contract_activities (
        contract_id,
        activity_type,
        description,
        actor_id,
        metadata
    ) VALUES (
        p_contract_id,
        p_activity_type,
        p_description,
        p_actor_id,
        p_metadata
    )
    RETURNING id INTO activity_id;
    
    RETURN activity_id;
END;
$$ LANGUAGE plpgsql;

-- Function to create contract revision
CREATE OR REPLACE FUNCTION create_contract_revision(
    p_contract_id UUID,
    p_created_by UUID,
    p_changes_summary TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    revision_id UUID;
    contract_data JSONB;
    next_version INTEGER;
BEGIN
    -- Get current contract data
    SELECT to_jsonb(c.*) INTO contract_data
    FROM public.contracts c
    WHERE id = p_contract_id;
    
    -- Get next version number
    SELECT COALESCE(MAX(version_number), 0) + 1 INTO next_version
    FROM public.contract_revisions
    WHERE contract_id = p_contract_id;
    
    -- Create revision
    INSERT INTO public.contract_revisions (
        contract_id,
        version_number,
        title,
        content,
        changes_summary,
        contract_snapshot,
        created_by
    ) VALUES (
        p_contract_id,
        next_version,
        contract_data->>'title',
        contract_data->>'content',
        p_changes_summary,
        contract_data,
        p_created_by
    )
    RETURNING id INTO revision_id;
    
    -- Update contract version
    UPDATE public.contracts 
    SET version = next_version, updated_at = NOW()
    WHERE id = p_contract_id;
    
    RETURN revision_id;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic activity logging
CREATE OR REPLACE FUNCTION trigger_log_contract_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Log status changes
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        PERFORM log_contract_activity(
            NEW.id,
            'status_changed',
            format('Contract status changed from %s to %s', OLD.status, NEW.status),
            NEW.last_modified_by,
            jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status)
        );
    END IF;
    
    -- Log when contract is sent
    IF OLD.sent_at IS NULL AND NEW.sent_at IS NOT NULL THEN
        PERFORM log_contract_activity(
            NEW.id,
            'sent',
            format('Contract sent to %s', NEW.client_email),
            NEW.last_modified_by,
            jsonb_build_object('sent_to', NEW.client_email, 'sent_at', NEW.sent_at)
        );
    END IF;
    
    -- Log when contract is signed
    IF OLD.signed_at IS NULL AND NEW.signed_at IS NOT NULL THEN
        PERFORM log_contract_activity(
            NEW.id,
            'signed',
            'Contract has been digitally signed',
            NULL,
            jsonb_build_object('signed_at', NEW.signed_at, 'ip_address', NEW.signing_ip_address)
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS contracts_changes_trigger ON public.contracts;
CREATE TRIGGER contracts_changes_trigger
    AFTER UPDATE ON public.contracts
    FOR EACH ROW
    EXECUTE FUNCTION trigger_log_contract_changes();

-- Views for easier data access
CREATE OR REPLACE VIEW public.contracts_with_details AS
SELECT 
    c.*,
    u.name as freelancer_name,
    u.email as freelancer_email,
    u.business_name as freelancer_business_name,
    q.title as quote_title,
    q.status as quote_status,
    (
        SELECT COUNT(*)
        FROM public.contract_activities ca
        WHERE ca.contract_id = c.id
    ) as activity_count,
    (
        SELECT json_agg(
            json_build_object(
                'type', ca.activity_type,
                'description', ca.description,
                'created_at', ca.created_at
            ) ORDER BY ca.created_at DESC
        )
        FROM public.contract_activities ca
        WHERE ca.contract_id = c.id
        LIMIT 5
    ) as recent_activities
FROM public.contracts c
LEFT JOIN public.users u ON c.user_id = u.id
LEFT JOIN public.quotes q ON c.quote_id = q.id;

-- Grant necessary permissions (will be enhanced in RLS policies)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contracts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contract_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contract_terms TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contract_revisions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contract_activities TO authenticated;
GRANT SELECT ON public.contracts_with_details TO authenticated;

-- Enable RLS on new tables
ALTER TABLE public.contract_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_activities ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.contracts IS 'Enhanced contracts table supporting detailed contract structure with client info, project details, items, terms, and digital signatures';
COMMENT ON TABLE public.contract_items IS 'Individual items/services included in contracts with quantities and pricing';
COMMENT ON TABLE public.contract_terms IS 'Contract terms and conditions organized by type and order';
COMMENT ON TABLE public.contract_revisions IS 'Version control for contract changes with snapshots';
COMMENT ON TABLE public.contract_activities IS 'Audit trail for all contract-related activities and status changes';