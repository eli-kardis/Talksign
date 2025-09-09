-- ================================================
-- 완전한 다중 테넌트 구조 수정 for LinkFlow SaaS
-- ================================================

-- 1. customers 테이블에 user_id 필드 추가 (없는 경우에만)
ALTER TABLE customers ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id) ON DELETE CASCADE;

-- 2. 기존 customers 데이터에 대한 user_id 설정 (첫 번째 사용자로 임시 할당)
-- 실제 운영 환경에서는 데이터 소유자를 정확히 파악해야 합니다
WITH first_user AS (
    SELECT id FROM public.users ORDER BY created_at LIMIT 1
)
UPDATE customers 
SET user_id = (SELECT id FROM first_user)
WHERE user_id IS NULL;

-- 3. user_id를 NOT NULL로 변경
ALTER TABLE customers ALTER COLUMN user_id SET NOT NULL;

-- 4. customers 테이블 기존 RLS 정책 삭제 (잘못된 정책들)
DROP POLICY IF EXISTS "Users can view all customers" ON customers;
DROP POLICY IF EXISTS "Users can insert customers" ON customers;
DROP POLICY IF EXISTS "Users can update customers" ON customers;
DROP POLICY IF EXISTS "Users can delete customers" ON customers;

-- 5. customers 테이블 새로운 다중 테넌트 RLS 정책 생성
CREATE POLICY "Users can view own customers" ON customers
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own customers" ON customers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own customers" ON customers
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own customers" ON customers
    FOR DELETE USING (auth.uid() = user_id);

-- 6. customers 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);

-- 7. quotes 테이블 누락된 필드 확인 및 추가
-- quotes 테이블에는 이미 user_id가 있지만, client 정보에 필요한 필드들 확인
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS client_business_number TEXT;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS client_address TEXT;

-- 8. contracts 테이블 누락된 필드 확인 및 추가
-- contracts 테이블에 client 정보 필드가 부족할 수 있음
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS client_name TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS client_email TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS client_phone TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS client_company TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS client_business_number TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS client_address TEXT;

-- 9. contracts 테이블의 더 완전한 구조
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

-- 10. 모든 테이블이 RLS가 활성화되어 있는지 확인
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 11. 시스템 확인을 위한 뷰 생성
CREATE OR REPLACE VIEW multitenant_status AS
SELECT 
    'customers' as table_name,
    COUNT(*) as total_records,
    COUNT(DISTINCT user_id) as unique_users,
    CASE WHEN COUNT(DISTINCT user_id) > 1 THEN 'Multi-tenant Ready' ELSE 'Single-tenant' END as status
FROM customers
WHERE user_id IS NOT NULL

UNION ALL

SELECT 
    'quotes' as table_name,
    COUNT(*) as total_records,
    COUNT(DISTINCT user_id) as unique_users,
    CASE WHEN COUNT(DISTINCT user_id) > 1 THEN 'Multi-tenant Ready' ELSE 'Single-tenant' END as status
FROM quotes
WHERE user_id IS NOT NULL

UNION ALL

SELECT 
    'contracts' as table_name,
    COUNT(*) as total_records,
    COUNT(DISTINCT user_id) as unique_users,
    CASE WHEN COUNT(DISTINCT user_id) > 1 THEN 'Multi-tenant Ready' ELSE 'Single-tenant' END as status
FROM contracts
WHERE user_id IS NOT NULL;

-- 12. RLS 정책 확인을 위한 뷰
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
SELECT 'Complete multi-tenant structure applied successfully!' as status,
       'Execute "SELECT * FROM multitenant_status;" to verify multi-tenant setup' as next_step,
       'Execute "SELECT * FROM rls_policies_status;" to verify RLS policies' as verification;