-- Final Enhanced Contracts Setup for LinkFlow - Single Complete Script
-- Run this script in Supabase SQL Editor to set up everything from scratch

-- ================================
-- PART 1: CREATE ENHANCED SCHEMA
-- ================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create supporting tables first (if they don't exist)
CREATE TABLE IF NOT EXISTS public.contract_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    contract_id UUID NOT NULL, -- Will add FK constraint later
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
    contract_id UUID NOT NULL, -- Will add FK constraint later
    term_text TEXT NOT NULL,
    term_type TEXT DEFAULT 'general',
    is_required BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.contract_activities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    contract_id UUID NOT NULL, -- Will add FK constraint later
    activity_type TEXT NOT NULL,
    description TEXT NOT NULL,
    actor_id UUID REFERENCES public.users(id),
    actor_type TEXT DEFAULT 'user',
    actor_name TEXT,
    actor_email TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================
-- PART 2: ENHANCE CONTRACTS TABLE
-- ================================

-- Add new columns to existing contracts table (if they don't exist)
DO $$ 
BEGIN
    -- Client Information (발주처 정보)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'client_name') THEN
        ALTER TABLE public.contracts ADD COLUMN client_name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'client_email') THEN
        ALTER TABLE public.contracts ADD COLUMN client_email TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'client_phone') THEN
        ALTER TABLE public.contracts ADD COLUMN client_phone TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'client_company') THEN
        ALTER TABLE public.contracts ADD COLUMN client_company TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'client_business_number') THEN
        ALTER TABLE public.contracts ADD COLUMN client_business_number TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'client_address') THEN
        ALTER TABLE public.contracts ADD COLUMN client_address TEXT;
    END IF;

    -- Supplier Information (수급업체 정보)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'supplier_info') THEN
        ALTER TABLE public.contracts ADD COLUMN supplier_info JSONB DEFAULT '{}'::jsonb;
    END IF;

    -- Project Information (프로젝트 정보)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'project_description') THEN
        ALTER TABLE public.contracts ADD COLUMN project_description TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'project_start_date') THEN
        ALTER TABLE public.contracts ADD COLUMN project_start_date DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'project_end_date') THEN
        ALTER TABLE public.contracts ADD COLUMN project_end_date DATE;
    END IF;

    -- Contract Items (계약 내역)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'items') THEN
        ALTER TABLE public.contracts ADD COLUMN items JSONB DEFAULT '[]'::jsonb;
    END IF;

    -- Financial Information (금액 정보)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'subtotal') THEN
        ALTER TABLE public.contracts ADD COLUMN subtotal DECIMAL(12,2) DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'tax_rate') THEN
        ALTER TABLE public.contracts ADD COLUMN tax_rate DECIMAL(5,2) DEFAULT 10.0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'tax_amount') THEN
        ALTER TABLE public.contracts ADD COLUMN tax_amount DECIMAL(12,2) DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'total_amount') THEN
        ALTER TABLE public.contracts ADD COLUMN total_amount DECIMAL(12,2) DEFAULT 0;
    END IF;

    -- Contract Terms (계약 조건)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'contract_terms') THEN
        ALTER TABLE public.contracts ADD COLUMN contract_terms JSONB DEFAULT '[]'::jsonb;
    END IF;

    -- Payment Information (결제 정보)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'payment_terms') THEN
        ALTER TABLE public.contracts ADD COLUMN payment_terms TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'payment_method') THEN
        ALTER TABLE public.contracts ADD COLUMN payment_method TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'additional_payment_terms') THEN
        ALTER TABLE public.contracts ADD COLUMN additional_payment_terms TEXT;
    END IF;

    -- Workflow and Status
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'sent_at') THEN
        ALTER TABLE public.contracts ADD COLUMN sent_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'client_viewed_at') THEN
        ALTER TABLE public.contracts ADD COLUMN client_viewed_at TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Digital Signature Enhancement
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'client_signature_data') THEN
        ALTER TABLE public.contracts ADD COLUMN client_signature_data JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'freelancer_signature_data') THEN
        ALTER TABLE public.contracts ADD COLUMN freelancer_signature_data JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'signing_ip_address') THEN
        ALTER TABLE public.contracts ADD COLUMN signing_ip_address INET;
    END IF;

    -- Integration
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'contract_url') THEN
        ALTER TABLE public.contracts ADD COLUMN contract_url TEXT;
    END IF;

    -- Metadata
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'version') THEN
        ALTER TABLE public.contracts ADD COLUMN version INTEGER DEFAULT 1;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'last_modified_by') THEN
        ALTER TABLE public.contracts ADD COLUMN last_modified_by UUID REFERENCES public.users(id);
    END IF;
END $$;

-- Make quote_id nullable temporarily to avoid FK issues
ALTER TABLE public.contracts ALTER COLUMN quote_id DROP NOT NULL;

-- ================================
-- PART 3: CREATE INDEXES
-- ================================

CREATE INDEX IF NOT EXISTS idx_contracts_client_email ON public.contracts(client_email);
CREATE INDEX IF NOT EXISTS idx_contracts_project_dates ON public.contracts(project_start_date, project_end_date);
CREATE INDEX IF NOT EXISTS idx_contracts_total_amount ON public.contracts(total_amount);
CREATE INDEX IF NOT EXISTS idx_contracts_sent_at ON public.contracts(sent_at DESC);

CREATE INDEX IF NOT EXISTS idx_contract_items_contract_id ON public.contract_items(contract_id);
CREATE INDEX IF NOT EXISTS idx_contract_items_sort_order ON public.contract_items(contract_id, sort_order);

CREATE INDEX IF NOT EXISTS idx_contract_terms_contract_id ON public.contract_terms(contract_id);
CREATE INDEX IF NOT EXISTS idx_contract_terms_sort_order ON public.contract_terms(contract_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_contract_terms_type ON public.contract_terms(term_type);

CREATE INDEX IF NOT EXISTS idx_contract_activities_contract_id ON public.contract_activities(contract_id);
CREATE INDEX IF NOT EXISTS idx_contract_activities_type ON public.contract_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_contract_activities_created_at ON public.contract_activities(created_at DESC);

-- ================================
-- PART 4: CREATE UTILITY FUNCTIONS
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

-- ================================
-- PART 5: CLEAR EXISTING SAMPLE DATA
-- ================================

-- Clear existing sample data using UUID casting (fixed the LIKE operator issue)
DELETE FROM public.contract_activities WHERE contract_id::TEXT LIKE '770e8400-%';
DELETE FROM public.contract_terms WHERE contract_id::TEXT LIKE '770e8400-%';
DELETE FROM public.contract_items WHERE contract_id::TEXT LIKE '770e8400-%';
DELETE FROM public.contracts WHERE id::TEXT LIKE '770e8400-%';
DELETE FROM public.quotes WHERE id::TEXT LIKE '660e8400-%';

-- ================================
-- PART 6: INSERT SAMPLE QUOTES
-- ================================

-- Insert sample quotes first
INSERT INTO public.quotes (
    id,
    user_id,
    client_name,
    client_email,
    client_phone,
    client_company,
    title,
    description,
    items,
    subtotal,
    tax_rate,
    status,
    created_at
) VALUES 
-- Quote 1: For the completed website project
(
    '660e8400-e29b-41d4-a716-446655440001'::uuid,
    (SELECT id FROM public.users LIMIT 1),
    '김고객',
    'client@startup-a.com',
    '010-1234-5678',
    '(주)스타트업에이',
    '웹사이트 리뉴얼 프로젝트',
    '기존 웹사이트의 UI/UX 개선 및 반응형 웹사이트 구축',
    '[
        {"id": "1", "name": "웹사이트 디자인", "description": "UI/UX 디자인", "quantity": 1, "unit_price": 1500000, "amount": 1500000},
        {"id": "2", "name": "프론트엔드 개발", "description": "React 개발", "quantity": 1, "unit_price": 1200000, "amount": 1200000},
        {"id": "3", "name": "SEO 최적화", "description": "검색엔진 최적화", "quantity": 1, "unit_price": 300000, "amount": 300000}
    ]'::jsonb,
    3000000.00,
    10.0,
    'approved',
    NOW() - INTERVAL '60 days'
),
-- Quote 2: For the medical brochure project  
(
    '660e8400-e29b-41d4-a716-446655440005'::uuid,
    (SELECT id FROM public.users LIMIT 1),
    '이원장',
    'director@hanyiwon-e.com',
    '02-555-1234',
    '한의원 E',
    '의료진 홍보 브로슈어',
    '한의원 홍보 브로슈어 및 포스터 디자인',
    '[
        {"id": "1", "name": "브로슈어 디자인", "description": "A4 삼단 접지", "quantity": 1, "unit_price": 800000, "amount": 800000},
        {"id": "2", "name": "포스터 디자인", "description": "A1 포스터 3종", "quantity": 3, "unit_price": 200000, "amount": 600000}
    ]'::jsonb,
    1400000.00,
    10.0,
    'approved',
    NOW() - INTERVAL '10 days'
),
-- Quote 3: For the branding package project
(
    '660e8400-e29b-41d4-a716-446655440002'::uuid,
    (SELECT id FROM public.users LIMIT 1),
    '최마케터',
    'marketer@agency-b.com', 
    '010-2345-6789',
    '마케팅 에이전시 B',
    '브랜딩 패키지 디자인',
    '브랜드 아이덴티티 구축을 위한 종합 브랜딩 패키지',
    '[
        {"id": "1", "name": "로고 디자인", "description": "메인 로고 3안", "quantity": 1, "unit_price": 1000000, "amount": 1000000},
        {"id": "2", "name": "명함 디자인", "description": "브랜드 명함", "quantity": 1, "unit_price": 300000, "amount": 300000},
        {"id": "3", "name": "브로슈어 디자인", "description": "회사 소개", "quantity": 1, "unit_price": 500000, "amount": 500000},
        {"id": "4", "name": "가이드라인", "description": "브랜드 가이드", "quantity": 1, "unit_price": 700000, "amount": 700000}
    ]'::jsonb,
    2500000.00,
    10.0,
    'approved',
    NOW() - INTERVAL '5 days'
);

-- ================================
-- PART 7: INSERT ENHANCED CONTRACTS
-- ================================

-- Insert enhanced sample contracts
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
    additional_payment_terms,
    status,
    sent_at,
    signed_at,
    version,
    created_at,
    updated_at
) VALUES 

-- Contract 1: Completed Website Renewal Project
(
    '770e8400-e29b-41d4-a716-446655440001'::uuid,
    '660e8400-e29b-41d4-a716-446655440001'::uuid,
    (SELECT id FROM public.users LIMIT 1),
    '웹사이트 리뉴얼 프로젝트 계약서',
    '본 계약서는 프리랜서와 클라이언트 간의 웹사이트 리뉴얼 프로젝트 수행에 관한 계약입니다.',
    
    '김고객',
    'client@startup-a.com',
    '010-1234-5678',
    '(주)스타트업에이',
    '123-45-67890',
    '서울시 강남구 테헤란로 123, 4층',
    
    '{
        "name": "김프리랜서",
        "email": "freelancer@example.com",
        "phone": "010-9876-5432",
        "company_name": "김프리랜서 스튜디오",
        "business_registration_number": "987-65-43210",
        "business_address": "서울시 서초구 강남대로 456, 2층"
    }'::jsonb,
    
    '기존 웹사이트의 UI/UX 개선 및 반응형 웹사이트 구축 프로젝트입니다.',
    '2024-01-20',
    '2024-03-31',
    
    '[
        {
            "id": "1",
            "name": "웹사이트 디자인 (PC/모바일)",
            "description": "반응형 웹사이트 UI/UX 디자인 및 시안 제작",
            "quantity": 1,
            "unit_price": 1500000,
            "amount": 1500000
        },
        {
            "id": "2", 
            "name": "퍼블리싱 및 프론트엔드 개발",
            "description": "HTML/CSS/JavaScript 기반 프론트엔드 개발",
            "quantity": 1,
            "unit_price": 1200000,
            "amount": 1200000
        },
        {
            "id": "3",
            "name": "SEO 최적화",
            "description": "검색엔진 최적화 및 성능 개선",
            "quantity": 1,
            "unit_price": 300000,
            "amount": 300000
        }
    ]'::jsonb,
    
    3000000.00,
    10.0,
    300000.00,
    3300000.00,
    
    '[
        "프로젝트 수행 기간은 계약서 체결 후 협의하여 결정합니다.",
        "계약금 50% 선입금, 완료 후 50% 잔금 지급",
        "프로젝트 요구사항 변경 시 추가 비용이 발생할 수 있습니다.",
        "저작권은 완전한 대금 지급 후 발주처로 이전됩니다.",
        "계약 위반 시 위약금이 부과될 수 있습니다."
    ]'::jsonb,
    
    '50-50',
    'bank-transfer',
    '선급금은 계약 체결 후 3일 내 입금, 잔금은 프로젝트 완료 후 7일 내 지급',
    
    'completed',
    NOW() - INTERVAL '50 days',
    NOW() - INTERVAL '45 days',
    
    1,
    NOW() - INTERVAL '50 days',
    NOW() - INTERVAL '10 days'
),

-- Contract 2: Signed Medical Brochure Design
(
    '770e8400-e29b-41d4-a716-446655440002'::uuid,
    '660e8400-e29b-41d4-a716-446655440005'::uuid,
    (SELECT id FROM public.users LIMIT 1),
    '의료진 홍보 브로슈어 디자인 계약서',
    '본 계약서는 디자이너와 한의원 간의 홍보 브로슈어 디자인 프로젝트 수행에 관한 계약입니다.',
    
    '이원장',
    'director@hanyiwon-e.com',
    '02-555-1234',
    '한의원 E',
    '234-56-78901',
    '서울시 강동구 천호대로 789, 1층',
    
    '{
        "name": "박디자이너",
        "email": "designer@example.com", 
        "phone": "010-8765-4321",
        "company_name": "박디자이너 스튜디오",
        "business_registration_number": "876-54-32109",
        "business_address": "서울시 마포구 홍대입구로 321, 3층"
    }'::jsonb,
    
    '한의원 홍보 브로슈어 및 포스터 디자인 프로젝트입니다.',
    '2024-02-01',
    '2024-02-15',
    
    '[
        {
            "id": "1",
            "name": "한의원 홍보 브로슈어 디자인",
            "description": "A4 크기 삼단 접지 브로슈어 디자인",
            "quantity": 1,
            "unit_price": 800000,
            "amount": 800000
        },
        {
            "id": "2",
            "name": "홍보 포스터 디자인",
            "description": "A1 크기 홍보 포스터 3종 디자인", 
            "quantity": 3,
            "unit_price": 200000,
            "amount": 600000
        }
    ]'::jsonb,
    
    1400000.00,
    10.0,
    140000.00,
    1540000.00,
    
    '[
        "최대 3회까지 수정 요청 가능",
        "추가 수정 시 회당 100,000원 비용 발생",
        "최종 파일은 AI, PDF 형태로 제공",
        "작업물의 상업적 이용권은 클라이언트에 귀속"
    ]'::jsonb,
    
    '30-70',
    'bank-transfer',
    '선급금 30% 계약 후 지급, 잔금 70% 완료 후 지급',
    
    'signed',
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '3 days',
    
    1,
    NOW() - INTERVAL '5 days', 
    NOW() - INTERVAL '3 days'
),

-- Contract 3: Sent Branding Package Design
(
    '770e8400-e29b-41d4-a716-446655440003'::uuid,
    '660e8400-e29b-41d4-a716-446655440002'::uuid,
    (SELECT id FROM public.users LIMIT 1),
    '브랜딩 패키지 디자인 계약서',
    '본 계약서는 프리랜서와 마케팅 에이전시 간의 브랜딩 패키지 디자인 프로젝트 수행에 관한 계약입니다.',
    
    '최마케터', 
    'marketer@agency-b.com',
    '010-2345-6789',
    '마케팅 에이전시 B',
    '345-67-89012',
    '서울시 용산구 이태원로 456, 5층',
    
    '{
        "name": "김프리랜서",
        "email": "freelancer@example.com",
        "phone": "010-9876-5432", 
        "company_name": "김프리랜서 스튜디오",
        "business_registration_number": "987-65-43210",
        "business_address": "서울시 서초구 강남대로 456, 2층"
    }'::jsonb,
    
    '브랜드 아이덴티티 구축을 위한 종합 브랜딩 패키지 디자인 프로젝트입니다.',
    '2024-02-10',
    '2024-03-03',
    
    '[
        {
            "id": "1",
            "name": "브랜드 로고 디자인",
            "description": "메인 로고 및 서브 로고 3안 제시 후 1안 선택",
            "quantity": 1,
            "unit_price": 1000000,
            "amount": 1000000
        },
        {
            "id": "2",
            "name": "명함 디자인", 
            "description": "브랜드 아이덴티티에 맞는 명함 디자인",
            "quantity": 1,
            "unit_price": 300000,
            "amount": 300000
        },
        {
            "id": "3",
            "name": "브로슈어 디자인",
            "description": "회사 소개 브로슈어 디자인",
            "quantity": 1, 
            "unit_price": 500000,
            "amount": 500000
        },
        {
            "id": "4",
            "name": "브랜드 가이드라인 제작",
            "description": "로고 사용법, 컬러 팔레트, 폰트 가이드 등",
            "quantity": 1,
            "unit_price": 700000,
            "amount": 700000
        }
    ]'::jsonb,
    
    2500000.00,
    10.0,
    250000.00,
    2750000.00,
    
    '[
        "로고 시안은 3개까지 제공",
        "선택된 시안에 대해 2회까지 수정 가능", 
        "브랜드 가이드라인 포함 최종 납품",
        "클라이언트 요청 시 소스파일 제공"
    ]'::jsonb,
    
    '50-50',
    'bank-transfer',
    '선급금 50% 계약 후 지급, 잔금 50% 완료 후 지급',
    
    'sent',
    NOW() - INTERVAL '2 days',
    NULL,
    
    1,
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days'
);

-- ================================
-- PART 8: ADD FOREIGN KEY CONSTRAINTS
-- ================================

-- Now add foreign key constraints
DO $$
BEGIN
    -- Add FK for contract_items
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'contract_items_contract_id_fkey') THEN
        ALTER TABLE public.contract_items 
        ADD CONSTRAINT contract_items_contract_id_fkey 
        FOREIGN KEY (contract_id) REFERENCES public.contracts(id) ON DELETE CASCADE;
    END IF;

    -- Add FK for contract_terms
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'contract_terms_contract_id_fkey') THEN
        ALTER TABLE public.contract_terms 
        ADD CONSTRAINT contract_terms_contract_id_fkey 
        FOREIGN KEY (contract_id) REFERENCES public.contracts(id) ON DELETE CASCADE;
    END IF;

    -- Add FK for contract_activities
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'contract_activities_contract_id_fkey') THEN
        ALTER TABLE public.contract_activities 
        ADD CONSTRAINT contract_activities_contract_id_fkey 
        FOREIGN KEY (contract_id) REFERENCES public.contracts(id) ON DELETE CASCADE;
    END IF;
END $$;

-- ================================
-- PART 9: INSERT SUPPORTING DATA
-- ================================

-- Insert supporting data
INSERT INTO public.contract_items (
    contract_id, name, description, quantity, unit_price, sort_order, category
) VALUES
-- Items for Contract 1
('770e8400-e29b-41d4-a716-446655440001'::uuid, '웹사이트 디자인 (PC/모바일)', '반응형 웹사이트 UI/UX 디자인', 1, 1500000, 1, 'design'),
('770e8400-e29b-41d4-a716-446655440001'::uuid, '퍼블리싱 및 프론트엔드 개발', 'HTML/CSS/JS 개발', 1, 1200000, 2, 'development'),
('770e8400-e29b-41d4-a716-446655440001'::uuid, 'SEO 최적화', '검색엔진 최적화', 1, 300000, 3, 'optimization'),

-- Items for Contract 2
('770e8400-e29b-41d4-a716-446655440002'::uuid, '한의원 홍보 브로슈어 디자인', 'A4 삼단 접지 브로슈어', 1, 800000, 1, 'design'),
('770e8400-e29b-41d4-a716-446655440002'::uuid, '홍보 포스터 디자인', 'A1 포스터 3종', 3, 200000, 2, 'design'),

-- Items for Contract 3
('770e8400-e29b-41d4-a716-446655440003'::uuid, '브랜드 로고 디자인', '메인 로고 3안 제시', 1, 1000000, 1, 'branding'),
('770e8400-e29b-41d4-a716-446655440003'::uuid, '명함 디자인', '브랜드 명함 디자인', 1, 300000, 2, 'design'),
('770e8400-e29b-41d4-a716-446655440003'::uuid, '브로슈어 디자인', '회사 소개 브로슈어', 1, 500000, 3, 'design'),
('770e8400-e29b-41d4-a716-446655440003'::uuid, '브랜드 가이드라인 제작', '브랜드 가이드라인', 1, 700000, 4, 'branding');

INSERT INTO public.contract_terms (
    contract_id, term_text, term_type, sort_order
) VALUES
-- Terms for Contract 1
('770e8400-e29b-41d4-a716-446655440001'::uuid, '프로젝트 수행 기간은 계약서 체결 후 협의하여 결정합니다.', 'general', 1),
('770e8400-e29b-41d4-a716-446655440001'::uuid, '계약금 50% 선입금, 완료 후 50% 잔금 지급', 'payment', 2),
('770e8400-e29b-41d4-a716-446655440001'::uuid, '프로젝트 요구사항 변경 시 추가 비용이 발생할 수 있습니다.', 'general', 3),
('770e8400-e29b-41d4-a716-446655440001'::uuid, '저작권은 완전한 대금 지급 후 발주처로 이전됩니다.', 'delivery', 4),

-- Terms for Contract 2
('770e8400-e29b-41d4-a716-446655440002'::uuid, '최대 3회까지 수정 요청 가능', 'general', 1),
('770e8400-e29b-41d4-a716-446655440002'::uuid, '추가 수정 시 회당 100,000원 비용 발생', 'payment', 2),
('770e8400-e29b-41d4-a716-446655440002'::uuid, '최종 파일은 AI, PDF 형태로 제공', 'delivery', 3),

-- Terms for Contract 3
('770e8400-e29b-41d4-a716-446655440003'::uuid, '로고 시안은 3개까지 제공', 'general', 1),
('770e8400-e29b-41d4-a716-446655440003'::uuid, '선택된 시안에 대해 2회까지 수정 가능', 'general', 2),
('770e8400-e29b-41d4-a716-446655440003'::uuid, '브랜드 가이드라인 포함 최종 납품', 'delivery', 3);

INSERT INTO public.contract_activities (
    contract_id, activity_type, description, actor_id, metadata, created_at
) VALUES
-- Activities for Contract 1
('770e8400-e29b-41d4-a716-446655440001'::uuid, 'created', 'Contract created from quote', (SELECT id FROM public.users LIMIT 1), '{}'::jsonb, NOW() - INTERVAL '50 days'),
('770e8400-e29b-41d4-a716-446655440001'::uuid, 'sent', 'Contract sent to client', (SELECT id FROM public.users LIMIT 1), '{}'::jsonb, NOW() - INTERVAL '50 days'),
('770e8400-e29b-41d4-a716-446655440001'::uuid, 'signed', 'Contract signed by client', NULL, '{}'::jsonb, NOW() - INTERVAL '45 days'),
('770e8400-e29b-41d4-a716-446655440001'::uuid, 'completed', 'Project completed', (SELECT id FROM public.users LIMIT 1), '{}'::jsonb, NOW() - INTERVAL '10 days'),

-- Activities for Contract 2
('770e8400-e29b-41d4-a716-446655440002'::uuid, 'created', 'Contract created from quote', (SELECT id FROM public.users LIMIT 1), '{}'::jsonb, NOW() - INTERVAL '5 days'),
('770e8400-e29b-41d4-a716-446655440002'::uuid, 'sent', 'Contract sent to client', (SELECT id FROM public.users LIMIT 1), '{}'::jsonb, NOW() - INTERVAL '5 days'),
('770e8400-e29b-41d4-a716-446655440002'::uuid, 'signed', 'Contract signed by client', NULL, '{}'::jsonb, NOW() - INTERVAL '3 days'),

-- Activities for Contract 3
('770e8400-e29b-41d4-a716-446655440003'::uuid, 'created', 'Contract created from quote', (SELECT id FROM public.users LIMIT 1), '{}'::jsonb, NOW() - INTERVAL '2 days'),
('770e8400-e29b-41d4-a716-446655440003'::uuid, 'sent', 'Contract sent to client', (SELECT id FROM public.users LIMIT 1), '{}'::jsonb, NOW() - INTERVAL '2 days');

-- ================================
-- PART 10: ENABLE RLS AND PERMISSIONS
-- ================================

-- Enable RLS on new tables
ALTER TABLE public.contract_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for contract_items
DROP POLICY IF EXISTS "Users can manage contract items for their own contracts" ON public.contract_items;
CREATE POLICY "Users can manage contract items for their own contracts" ON public.contract_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.contracts c 
            WHERE c.id = contract_items.contract_id 
            AND c.user_id = auth.uid()
        )
    );

-- RLS Policies for contract_terms
DROP POLICY IF EXISTS "Users can manage contract terms for their own contracts" ON public.contract_terms;
CREATE POLICY "Users can manage contract terms for their own contracts" ON public.contract_terms
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.contracts c 
            WHERE c.id = contract_terms.contract_id 
            AND c.user_id = auth.uid()
        )
    );

-- RLS Policies for contract_activities
DROP POLICY IF EXISTS "Users can view contract activities for their own contracts" ON public.contract_activities;
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

-- Update contract URLs
UPDATE public.contracts 
SET contract_url = format('/contracts/%s/view?token=%s', id, MD5(id::TEXT || client_email || created_at::TEXT))
WHERE status IN ('sent', 'signed', 'completed') AND contract_url IS NULL;

-- ================================
-- PART 11: FINAL VERIFICATION
-- ================================

DO $$
DECLARE
    quote_count INTEGER;
    contract_count INTEGER;
    item_count INTEGER;
    term_count INTEGER;
    activity_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO quote_count FROM public.quotes;
    SELECT COUNT(*) INTO contract_count FROM public.contracts;
    SELECT COUNT(*) INTO item_count FROM public.contract_items;
    SELECT COUNT(*) INTO term_count FROM public.contract_terms;
    SELECT COUNT(*) INTO activity_count FROM public.contract_activities;
    
    RAISE NOTICE '=================================';
    RAISE NOTICE 'Enhanced Contracts Setup Complete!';
    RAISE NOTICE '=================================';
    RAISE NOTICE 'Sample Quotes: %', quote_count;
    RAISE NOTICE 'Enhanced Contracts: %', contract_count;
    RAISE NOTICE 'Contract Items: %', item_count;
    RAISE NOTICE 'Contract Terms: %', term_count;
    RAISE NOTICE 'Contract Activities: %', activity_count;
    RAISE NOTICE '=================================';
    RAISE NOTICE 'All tables created and data inserted!';
    RAISE NOTICE 'Ready to use enhanced contract system!';
    RAISE NOTICE '=================================';
END $$;