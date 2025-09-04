-- 견적서 양식 개선을 위한 테이블 수정 SQL
-- 이 SQL을 Supabase SQL Editor에서 단계별로 실행하세요

-- 1. quotes 테이블에 새로운 필드 추가
ALTER TABLE public.quotes 
ADD COLUMN IF NOT EXISTS valid_until DATE,
ADD COLUMN IF NOT EXISTS supplier_info JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS client_business_number TEXT,
ADD COLUMN IF NOT EXISTS client_address TEXT,
ADD COLUMN IF NOT EXISTS due_date DATE,
ADD COLUMN IF NOT EXISTS notes TEXT;