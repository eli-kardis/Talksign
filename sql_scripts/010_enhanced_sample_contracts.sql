-- 010_enhanced_sample_contracts.sql
-- Enhanced sample contracts data with the new schema structure

-- First, clear existing contract data to avoid conflicts
DELETE FROM public.contract_activities;
DELETE FROM public.contract_revisions;
DELETE FROM public.contract_terms;
DELETE FROM public.contract_items;
DELETE FROM public.contracts WHERE id NOT IN (SELECT id FROM public.contracts_backup);

-- Insert enhanced sample contracts
INSERT INTO public.contracts (
    id,
    quote_id,
    user_id,
    title,
    content,
    
    -- Client Information
    client_name,
    client_email,
    client_phone,
    client_company,
    client_business_number,
    client_address,
    
    -- Supplier Information (JSONB)
    supplier_info,
    
    -- Project Information
    project_description,
    project_start_date,
    project_end_date,
    
    -- Contract Items (JSONB)
    items,
    
    -- Financial Information
    subtotal,
    tax_rate,
    tax_amount,
    total_amount,
    
    -- Contract Terms (JSONB)
    contract_terms,
    
    -- Payment Information
    payment_terms,
    payment_method,
    additional_payment_terms,
    
    -- Status and Workflow
    status,
    sent_at,
    signed_at,
    
    -- Metadata
    version,
    created_at,
    updated_at
) VALUES 

-- Contract 1: Completed Website Renewal Project
(
    '770e8400-e29b-41d4-a716-446655440001'::uuid,
    '660e8400-e29b-41d4-a716-446655440001'::uuid,
    '550e8400-e29b-41d4-a716-446655440001'::uuid,
    '웹사이트 리뉴얼 프로젝트 계약서',
    '본 계약서는 김프리랜서 스튜디오(공급자)와 스타트업 A(클라이언트) 간의 웹사이트 리뉴얼 프로젝트 수행에 관한 계약입니다.',
    
    -- Client Information
    '김고객',
    'client@startup-a.com',
    '010-1234-5678',
    '(주)스타트업에이',
    '123-45-67890',
    '서울시 강남구 테헤란로 123, 4층',
    
    -- Supplier Information
    '{
        "name": "김프리랜서",
        "email": "freelancer@kimstudio.com",
        "phone": "010-9876-5432",
        "company_name": "김프리랜서 스튜디오",
        "business_registration_number": "987-65-43210",
        "business_address": "서울시 서초구 강남대로 456, 2층"
    }'::jsonb,
    
    -- Project Information
    '기존 웹사이트의 UI/UX 개선 및 반응형 웹사이트 구축 프로젝트입니다. 모던한 디자인과 사용자 친화적인 인터페이스로 재구성하여 브랜드 가치를 높이고 고객 경험을 개선합니다.',
    '2024-01-20',
    '2024-03-31',
    
    -- Contract Items
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
    
    -- Financial Information
    3000000.00,
    10.0,
    300000.00,
    3300000.00,
    
    -- Contract Terms
    '[
        "프로젝트 수행 기간은 계약서 체결 후 협의하여 결정합니다.",
        "계약금 50% 선입금, 완료 후 50% 잔금 지급",
        "프로젝트 요구사항 변경 시 추가 비용이 발생할 수 있습니다.",
        "저작권은 완전한 대금 지급 후 발주처로 이전됩니다.",
        "계약 위반 시 위약금이 부과될 수 있습니다."
    ]'::jsonb,
    
    -- Payment Information
    '50-50',
    'bank-transfer',
    '선급금은 계약 체결 후 3일 내 입금, 잔금은 프로젝트 완료 후 7일 내 지급',
    
    -- Status and Workflow
    'completed',
    NOW() - INTERVAL '50 days',
    NOW() - INTERVAL '45 days',
    
    -- Metadata
    1,
    NOW() - INTERVAL '50 days',
    NOW() - INTERVAL '10 days'
),

-- Contract 2: Signed Medical Brochure Design
(
    '770e8400-e29b-41d4-a716-446655440002'::uuid,
    '660e8400-e29b-41d4-a716-446655440005'::uuid,
    '550e8400-e29b-41d4-a716-446655440002'::uuid,
    '의료진 홍보 브로슈어 디자인 계약서',
    '본 계약서는 박디자이너 디자인 스튜디오(공급자)와 한의원 E(클라이언트) 간의 홍보 브로슈어 디자인 프로젝트 수행에 관한 계약입니다.',
    
    -- Client Information
    '이원장',
    'director@hanyiwon-e.com',
    '02-555-1234',
    '한의원 E',
    '234-56-78901',
    '서울시 강동구 천호대로 789, 1층',
    
    -- Supplier Information
    '{
        "name": "박디자이너",
        "email": "designer@parkstudio.com", 
        "phone": "010-8765-4321",
        "company_name": "박디자이너 디자인 스튜디오",
        "business_registration_number": "876-54-32109",
        "business_address": "서울시 마포구 홍대입구로 321, 3층"
    }'::jsonb,
    
    -- Project Information
    '한의원 홍보 브로슈어 및 포스터 디자인 프로젝트입니다. 전문적이고 신뢰감 있는 의료진 이미지를 강조하여 브랜드 인지도를 높입니다.',
    '2024-02-01',
    '2024-02-15',
    
    -- Contract Items
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
    
    -- Financial Information  
    1400000.00,
    10.0,
    140000.00,
    1540000.00,
    
    -- Contract Terms
    '[
        "최대 3회까지 수정 요청 가능",
        "추가 수정 시 회당 100,000원 비용 발생",
        "최종 파일은 AI, PDF 형태로 제공",
        "작업물의 상업적 이용권은 클라이언트에 귀속"
    ]'::jsonb,
    
    -- Payment Information
    '30-70',
    'bank-transfer',
    '선급금 30% 계약 후 지급, 잔금 70% 완료 후 지급',
    
    -- Status and Workflow
    'signed',
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '3 days',
    
    -- Metadata
    1,
    NOW() - INTERVAL '5 days', 
    NOW() - INTERVAL '3 days'
),

-- Contract 3: Sent Branding Package Design (Awaiting Signature)
(
    '770e8400-e29b-41d4-a716-446655440003'::uuid,
    '660e8400-e29b-41d4-a716-446655440002'::uuid,
    '550e8400-e29b-41d4-a716-446655440001'::uuid,
    '브랜딩 패키지 디자인 계약서',
    '본 계약서는 김프리랜서 스튜디오(공급자)와 마케팅 에이전시 B(클라이언트) 간의 브랜딩 패키지 디자인 프로젝트 수행에 관한 계약입니다.',
    
    -- Client Information
    '최마케터', 
    'marketer@agency-b.com',
    '010-2345-6789',
    '마케팅 에이전시 B',
    '345-67-89012',
    '서울시 용산구 이태원로 456, 5층',
    
    -- Supplier Information
    '{
        "name": "김프리랜서",
        "email": "freelancer@kimstudio.com",
        "phone": "010-9876-5432", 
        "company_name": "김프리랜서 스튜디오",
        "business_registration_number": "987-65-43210",
        "business_address": "서울시 서초구 강남대로 456, 2층"
    }'::jsonb,
    
    -- Project Information
    '브랜드 아이덴티티 구축을 위한 종합 브랜딩 패키지 디자인 프로젝트입니다. 로고부터 브랜드 가이드라인까지 일관된 브랜드 경험을 제공합니다.',
    '2024-02-10',
    '2024-03-03',
    
    -- Contract Items
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
    
    -- Financial Information
    2500000.00,
    10.0,
    250000.00,
    2750000.00,
    
    -- Contract Terms
    '[
        "로고 시안은 3개까지 제공",
        "선택된 시안에 대해 2회까지 수정 가능", 
        "브랜드 가이드라인 포함 최종 납품",
        "클라이언트 요청 시 소스파일 제공"
    ]'::jsonb,
    
    -- Payment Information
    '50-50',
    'bank-transfer',
    '선급금 50% 계약 후 지급, 잔금 50% 완료 후 지급',
    
    -- Status and Workflow
    'sent',
    NOW() - INTERVAL '2 days',
    NULL,
    
    -- Metadata
    1,
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days'
);

-- Insert sample contract activities
INSERT INTO public.contract_activities (
    contract_id,
    activity_type,
    description,
    actor_id,
    metadata,
    created_at
) VALUES
-- Activities for Contract 1 (Completed)
('770e8400-e29b-41d4-a716-446655440001'::uuid, 'created', 'Contract created from approved quote', '550e8400-e29b-41d4-a716-446655440001'::uuid, '{"quote_id": "660e8400-e29b-41d4-a716-446655440001"}'::jsonb, NOW() - INTERVAL '50 days'),
('770e8400-e29b-41d4-a716-446655440001'::uuid, 'sent', 'Contract sent to client@startup-a.com', '550e8400-e29b-41d4-a716-446655440001'::uuid, '{"client_email": "client@startup-a.com"}'::jsonb, NOW() - INTERVAL '50 days'),
('770e8400-e29b-41d4-a716-446655440001'::uuid, 'viewed', 'Contract viewed by client', NULL, '{"client_email": "client@startup-a.com", "ip_address": "192.168.1.100"}'::jsonb, NOW() - INTERVAL '46 days'),
('770e8400-e29b-41d4-a716-446655440001'::uuid, 'signed', 'Contract digitally signed by client', NULL, '{"client_email": "client@startup-a.com", "ip_address": "192.168.1.100"}'::jsonb, NOW() - INTERVAL '45 days'),
('770e8400-e29b-41d4-a716-446655440001'::uuid, 'completed', 'Project completed and contract finalized', '550e8400-e29b-41d4-a716-446655440001'::uuid, '{}'::jsonb, NOW() - INTERVAL '10 days'),

-- Activities for Contract 2 (Signed)
('770e8400-e29b-41d4-a716-446655440002'::uuid, 'created', 'Contract created from approved quote', '550e8400-e29b-41d4-a716-446655440002'::uuid, '{"quote_id": "660e8400-e29b-41d4-a716-446655440005"}'::jsonb, NOW() - INTERVAL '5 days'),
('770e8400-e29b-41d4-a716-446655440002'::uuid, 'sent', 'Contract sent to director@hanyiwon-e.com', '550e8400-e29b-41d4-a716-446655440002'::uuid, '{"client_email": "director@hanyiwon-e.com"}'::jsonb, NOW() - INTERVAL '5 days'),
('770e8400-e29b-41d4-a716-446655440002'::uuid, 'viewed', 'Contract viewed by client', NULL, '{"client_email": "director@hanyiwon-e.com", "ip_address": "203.0.113.50"}'::jsonb, NOW() - INTERVAL '4 days'),
('770e8400-e29b-41d4-a716-446655440002'::uuid, 'signed', 'Contract digitally signed by client', NULL, '{"client_email": "director@hanyiwon-e.com", "ip_address": "203.0.113.50"}'::jsonb, NOW() - INTERVAL '3 days'),

-- Activities for Contract 3 (Sent, awaiting signature)
('770e8400-e29b-41d4-a716-446655440003'::uuid, 'created', 'Contract created from approved quote', '550e8400-e29b-41d4-a716-446655440001'::uuid, '{"quote_id": "660e8400-e29b-41d4-a716-446655440002"}'::jsonb, NOW() - INTERVAL '2 days'),
('770e8400-e29b-41d4-a716-446655440003'::uuid, 'sent', 'Contract sent to marketer@agency-b.com', '550e8400-e29b-41d4-a716-446655440001'::uuid, '{"client_email": "marketer@agency-b.com"}'::jsonb, NOW() - INTERVAL '2 days'),
('770e8400-e29b-41d4-a716-446655440003'::uuid, 'viewed', 'Contract viewed by client', NULL, '{"client_email": "marketer@agency-b.com", "ip_address": "198.51.100.25"}'::jsonb, NOW() - INTERVAL '1 day');

-- Insert sample contract items using the normalized table structure
INSERT INTO public.contract_items (
    contract_id,
    name,
    description,
    quantity,
    unit_price,
    sort_order,
    category
) VALUES
-- Items for Contract 1
('770e8400-e29b-41d4-a716-446655440001'::uuid, '웹사이트 디자인 (PC/모바일)', '반응형 웹사이트 UI/UX 디자인 및 시안 제작', 1, 1500000, 1, 'design'),
('770e8400-e29b-41d4-a716-446655440001'::uuid, '퍼블리싱 및 프론트엔드 개발', 'HTML/CSS/JavaScript 기반 프론트엔드 개발', 1, 1200000, 2, 'development'),
('770e8400-e29b-41d4-a716-446655440001'::uuid, 'SEO 최적화', '검색엔진 최적화 및 성능 개선', 1, 300000, 3, 'optimization'),

-- Items for Contract 2  
('770e8400-e29b-41d4-a716-446655440002'::uuid, '한의원 홍보 브로슈어 디자인', 'A4 크기 삼단 접지 브로슈어 디자인', 1, 800000, 1, 'design'),
('770e8400-e29b-41d4-a716-446655440002'::uuid, '홍보 포스터 디자인', 'A1 크기 홍보 포스터 3종 디자인', 3, 200000, 2, 'design'),

-- Items for Contract 3
('770e8400-e29b-41d4-a716-446655440003'::uuid, '브랜드 로고 디자인', '메인 로고 및 서브 로고 3안 제시 후 1안 선택', 1, 1000000, 1, 'branding'),
('770e8400-e29b-41d4-a716-446655440003'::uuid, '명함 디자인', '브랜드 아이덴티티에 맞는 명함 디자인', 1, 300000, 2, 'design'),
('770e8400-e29b-41d4-a716-446655440003'::uuid, '브로슈어 디자인', '회사 소개 브로슈어 디자인', 1, 500000, 3, 'design'),
('770e8400-e29b-41d4-a716-446655440003'::uuid, '브랜드 가이드라인 제작', '로고 사용법, 컬러 팔레트, 폰트 가이드 등', 1, 700000, 4, 'branding');

-- Insert sample contract terms
INSERT INTO public.contract_terms (
    contract_id,
    term_text,
    term_type,
    sort_order
) VALUES
-- Terms for Contract 1
('770e8400-e29b-41d4-a716-446655440001'::uuid, '프로젝트 수행 기간은 계약서 체결 후 협의하여 결정합니다.', 'general', 1),
('770e8400-e29b-41d4-a716-446655440001'::uuid, '계약금 50% 선입금, 완료 후 50% 잔금 지급', 'payment', 2),
('770e8400-e29b-41d4-a716-446655440001'::uuid, '프로젝트 요구사항 변경 시 추가 비용이 발생할 수 있습니다.', 'general', 3),
('770e8400-e29b-41d4-a716-446655440001'::uuid, '저작권은 완전한 대금 지급 후 발주처로 이전됩니다.', 'delivery', 4),
('770e8400-e29b-41d4-a716-446655440001'::uuid, '계약 위반 시 위약금이 부과될 수 있습니다.', 'cancellation', 5),

-- Terms for Contract 2
('770e8400-e29b-41d4-a716-446655440002'::uuid, '최대 3회까지 수정 요청 가능', 'general', 1),
('770e8400-e29b-41d4-a716-446655440002'::uuid, '추가 수정 시 회당 100,000원 비용 발생', 'payment', 2),
('770e8400-e29b-41d4-a716-446655440002'::uuid, '최종 파일은 AI, PDF 형태로 제공', 'delivery', 3),
('770e8400-e29b-41d4-a716-446655440002'::uuid, '작업물의 상업적 이용권은 클라이언트에 귀속', 'delivery', 4),

-- Terms for Contract 3
('770e8400-e29b-41d4-a716-446655440003'::uuid, '로고 시안은 3개까지 제공', 'general', 1),
('770e8400-e29b-41d4-a716-446655440003'::uuid, '선택된 시안에 대해 2회까지 수정 가능', 'general', 2),
('770e8400-e29b-41d4-a716-446655440003'::uuid, '브랜드 가이드라인 포함 최종 납품', 'delivery', 3),
('770e8400-e29b-41d4-a716-446655440003'::uuid, '클라이언트 요청 시 소스파일 제공', 'delivery', 4);

-- Create sample contract revisions for Contract 1 (to show version history)
INSERT INTO public.contract_revisions (
    contract_id,
    version_number,
    title,
    content,
    changes_summary,
    contract_snapshot,
    created_by
) VALUES
('770e8400-e29b-41d4-a716-446655440001'::uuid, 1, '웹사이트 리뉴얼 프로젝트 계약서', '초기 계약서 내용', '최초 계약서 생성', '{"version": 1, "created_at": "2024-01-15T10:00:00Z"}'::jsonb, '550e8400-e29b-41d4-a716-446655440001'::uuid);

-- Update contract URLs for sent contracts
UPDATE public.contracts 
SET contract_url = format('/contracts/%s/view?token=%s', id, MD5(id::TEXT || client_email || created_at::TEXT))
WHERE status IN ('sent', 'signed', 'completed');

-- Verify data integrity
DO $$
BEGIN
    -- Check if all financial calculations are correct
    UPDATE public.contracts 
    SET 
        tax_amount = subtotal * tax_rate / 100,
        total_amount = subtotal + (subtotal * tax_rate / 100)
    WHERE tax_amount != subtotal * tax_rate / 100 
       OR total_amount != subtotal + (subtotal * tax_rate / 100);
    
    RAISE NOTICE 'Enhanced sample contracts data inserted successfully';
    RAISE NOTICE 'Total contracts: %', (SELECT COUNT(*) FROM public.contracts);
    RAISE NOTICE 'Total contract items: %', (SELECT COUNT(*) FROM public.contract_items);
    RAISE NOTICE 'Total contract terms: %', (SELECT COUNT(*) FROM public.contract_terms);
    RAISE NOTICE 'Total contract activities: %', (SELECT COUNT(*) FROM public.contract_activities);
END $$;