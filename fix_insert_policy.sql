-- INSERT 정책의 WITH CHECK 확인 및 수정
-- Supabase Dashboard > SQL Editor에서 실행하세요

-- 1. 현재 INSERT 정책의 상세 정보 확인
SELECT
    policyname,
    cmd as operation,
    qual as using_clause,
    with_check as with_check_clause
FROM pg_policies
WHERE tablename = 'customers'
AND cmd = 'INSERT';

-- 2. INSERT 정책을 올바르게 재생성
DROP POLICY IF EXISTS "Users can insert own customers" ON customers;

CREATE POLICY "Users can insert own customers" ON customers
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 3. 재생성 후 확인
SELECT
    policyname,
    cmd as operation,
    qual as using_clause,
    with_check as with_check_clause
FROM pg_policies
WHERE tablename = 'customers'
AND cmd = 'INSERT';

-- 4. 모든 RLS 정책 확인
SELECT
    policyname,
    cmd as operation,
    CASE
        WHEN qual IS NOT NULL THEN qual
        ELSE 'NULL (정상 - INSERT는 USING 불필요)'
    END as using_clause,
    CASE
        WHEN with_check IS NOT NULL THEN with_check
        ELSE 'NULL (주의 - WITH CHECK 필요!)'
    END as with_check_clause
FROM pg_policies
WHERE tablename = 'customers'
ORDER BY cmd, policyname;
