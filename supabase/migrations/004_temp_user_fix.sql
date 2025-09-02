-- 임시 개발용 사용자 생성 (FK 제약조건 해결)
INSERT INTO public.users (
    id,
    email,
    name,
    role,
    created_at,
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'temp@example.com',
    'Temp Development User',
    'freelancer',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- 이메일 unique 제약조건 해결을 위해 기존 사용자가 있으면 업데이트
INSERT INTO public.users (
    id,
    email,
    name,
    role,
    created_at,
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'temp@example.com',
    'Temp Development User',
    'freelancer',
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    id = EXCLUDED.id,
    name = EXCLUDED.name,
    updated_at = NOW();
