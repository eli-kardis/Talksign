-- 003_sample_users.sql
-- 샘플 사용자 데이터 생성 (테스트용)

-- 데모 사용자 1 (프리랜서)
INSERT INTO public.users (
    id,
    email,
    name,
    phone,
    role,
    business_name,
    business_number,
    business_address,
    timezone
) VALUES (
    '550e8400-e29b-41d4-a716-446655440001'::uuid,
    'freelancer@demo.com',
    '김프리랜서',
    '010-1234-5678',
    'freelancer',
    '김프리랜서 스튜디오',
    '123-45-67890',
    '서울시 강남구 테헤란로 123',
    'Asia/Seoul'
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    phone = EXCLUDED.phone,
    business_name = EXCLUDED.business_name,
    business_number = EXCLUDED.business_number,
    business_address = EXCLUDED.business_address,
    updated_at = NOW();

-- 데모 사용자 2 (또 다른 프리랜서)
INSERT INTO public.users (
    id,
    email,
    name,
    phone,
    role,
    business_name,
    business_number,
    business_address,
    timezone
) VALUES (
    '550e8400-e29b-41d4-a716-446655440002'::uuid,
    'designer@demo.com',
    '박디자이너',
    '010-9876-5432',
    'freelancer',
    '박디자이너 디자인 스튜디오',
    '987-65-43210',
    '서울시 마포구 홍대입구 456',
    'Asia/Seoul'
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    phone = EXCLUDED.phone,
    business_name = EXCLUDED.business_name,
    business_number = EXCLUDED.business_number,
    business_address = EXCLUDED.business_address,
    updated_at = NOW();
