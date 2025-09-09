-- ================================================
-- 멀티테넌트 구조 수정 for LinkFlow
-- ================================================

-- 1. customers 테이블에 user_id 필드 추가
ALTER TABLE customers ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id) ON DELETE CASCADE;

-- 2. 기존 데이터에 대한 user_id 설정 (첫 번째 사용자로 임시 할당)
-- 실제 운영 환경에서는 데이터 소유자를 정확히 파악해야 합니다
WITH first_user AS (
    SELECT id FROM public.users ORDER BY created_at LIMIT 1
)
UPDATE customers 
SET user_id = (SELECT id FROM first_user)
WHERE user_id IS NULL;

-- 3. user_id를 NOT NULL로 변경
ALTER TABLE customers ALTER COLUMN user_id SET NOT NULL;

-- 4. customers 테이블에 RLS 활성화
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- 5. customers 테이블 RLS 정책 생성
CREATE POLICY "Users can view own customers" ON customers
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own customers" ON customers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own customers" ON customers
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own customers" ON customers
    FOR DELETE USING (auth.uid() = user_id);

-- 6. 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);

-- 7. updated_at 트리거가 이미 있는지 확인하고 없다면 생성
CREATE OR REPLACE FUNCTION update_customers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 기존 트리거 삭제 후 재생성
DROP TRIGGER IF EXISTS trigger_update_customers_updated_at ON customers;
CREATE TRIGGER trigger_update_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_customers_updated_at();

-- 완료 메시지
SELECT 'Multi-tenant structure for customers table applied successfully!' as status;