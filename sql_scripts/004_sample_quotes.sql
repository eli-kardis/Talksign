-- 004_sample_quotes.sql
-- 샘플 견적서 데이터 생성

-- 김프리랜서의 견적서들
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
    expires_at,
    created_at
) VALUES 
-- 승인된 견적서
(
    '660e8400-e29b-41d4-a716-446655440001'::uuid,
    '550e8400-e29b-41d4-a716-446655440001'::uuid,
    '이스타트업',
    'startup@company.com',
    '02-1234-5678',
    '스타트업 A',
    '웹사이트 리뉴얼 프로젝트',
    '기업 홈페이지 리뉴얼 및 반응형 웹 개발',
    '[
        {"name": "웹사이트 디자인", "quantity": 1, "unit_price": 3000000, "amount": 3000000},
        {"name": "프론트엔드 개발", "quantity": 1, "unit_price": 4000000, "amount": 4000000},
        {"name": "백엔드 API 개발", "quantity": 1, "unit_price": 2000000, "amount": 2000000}
    ]'::jsonb,
    9000000,
    10.0,
    'approved',
    NOW() + INTERVAL '30 days',
    NOW() - INTERVAL '15 days'
),
-- 발송된 견적서
(
    '660e8400-e29b-41d4-a716-446655440002'::uuid,
    '550e8400-e29b-41d4-a716-446655440001'::uuid,
    '김마케팅',
    'marketing@company.com',
    '02-9876-5432',
    '마케팅 에이전시 B',
    '브랜딩 패키지 디자인',
    '로고, 명함, 브로슈어 등 브랜딩 패키지 디자인',
    '[
        {"name": "로고 디자인", "quantity": 3, "unit_price": 500000, "amount": 1500000},
        {"name": "명함 디자인", "quantity": 1, "unit_price": 300000, "amount": 300000},
        {"name": "브로슈어 디자인", "quantity": 1, "unit_price": 800000, "amount": 800000}
    ]'::jsonb,
    2600000,
    10.0,
    'sent',
    NOW() + INTERVAL '20 days',
    NOW() - INTERVAL '5 days'
),
-- 초안 견적서
(
    '660e8400-e29b-41d4-a716-446655440003'::uuid,
    '550e8400-e29b-41d4-a716-446655440001'::uuid,
    '박커머스',
    'commerce@shop.com',
    '02-5555-1234',
    '이커머스 C',
    '쇼핑몰 개발 프로젝트',
    '온라인 쇼핑몰 구축 및 결제 시스템 연동',
    '[
        {"name": "쇼핑몰 UI/UX 디자인", "quantity": 1, "unit_price": 2500000, "amount": 2500000},
        {"name": "프론트엔드 개발", "quantity": 1, "unit_price": 3500000, "amount": 3500000},
        {"name": "백엔드 개발", "quantity": 1, "unit_price": 4000000, "amount": 4000000},
        {"name": "결제 시스템 연동", "quantity": 1, "unit_price": 1000000, "amount": 1000000}
    ]'::jsonb,
    11000000,
    10.0,
    'draft',
    NOW() + INTERVAL '45 days',
    NOW() - INTERVAL '2 days'
);

-- 박디자이너의 견적서들
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
    expires_at,
    created_at
) VALUES 
-- 발송된 견적서
(
    '660e8400-e29b-41d4-a716-446655440004'::uuid,
    '550e8400-e29b-41d4-a716-446655440002'::uuid,
    '최카페',
    'cafe@coffee.com',
    '02-7777-8888',
    '카페 브랜드 D',
    '카페 브랜딩 디자인',
    '카페 로고, 메뉴판, 인테리어 디자인',
    '[
        {"name": "브랜드 로고 디자인", "quantity": 1, "unit_price": 800000, "amount": 800000},
        {"name": "메뉴판 디자인", "quantity": 1, "unit_price": 600000, "amount": 600000},
        {"name": "인테리어 컨셉 디자인", "quantity": 1, "unit_price": 1200000, "amount": 1200000}
    ]'::jsonb,
    2600000,
    10.0,
    'sent',
    NOW() + INTERVAL '25 days',
    NOW() - INTERVAL '3 days'
),
-- 승인된 견적서
(
    '660e8400-e29b-41d4-a716-446655440005'::uuid,
    '550e8400-e29b-41d4-a716-446655440002'::uuid,
    '한의원',
    'clinic@medical.com',
    '02-3333-4444',
    '한의원 E',
    '의료진 홍보 브로슈어',
    '한의원 홍보용 브로슈어 및 포스터 디자인',
    '[
        {"name": "브로슈어 디자인", "quantity": 1, "unit_price": 700000, "amount": 700000},
        {"name": "포스터 디자인", "quantity": 3, "unit_price": 200000, "amount": 600000}
    ]'::jsonb,
    1300000,
    10.0,
    'approved',
    NOW() + INTERVAL '15 days',
    NOW() - INTERVAL '8 days'
);
