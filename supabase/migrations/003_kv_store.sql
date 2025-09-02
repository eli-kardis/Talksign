-- Link Flow KV Store 테이블 생성
-- 사용자 데이터, 견적서, 계약서, 일정 등을 저장하기 위한 키-값 저장소

CREATE TABLE IF NOT EXISTS kv_store_e83d4894 (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 업데이트 시간 자동 갱신을 위한 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 업데이트 시간 트리거 생성
CREATE TRIGGER update_kv_store_updated_at 
  BEFORE UPDATE ON kv_store_e83d4894 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_kv_store_key_prefix ON kv_store_e83d4894 USING btree (key text_pattern_ops);
CREATE INDEX IF NOT EXISTS idx_kv_store_created_at ON kv_store_e83d4894 (created_at);
CREATE INDEX IF NOT EXISTS idx_kv_store_updated_at ON kv_store_e83d4894 (updated_at);

-- RLS (Row Level Security) 정책
ALTER TABLE kv_store_e83d4894 ENABLE ROW LEVEL SECURITY;

-- 서비스 역할에 대한 모든 권한 허용 (Edge Function용)
CREATE POLICY "Service role can manage all kv_store data" ON kv_store_e83d4894
  FOR ALL USING (true)
  WITH CHECK (true);

-- 테이블 권한 설정
GRANT ALL ON kv_store_e83d4894 TO service_role;
GRANT ALL ON kv_store_e83d4894 TO postgres;
