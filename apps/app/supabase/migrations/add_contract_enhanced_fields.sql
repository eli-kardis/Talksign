-- 계약서 테이블에 향상된 필드 추가
-- 1. 법적 필수 요소
-- 2. 결제 정보
-- 3. 계약 이행 조건
-- 4. 법적 보호 조항
-- 5. 추가 조항

-- 1. 법적 필수 요소
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS party_a_role VARCHAR(100);
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS party_b_role VARCHAR(100);
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS contract_copies INTEGER DEFAULT 2;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS party_a_representative VARCHAR(100);
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS party_b_representative VARCHAR(100);

-- 2. 결제 정보
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS down_payment_ratio NUMERIC(5,2);
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS interim_payment_ratio NUMERIC(5,2);
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS final_payment_ratio NUMERIC(5,2);
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS down_payment_date VARCHAR(50);
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS interim_payment_date VARCHAR(50);
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS final_payment_date VARCHAR(50);
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS bank_name VARCHAR(100);
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS bank_account_number VARCHAR(100);
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS bank_account_holder VARCHAR(100);

-- 3. 계약 이행 조건
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS delivery_conditions TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS delivery_location VARCHAR(255);
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS delivery_deadline VARCHAR(50);
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS warranty_period VARCHAR(100);
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS warranty_scope TEXT;

-- 4. 법적 보호 조항
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS nda_clause TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS termination_conditions TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS dispute_resolution VARCHAR(100);
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS jurisdiction_court VARCHAR(100);
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS force_majeure_clause TEXT;

-- 5. 추가 조항
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS renewal_conditions TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS amendment_procedure TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS assignment_prohibition TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS special_terms TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS penalty_clause TEXT;

-- 인덱스 추가 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_contracts_party_a_representative ON contracts(party_a_representative);
CREATE INDEX IF NOT EXISTS idx_contracts_party_b_representative ON contracts(party_b_representative);
CREATE INDEX IF NOT EXISTS idx_contracts_delivery_deadline ON contracts(delivery_deadline);

-- 주석 추가
COMMENT ON COLUMN contracts.party_a_role IS '계약 당사자 "갑"의 역할/명칭';
COMMENT ON COLUMN contracts.party_b_role IS '계약 당사자 "을"의 역할/명칭';
COMMENT ON COLUMN contracts.contract_copies IS '계약서 작성 통수';
COMMENT ON COLUMN contracts.down_payment_ratio IS '선금 비율 (%)';
COMMENT ON COLUMN contracts.interim_payment_ratio IS '중도금 비율 (%)';
COMMENT ON COLUMN contracts.final_payment_ratio IS '잔금 비율 (%)';
COMMENT ON COLUMN contracts.payment_method IS '대금 지급 방법';
COMMENT ON COLUMN contracts.delivery_conditions IS '인도/납품 조건';
COMMENT ON COLUMN contracts.warranty_period IS '하자보증 기간';
COMMENT ON COLUMN contracts.nda_clause IS '비밀유지 조항 (NDA)';
COMMENT ON COLUMN contracts.termination_conditions IS '계약 해지 조건';
COMMENT ON COLUMN contracts.dispute_resolution IS '분쟁 해결 방법';
COMMENT ON COLUMN contracts.force_majeure_clause IS '불가항력 조항';
COMMENT ON COLUMN contracts.renewal_conditions IS '계약 갱신 조건';
COMMENT ON COLUMN contracts.amendment_procedure IS '계약 변경/수정 절차';
COMMENT ON COLUMN contracts.assignment_prohibition IS '권리/의무 양도 금지';
