-- RLS 정책 확인 및 수정 스크립트
-- Supabase Dashboard > SQL Editor에서 실행하세요

-- 1. 현재 customers 테이블의 RLS 정책 확인
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'customers'
ORDER BY policyname;

-- 2. customers 테이블에 user_id 컬럼이 있는지 확인
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'customers'
AND column_name = 'user_id';

-- 3. RLS가 활성화되어 있는지 확인
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'customers';

-- 4. 기존 잘못된 정책들 삭제
DROP POLICY IF EXISTS "Users can view all customers" ON customers;
DROP POLICY IF EXISTS "Users can insert customers" ON customers;
DROP POLICY IF EXISTS "Users can update customers" ON customers;
DROP POLICY IF EXISTS "Users can delete customers" ON customers;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON customers;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON customers;

-- 5. user_id 컬럼 추가 (없는 경우에만)
ALTER TABLE customers ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 6. user_id를 NOT NULL로 설정하기 전에 기존 데이터 확인
SELECT COUNT(*) as total_customers,
       COUNT(user_id) as customers_with_user_id,
       COUNT(*) - COUNT(user_id) as customers_without_user_id
FROM customers;

-- 7. user_id가 null인 레코드가 있다면, 첫 번째 사용자로 할당
-- (실제 운영 환경에서는 각 고객의 실제 소유자를 확인하고 할당해야 함)
DO $$
DECLARE
    first_user_id UUID;
BEGIN
    -- 첫 번째 사용자 ID 가져오기
    SELECT id INTO first_user_id FROM auth.users LIMIT 1;

    IF first_user_id IS NOT NULL THEN
        -- user_id가 null인 customers에 첫 번째 사용자 ID 할당
        UPDATE customers
        SET user_id = first_user_id
        WHERE user_id IS NULL;

        RAISE NOTICE 'Updated customers without user_id to first user: %', first_user_id;
    ELSE
        RAISE NOTICE 'No users found in auth.users table';
    END IF;
END $$;

-- 8. user_id를 NOT NULL로 설정
ALTER TABLE customers ALTER COLUMN user_id SET NOT NULL;

-- 9. 올바른 RLS 정책 생성
CREATE POLICY "Users can view own customers" ON customers
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own customers" ON customers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own customers" ON customers
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own customers" ON customers
    FOR DELETE USING (auth.uid() = user_id);

-- 10. 인덱스 추가 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);

-- 11. RLS 활성화
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- 12. 최종 확인: 정책이 제대로 생성되었는지 확인
SELECT
    policyname,
    cmd as command,
    CASE
        WHEN qual IS NOT NULL THEN 'USING: ' || qual
        ELSE 'No USING clause'
    END as using_clause,
    CASE
        WHEN with_check IS NOT NULL THEN 'WITH CHECK: ' || with_check
        ELSE 'No WITH CHECK clause'
    END as with_check_clause
FROM pg_policies
WHERE tablename = 'customers'
ORDER BY policyname;

-- 13. 사용자별 고객 수 확인
SELECT
    u.email,
    COUNT(c.id) as customer_count
FROM auth.users u
LEFT JOIN customers c ON c.user_id = u.id
GROUP BY u.id, u.email
ORDER BY customer_count DESC;
