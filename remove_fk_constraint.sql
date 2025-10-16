-- Foreign Key 제약 제거
-- Supabase Dashboard > SQL Editor에서 실행하세요

-- 1. 현재 제약 확인
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM
    information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name='users';

-- 2. Foreign Key 제약 제거
ALTER TABLE users
DROP CONSTRAINT IF EXISTS users_id_fkey;

-- 3. 제거 확인
SELECT
    tc.constraint_name,
    tc.table_name
FROM information_schema.table_constraints AS tc
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name='users';

-- 결과가 비어있으면 성공!
