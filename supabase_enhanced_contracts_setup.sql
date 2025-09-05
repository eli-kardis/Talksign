-- Supabase SQL Editor - Enhanced Contracts Setup for LinkFlow
-- Run this script in Supabase SQL Editor to set up the enhanced contracts schema

-- ================================
-- PART 1: ENHANCED CONTRACTS SCHEMA
-- ================================

-- Backup existing contracts data
CREATE TABLE IF NOT EXISTS public.contracts_backup AS SELECT * FROM public.contracts;

-- Add new columns to existing contracts table
ALTER TABLE public.contracts 
-- Client Information (발주처 정보)
ADD COLUMN IF NOT EXISTS client_name TEXT,
ADD COLUMN IF NOT EXISTS client_email TEXT,
ADD COLUMN IF NOT EXISTS client_phone TEXT,
ADD COLUMN IF NOT EXISTS client_company TEXT,
ADD COLUMN IF NOT EXISTS client_business_number TEXT,
ADD COLUMN IF NOT EXISTS client_address TEXT,

-- Supplier Information (수급업체 정보)
ADD COLUMN IF NOT EXISTS supplier_info JSONB DEFAULT '{}'::jsonb,

-- Project Information (프로젝트 정보)
ADD COLUMN IF NOT EXISTS project_description TEXT,
ADD COLUMN IF NOT EXISTS project_start_date DATE,
ADD COLUMN IF NOT EXISTS project_end_date DATE,

-- Contract Items (계약 내역)
ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '[]'::jsonb,

-- Financial Information (금액 정보)
ADD COLUMN IF NOT EXISTS subtotal DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5,2) DEFAULT 10.0,
ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_amount DECIMAL(12,2) DEFAULT 0,

-- Contract Terms (계약 조건)
ADD COLUMN IF NOT EXISTS contract_terms JSONB DEFAULT '[]'::jsonb,

-- Payment Information (결제 정보)
ADD COLUMN IF NOT EXISTS payment_terms TEXT,
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS additional_payment_terms TEXT,

-- Workflow and Status
ADD COLUMN IF NOT EXISTS sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS client_viewed_at TIMESTAMP WITH TIME ZONE,

-- Digital Signature Enhancement
ADD COLUMN IF NOT EXISTS client_signature_data JSONB,
ADD COLUMN IF NOT EXISTS freelancer_signature_data JSONB,
ADD COLUMN IF NOT EXISTS signing_ip_address INET,

-- Integration
ADD COLUMN IF NOT EXISTS contract_url TEXT,

-- Metadata
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS last_modified_by UUID REFERENCES public.users(id);

-- Create supporting tables
CREATE TABLE IF NOT EXISTS public.contract_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    quantity INTEGER DEFAULT 1,
    unit TEXT DEFAULT '개',
    unit_price DECIMAL(12,2) NOT NULL DEFAULT 0,
    amount DECIMAL(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    sort_order INTEGER DEFAULT 0,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.contract_terms (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE NOT NULL,
    term_text TEXT NOT NULL,
    term_type TEXT DEFAULT 'general',
    is_required BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.contract_activities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE NOT NULL,
    activity_type TEXT NOT NULL,
    description TEXT NOT NULL,
    actor_id UUID REFERENCES public.users(id),
    actor_type TEXT DEFAULT 'user',
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_contracts_client_email ON public.contracts(client_email);
CREATE INDEX IF NOT EXISTS idx_contracts_project_dates ON public.contracts(project_start_date, project_end_date);
CREATE INDEX IF NOT EXISTS idx_contract_items_contract_id ON public.contract_items(contract_id);
CREATE INDEX IF NOT EXISTS idx_contract_terms_contract_id ON public.contract_terms(contract_id);
CREATE INDEX IF NOT EXISTS idx_contract_activities_contract_id ON public.contract_activities(contract_id);

-- ================================
-- PART 2: UTILITY FUNCTIONS
-- ================================

-- Function to calculate contract totals
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

-- Function to log contract activities
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

-- Function to send contract to client
CREATE OR REPLACE FUNCTION send_contract(contract_id UUID)
RETURNS TEXT AS $$
DECLARE
    contract_rec RECORD;
    access_token TEXT;
BEGIN
    SELECT * INTO contract_rec
    FROM public.contracts 
    WHERE id = contract_id 
    AND user_id = auth.uid()
    AND status = 'draft';
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Contract not found or cannot be sent';
    END IF;
    
    -- Generate access token
    access_token := MD5(contract_rec.id::TEXT || contract_rec.client_email || contract_rec.created_at::TEXT);
    
    -- Update contract
    UPDATE public.contracts 
    SET 
        status = 'sent',
        sent_at = NOW(),
        contract_url = format('/contracts/%s/view?token=%s', contract_id, access_token),
        updated_at = NOW()
    WHERE id = contract_id;
    
    -- Log activity
    PERFORM log_contract_activity(
        contract_id,
        'sent',
        format('Contract sent to client %s', contract_rec.client_email),
        auth.uid()
    );
    
    RETURN format('/contracts/%s/view?token=%s', contract_id, access_token);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================
-- PART 3: ROW LEVEL SECURITY
-- ================================

-- Enable RLS on new tables
ALTER TABLE public.contract_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for contract_items
CREATE POLICY "Users can manage contract items for their own contracts" ON public.contract_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.contracts c 
            WHERE c.id = contract_items.contract_id 
            AND c.user_id = auth.uid()
        )
    );

-- RLS Policies for contract_terms
CREATE POLICY "Users can manage contract terms for their own contracts" ON public.contract_terms
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.contracts c 
            WHERE c.id = contract_terms.contract_id 
            AND c.user_id = auth.uid()
        )
    );

-- RLS Policies for contract_activities
CREATE POLICY "Users can view contract activities for their own contracts" ON public.contract_activities
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.contracts c 
            WHERE c.id = contract_activities.contract_id 
            AND c.user_id = auth.uid()
        )
    );

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contract_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contract_terms TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contract_activities TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_contract_totals(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION log_contract_activity(UUID, TEXT, TEXT, UUID, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION send_contract(UUID) TO authenticated;

-- ================================
-- PART 4: SAMPLE DATA
-- ================================

-- Insert sample enhanced contract
INSERT INTO public.contracts (
    id,
    quote_id,
    user_id,
    title,
    content,
    client_name,
    client_email,
    client_phone,
    client_company,
    client_business_number,
    client_address,
    supplier_info,
    project_description,
    project_start_date,
    project_end_date,
    items,
    subtotal,
    tax_rate,
    tax_amount,
    total_amount,
    contract_terms,
    payment_terms,
    payment_method,
    status,
    version,
    created_at
) VALUES (
    '770e8400-e29b-41d4-a716-446655440099'::uuid,
    '660e8400-e29b-41d4-a716-446655440001'::uuid,
    (SELECT id FROM public.users LIMIT 1),
    '샘플 웹사이트 개발 계약서',
    '본 계약서는 웹사이트 개발 프로젝트 수행에 관한 계약입니다.',
    '김고객',
    'sample@client.com',
    '010-1234-5678',
    '(주)샘플컴퍼니',
    '123-45-67890',
    '서울시 강남구 테헤란로 123',
    '{
        "name": "개발자",
        "email": "dev@company.com",
        "phone": "010-9876-5432",
        "company_name": "개발 회사",
        "business_registration_number": "987-65-43210"
    }'::jsonb,
    '반응형 웹사이트 개발 프로젝트입니다.',
    '2024-03-01',
    '2024-04-30',
    '[
        {
            "id": "1",
            "name": "웹사이트 디자인",
            "description": "UI/UX 디자인",
            "quantity": 1,
            "unit_price": 2000000,
            "amount": 2000000
        },
        {
            "id": "2",
            "name": "프론트엔드 개발",
            "description": "React 기반 개발",
            "quantity": 1,
            "unit_price": 1500000,
            "amount": 1500000
        }
    ]'::jsonb,
    3500000.00,
    10.0,
    350000.00,
    3850000.00,
    '[
        "프로젝트 수행 기간은 계약 체결 후 60일입니다.",
        "계약금 50% 선입금, 완료 후 50% 잔금 지급",
        "저작권은 대금 완료 후 클라이언트에 이전됩니다."
    ]'::jsonb,
    '50-50',
    'bank-transfer',
    'draft',
    1,
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '=================================';
    RAISE NOTICE 'Enhanced Contracts Schema Setup Complete!';
    RAISE NOTICE '=================================';
    RAISE NOTICE 'Total contracts: %', (SELECT COUNT(*) FROM public.contracts);
    RAISE NOTICE 'Schema includes:';
    RAISE NOTICE '- Enhanced contracts table with client/supplier/project info';
    RAISE NOTICE '- Contract items table for detailed line items'; 
    RAISE NOTICE '- Contract terms table for organized terms & conditions';
    RAISE NOTICE '- Contract activities table for audit trail';
    RAISE NOTICE '- Utility functions for contract management';
    RAISE NOTICE '- Row Level Security policies';
    RAISE NOTICE '- Sample data for testing';
    RAISE NOTICE '=================================';
END $$;