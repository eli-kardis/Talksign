-- 고객 데이터 유저별 분리 확인 스크립트
-- Supabase Dashboard > SQL Editor에서 실행하세요

-- 1. 사용자별 고객 수 확인
SELECT
    u.email,
    u.id as user_id,
    COUNT(c.id) as customer_count
FROM auth.users u
LEFT JOIN customers c ON c.user_id = u.id
GROUP BY u.id, u.email
ORDER BY customer_count DESC;

-- 2. user_id가 null인 고객이 있는지 확인
SELECT COUNT(*) as customers_without_user_id
FROM customers
WHERE user_id IS NULL;

-- 3. 각 고객의 소유자 정보 확인
SELECT
    c.id,
    c.company_name,
    c.user_id,
    u.email as owner_email,
    c.created_at
FROM customers c
LEFT JOIN auth.users u ON c.user_id = u.id
ORDER BY c.created_at DESC
LIMIT 20;

-- 4. RLS 정책이 활성화되어 있는지 확인
SELECT
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'customers';

-- 5. 현재 적용된 RLS 정책 목록
SELECT
    policyname,
    cmd as operation,
    qual as using_expression
FROM pg_policies
WHERE tablename = 'customers'
ORDER BY policyname;
