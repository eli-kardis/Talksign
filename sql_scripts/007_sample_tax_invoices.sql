-- 007_sample_tax_invoices.sql
-- 샘플 세금계산서 데이터 생성

-- 완료된 결제에 대한 세금계산서들
INSERT INTO public.tax_invoices (
    id,
    user_id,
    payment_id,
    invoice_number,
    issue_date,
    supply_date,
    supplier_business_number,
    supplier_name,
    supplier_address,
    supplier_phone,
    supplier_email,
    buyer_business_number,
    buyer_name,
    buyer_address,
    buyer_phone,
    buyer_email,
    supply_amount,
    tax_amount,
    items,
    status,
    sent_at,
    confirmed_at,
    created_at
) VALUES 
-- 확인된 세금계산서 (웹사이트 리뉴얼)
(
    '990e8400-e29b-41d4-a716-446655440001'::uuid,
    '550e8400-e29b-41d4-a716-446655440001'::uuid,
    '880e8400-e29b-41d4-a716-446655440001'::uuid,
    '2024-000001',
    '2024-01-15',
    '2024-01-15',
    '123-45-67890',
    '김프리랜서 스튜디오',
    '서울시 강남구 테헤란로 123',
    '010-1234-5678',
    'freelancer@demo.com',
    '111-22-33333',
    '스타트업 A',
    '서울시 송파구 올림픽로 300',
    '02-1234-5678',
    'startup@company.com',
    9000000,
    900000,
    '[
        {"name": "웹사이트 디자인", "spec": "기업 홈페이지 리뉴얼", "quantity": "1식", "unit_price": 3000000, "amount": 3000000},
        {"name": "프론트엔드 개발", "spec": "반응형 웹 개발", "quantity": "1식", "unit_price": 4000000, "amount": 4000000},
        {"name": "백엔드 API 개발", "spec": "REST API 구축", "quantity": "1식", "unit_price": 2000000, "amount": 2000000}
    ]'::jsonb,
    'confirmed',
    NOW() - INTERVAL '25 days',
    NOW() - INTERVAL '20 days',
    NOW() - INTERVAL '30 days'
),
-- 발송된 세금계산서 (브로슈어 디자인)
(
    '990e8400-e29b-41d4-a716-446655440002'::uuid,
    '550e8400-e29b-41d4-a716-446655440002'::uuid,
    '880e8400-e29b-41d4-a716-446655440002'::uuid,
    '2024-000002',
    '2024-01-20',
    '2024-01-20',
    '987-65-43210',
    '박디자이너 디자인 스튜디오',
    '서울시 마포구 홍대입구 456',
    '010-9876-5432',
    'designer@demo.com',
    '444-55-66666',
    '한의원 E',
    '서울시 종로구 인사동길 789',
    '02-3333-4444',
    'clinic@medical.com',
    1300000,
    130000,
    '[
        {"name": "브로슈어 디자인", "spec": "한의원 홍보용", "quantity": "1종", "unit_price": 700000, "amount": 700000},
        {"name": "포스터 디자인", "spec": "A3 사이즈", "quantity": "3종", "unit_price": 200000, "amount": 600000}
    ]'::jsonb,
    'sent',
    NOW() - INTERVAL '1 day',
    NULL,
    NOW() - INTERVAL '1 day'
),
-- 이번 달 추가 세금계산서들
(
    '990e8400-e29b-41d4-a716-446655440003'::uuid,
    '550e8400-e29b-41d4-a716-446655440001'::uuid,
    '880e8400-e29b-41d4-a716-446655440004'::uuid,
    '2024-000003',
    '2024-01-10',
    '2024-01-10',
    '123-45-67890',
    '김프리랜서 스튜디오',
    '서울시 강남구 테헤란로 123',
    '010-1234-5678',
    'freelancer@demo.com',
    '222-33-44444',
    '마케팅 컴퍼니',
    '서울시 서초구 서초대로 555',
    '02-5555-6666',
    'marketing@company.com',
    1363636,
    136364,
    '[
        {"name": "마케팅 컨설팅", "spec": "브랜드 전략 수립", "quantity": "1식", "unit_price": 1363636, "amount": 1363636}
    ]'::jsonb,
    'confirmed',
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '10 days'
),
-- 초안 상태 세금계산서
(
    '990e8400-e29b-41d4-a716-446655440004'::uuid,
    '550e8400-e29b-41d4-a716-446655440002'::uuid,
    '880e8400-e29b-41d4-a716-446655440005'::uuid,
    '2024-000004',
    CURRENT_DATE,
    CURRENT_DATE,
    '987-65-43210',
    '박디자이너 디자인 스튜디오',
    '서울시 마포구 홍대입구 456',
    '010-9876-5432',
    'designer@demo.com',
    '777-88-99999',
    '카페 브랜드',
    '서울시 강남구 압구정로 321',
    '02-7777-8888',
    'cafe@coffee.com',
    727273,
    72727,
    '[
        {"name": "로고 디자인", "spec": "카페 브랜드 로고", "quantity": "1종", "unit_price": 727273, "amount": 727273}
    ]'::jsonb,
    'draft',
    NULL,
    NULL,
    NOW() - INTERVAL '2 days'
);
