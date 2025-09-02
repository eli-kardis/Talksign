-- 006_sample_payments.sql
-- 샘플 결제 데이터 생성

-- 계약서에 대한 결제 데이터
INSERT INTO public.payments (
    id,
    contract_id,
    user_id,
    amount,
    currency,
    payment_method,
    pg_provider,
    transaction_id,
    pg_transaction_id,
    status,
    paid_at,
    created_at
) VALUES 
-- 완료된 결제 (웹사이트 리뉴얼 프로젝트)
(
    '880e8400-e29b-41d4-a716-446655440001'::uuid,
    '770e8400-e29b-41d4-a716-446655440001'::uuid,
    '550e8400-e29b-41d4-a716-446655440001'::uuid,
    9900000,
    'KRW',
    'bank_transfer',
    'manual',
    'PAY-2024-001',
    'BT-20240115-001',
    'completed',
    NOW() - INTERVAL '30 days',
    NOW() - INTERVAL '40 days'
),
-- 완료된 결제 (브로슈어 디자인)
(
    '880e8400-e29b-41d4-a716-446655440002'::uuid,
    '770e8400-e29b-41d4-a716-446655440002'::uuid,
    '550e8400-e29b-41d4-a716-446655440002'::uuid,
    1430000,
    'KRW',
    'card',
    'toss',
    'PAY-2024-002',
    'TOSS-20240120-002',
    'completed',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '3 days'
),
-- 대기중인 결제 (브랜딩 패키지)
(
    '880e8400-e29b-41d4-a716-446655440003'::uuid,
    '770e8400-e29b-41d4-a716-446655440003'::uuid,
    '550e8400-e29b-41d4-a716-446655440001'::uuid,
    2860000,
    'KRW',
    'virtual_account',
    'iamport',
    'PAY-2024-003',
    NULL,
    'pending',
    NULL,
    NOW() - INTERVAL '1 day'
),
-- 이번 달 추가 완료된 결제들 (매출 통계용)
(
    '880e8400-e29b-41d4-a716-446655440004'::uuid,
    '770e8400-e29b-41d4-a716-446655440001'::uuid,
    '550e8400-e29b-41d4-a716-446655440001'::uuid,
    1500000,
    'KRW',
    'card',
    'toss',
    'PAY-2024-004',
    'TOSS-20240110-004',
    'completed',
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '12 days'
),
(
    '880e8400-e29b-41d4-a716-446655440005'::uuid,
    '770e8400-e29b-41d4-a716-446655440002'::uuid,
    '550e8400-e29b-41d4-a716-446655440002'::uuid,
    800000,
    'KRW',
    'bank_transfer',
    'manual',
    'PAY-2024-005',
    'BT-20240112-005',
    'completed',
    NOW() - INTERVAL '8 days',
    NOW() - INTERVAL '10 days'
),
(
    '880e8400-e29b-41d4-a716-446655440006'::uuid,
    '770e8400-e29b-41d4-a716-446655440001'::uuid,
    '550e8400-e29b-41d4-a716-446655440001'::uuid,
    2200000,
    'KRW',
    'card',
    'iamport',
    'PAY-2024-006',
    'IMP-20240105-006',
    'completed',
    NOW() - INTERVAL '15 days',
    NOW() - INTERVAL '17 days'
);
