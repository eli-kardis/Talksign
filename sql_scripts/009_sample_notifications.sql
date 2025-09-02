-- 009_sample_notifications.sql
-- 샘플 알림 데이터 생성

-- 김프리랜서의 알림들
INSERT INTO public.notifications (
    id,
    user_id,
    type,
    title,
    message,
    quote_id,
    contract_id,
    payment_id,
    channels,
    sent_at,
    read_at,
    created_at
) VALUES 
-- 견적서 승인 알림
(
    'bb0e8400-e29b-41d4-a716-446655440001'::uuid,
    '550e8400-e29b-41d4-a716-446655440001'::uuid,
    'quote_approved',
    '견적서가 승인되었습니다',
    '스타트업 A에서 웹사이트 리뉴얼 프로젝트 견적서를 승인했습니다. 계약서 작성을 진행해주세요.',
    '660e8400-e29b-41d4-a716-446655440001'::uuid,
    NULL,
    NULL,
    '["in_app", "email", "kakao_talk"]'::jsonb,
    NOW() - INTERVAL '15 days',
    NOW() - INTERVAL '14 days',
    NOW() - INTERVAL '15 days'
),
-- 계약서 서명 완료 알림
(
    'bb0e8400-e29b-41d4-a716-446655440002'::uuid,
    '550e8400-e29b-41d4-a716-446655440001'::uuid,
    'contract_signed',
    '계약서 서명이 완료되었습니다',
    '웹사이트 리뉴얼 프로젝트 계약서에 대한 서명이 완료되었습니다. 프로젝트를 시작하세요.',
    '660e8400-e29b-41d4-a716-446655440001'::uuid,
    '770e8400-e29b-41d4-a716-446655440001'::uuid,
    NULL,
    '["in_app", "email"]'::jsonb,
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '9 days',
    NOW() - INTERVAL '10 days'
),
-- 결제 완료 알림
(
    'bb0e8400-e29b-41d4-a716-446655440003'::uuid,
    '550e8400-e29b-41d4-a716-446655440001'::uuid,
    'payment_completed',
    '결제가 완료되었습니다',
    '웹사이트 리뉴얼 프로젝트 대금 9,900,000원이 입금되었습니다.',
    '660e8400-e29b-41d4-a716-446655440001'::uuid,
    '770e8400-e29b-41d4-a716-446655440001'::uuid,
    '880e8400-e29b-41d4-a716-446655440001'::uuid,
    '["in_app", "email", "kakao_talk"]'::jsonb,
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '4 days',
    NOW() - INTERVAL '5 days'
),
-- 견적서 발송 알림
(
    'bb0e8400-e29b-41d4-a716-446655440004'::uuid,
    '550e8400-e29b-41d4-a716-446655440001'::uuid,
    'quote_sent',
    '견적서를 발송했습니다',
    '마케팅 에이전시 B에게 브랜딩 패키지 디자인 견적서를 발송했습니다.',
    '660e8400-e29b-41d4-a716-446655440002'::uuid,
    NULL,
    NULL,
    '["in_app"]'::jsonb,
    NOW() - INTERVAL '2 days',
    NULL,
    NOW() - INTERVAL '2 days'
);

-- 박디자이너의 알림들
INSERT INTO public.notifications (
    id,
    user_id,
    type,
    title,
    message,
    quote_id,
    contract_id,
    payment_id,
    channels,
    sent_at,
    read_at,
    created_at
) VALUES 
-- 견적서 승인 알림
(
    'bb0e8400-e29b-41d4-a716-446655440005'::uuid,
    '550e8400-e29b-41d4-a716-446655440002'::uuid,
    'quote_approved',
    '견적서가 승인되었습니다',
    '한의원 E에서 의료진 홍보 브로슈어 견적서를 승인했습니다.',
    '660e8400-e29b-41d4-a716-446655440005'::uuid,
    NULL,
    NULL,
    '["in_app", "email"]'::jsonb,
    NOW() - INTERVAL '8 days',
    NOW() - INTERVAL '7 days',
    NOW() - INTERVAL '8 days'
),
-- 계약서 서명 알림
(
    'bb0e8400-e29b-41d4-a716-446655440006'::uuid,
    '550e8400-e29b-41d4-a716-446655440002'::uuid,
    'contract_signed',
    '계약서 서명이 완료되었습니다',
    '의료진 홍보 브로슈어 프로젝트 계약서 서명이 완료되었습니다.',
    '660e8400-e29b-41d4-a716-446655440005'::uuid,
    '770e8400-e29b-41d4-a716-446655440002'::uuid,
    NULL,
    '["in_app", "kakao_talk"]'::jsonb,
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '3 days'
),
-- 결제 완료 알림
(
    'bb0e8400-e29b-41d4-a716-446655440007'::uuid,
    '550e8400-e29b-41d4-a716-446655440002'::uuid,
    'payment_completed',
    '결제가 완료되었습니다',
    '의료진 홍보 브로슈어 프로젝트 대금 1,430,000원이 입금되었습니다.',
    '660e8400-e29b-41d4-a716-446655440005'::uuid,
    '770e8400-e29b-41d4-a716-446655440002'::uuid,
    '880e8400-e29b-41d4-a716-446655440002'::uuid,
    '["in_app", "email", "kakao_talk"]'::jsonb,
    NOW() - INTERVAL '1 day',
    NOW(),
    NOW() - INTERVAL '1 day'
),
-- 미읽은 알림
(
    'bb0e8400-e29b-41d4-a716-446655440008'::uuid,
    '550e8400-e29b-41d4-a716-446655440002'::uuid,
    'quote_sent',
    '견적서를 발송했습니다',
    '카페 브랜드 D에게 카페 브랜딩 디자인 견적서를 발송했습니다.',
    '660e8400-e29b-41d4-a716-446655440004'::uuid,
    NULL,
    NULL,
    '["in_app"]'::jsonb,
    NOW() - INTERVAL '6 hours',
    NULL,
    NOW() - INTERVAL '6 hours'
);
