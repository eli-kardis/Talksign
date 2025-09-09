-- ================================================
-- 안전한 다중 테넌트 정책 업데이트 for LinkFlow SaaS
-- ================================================

-- 1. customers 테이블에 user_id 필드가 없다면 추가
ALTER TABLE customers ADD COLUMN IF NOT EXISTS user_id UUID;

-- 2. user_id에 외래키 제약조건이 없다면 추가
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'customers' 
        AND constraint_name = 'customers_user_id_fkey'
    ) THEN
        ALTER TABLE customers 
        ADD CONSTRAINT customers_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;
END
$$;

-- 3. 기존 customers 데이터에 대한 user_id 설정 (NULL인 경우에만)
WITH first_user AS (
    SELECT id FROM public.users ORDER BY created_at LIMIT 1
)
UPDATE customers 
SET user_id = (SELECT id FROM first_user)
WHERE user_id IS NULL;

-- 4. user_id를 NOT NULL로 설정 (이미 NOT NULL이면 무시됨)
ALTER TABLE customers ALTER COLUMN user_id SET NOT NULL;

-- 5. customers 테이블 기존 잘못된 RLS 정책들 삭제
DROP POLICY IF EXISTS "Users can view all customers" ON customers;
DROP POLICY IF EXISTS "Users can insert customers" ON customers;
DROP POLICY IF EXISTS "Users can update customers" ON customers;
DROP POLICY IF EXISTS "Users can delete customers" ON customers;

-- 6. customers 테이블에 올바른 다중 테넌트 RLS 정책 생성 (IF NOT EXISTS 사용)
DO $$
BEGIN
    -- SELECT 정책
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'customers' 
        AND policyname = 'Users can view own customers'
    ) THEN
        CREATE POLICY "Users can view own customers" ON customers
            FOR SELECT USING (auth.uid() = user_id);
    END IF;

    -- INSERT 정책
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'customers' 
        AND policyname = 'Users can insert own customers'
    ) THEN
        CREATE POLICY "Users can insert own customers" ON customers
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    -- UPDATE 정책
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'customers' 
        AND policyname = 'Users can update own customers'
    ) THEN
        CREATE POLICY "Users can update own customers" ON customers
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;

    -- DELETE 정책
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'customers' 
        AND policyname = 'Users can delete own customers'
    ) THEN
        CREATE POLICY "Users can delete own customers" ON customers
            FOR DELETE USING (auth.uid() = user_id);
    END IF;
END
$$;

-- 7. customers 인덱스 추가 (없는 경우에만)
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);

-- 8. RLS 활성화 확인
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- 9. quotes와 contracts 테이블에 필요한 필드들 추가 (없는 경우에만)
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS client_business_number TEXT;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS client_address TEXT;

ALTER TABLE contracts ADD COLUMN IF NOT EXISTS client_name TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS client_email TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS client_phone TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS client_company TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS client_business_number TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS client_address TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS supplier_info JSONB DEFAULT '{}'::jsonb;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS project_description TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS project_start_date DATE;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS project_end_date DATE;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '[]'::jsonb;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS subtotal DECIMAL(12,2) DEFAULT 0;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(12,2) DEFAULT 0;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5,2) DEFAULT 10.0;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS total_amount DECIMAL(12,2) DEFAULT 0;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS contract_terms JSONB DEFAULT '[]'::jsonb;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS payment_terms TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS additional_payment_terms TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS contract_url TEXT DEFAULT '#';

-- 10. 모든 테이블의 RLS 활성화 확인
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 11. 다중 테넌트 상태 확인 뷰 생성/업데이트
CREATE OR REPLACE VIEW multitenant_status AS
SELECT 
    'customers' as table_name,
    COUNT(*) as total_records,
    COUNT(DISTINCT user_id) as unique_users,
    CASE 
        WHEN COUNT(DISTINCT user_id) > 1 THEN 'Multi-tenant Ready' 
        WHEN COUNT(DISTINCT user_id) = 1 THEN 'Single-tenant (ready for multi)'
        ELSE 'No data' 
    END as status
FROM customers
WHERE user_id IS NOT NULL

UNION ALL

SELECT 
    'quotes' as table_name,
    COUNT(*) as total_records,
    COUNT(DISTINCT user_id) as unique_users,
    CASE 
        WHEN COUNT(DISTINCT user_id) > 1 THEN 'Multi-tenant Ready' 
        WHEN COUNT(DISTINCT user_id) = 1 THEN 'Single-tenant (ready for multi)'
        ELSE 'No data' 
    END as status
FROM quotes
WHERE user_id IS NOT NULL

UNION ALL

SELECT 
    'contracts' as table_name,
    COUNT(*) as total_records,
    COUNT(DISTINCT user_id) as unique_users,
    CASE 
        WHEN COUNT(DISTINCT user_id) > 1 THEN 'Multi-tenant Ready' 
        WHEN COUNT(DISTINCT user_id) = 1 THEN 'Single-tenant (ready for multi)'
        ELSE 'No data' 
    END as status
FROM contracts
WHERE user_id IS NOT NULL;

-- 12. RLS 정책 상태 확인 뷰
CREATE OR REPLACE VIEW rls_policies_status AS
SELECT 
    schemaname,
    tablename,
    policyname,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('customers', 'quotes', 'contracts', 'payments', 'notifications')
ORDER BY tablename, policyname;

-- 완료 메시지
SELECT 'Safe multi-tenant structure update completed successfully!' as status,
       'Execute "SELECT * FROM multitenant_status;" to verify multi-tenant setup' as next_step,
       'Execute "SELECT * FROM rls_policies_status;" to verify RLS policies' as verification;