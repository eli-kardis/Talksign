-- 001_additional_tables.sql
-- 세금계산서와 일정 관련 테이블 추가

-- 세금계산서 상태 타입 추가
CREATE TYPE tax_invoice_status AS ENUM ('draft', 'issued', 'sent', 'confirmed', 'cancelled');

-- 일정 타입 추가
CREATE TYPE schedule_type AS ENUM ('task', 'meeting', 'deadline', 'presentation', 'launch');
CREATE TYPE schedule_priority AS ENUM ('low', 'medium', 'high');

-- 세금계산서 테이블
CREATE TABLE public.tax_invoices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    payment_id UUID REFERENCES public.payments(id) ON DELETE CASCADE,
    
    -- 세금계산서 기본 정보
    invoice_number TEXT NOT NULL UNIQUE,
    issue_date DATE NOT NULL,
    supply_date DATE NOT NULL,
    
    -- 공급자 정보 (프리랜서)
    supplier_business_number TEXT NOT NULL,
    supplier_name TEXT NOT NULL,
    supplier_address TEXT NOT NULL,
    supplier_phone TEXT,
    supplier_email TEXT,
    
    -- 공급받는자 정보 (클라이언트)
    buyer_business_number TEXT,
    buyer_name TEXT NOT NULL,
    buyer_address TEXT,
    buyer_phone TEXT,
    buyer_email TEXT,
    
    -- 금액 정보
    supply_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(12,2) GENERATED ALWAYS AS (supply_amount + tax_amount) STORED,
    
    -- 품목 정보
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    
    -- 상태 및 메타데이터
    status tax_invoice_status DEFAULT 'draft',
    sent_at TIMESTAMP WITH TIME ZONE,
    confirmed_at TIMESTAMP WITH TIME ZONE,
    
    -- 첨부파일
    pdf_url TEXT,
    
    -- 메타데이터
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 일정 테이블
CREATE TABLE public.schedules (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    
    -- 일정 기본 정보
    title TEXT NOT NULL,
    description TEXT,
    
    -- 날짜 및 시간
    start_date DATE NOT NULL,
    start_time TIME,
    end_date DATE,
    end_time TIME,
    is_all_day BOOLEAN DEFAULT false,
    
    -- 일정 타입 및 우선순위
    type schedule_type DEFAULT 'task',
    priority schedule_priority DEFAULT 'medium',
    
    -- 관련 엔티티
    quote_id UUID REFERENCES public.quotes(id) ON DELETE SET NULL,
    contract_id UUID REFERENCES public.contracts(id) ON DELETE SET NULL,
    
    -- 반복 설정
    is_recurring BOOLEAN DEFAULT false,
    recurrence_rule JSONB, -- RRULE 형식
    
    -- 알림 설정
    reminder_minutes INTEGER[], -- [15, 60, 1440] = 15분, 1시간, 1일 전
    
    -- 완료 상태
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- 메타데이터
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 추가
CREATE INDEX idx_tax_invoices_user_id ON public.tax_invoices(user_id);
CREATE INDEX idx_tax_invoices_payment_id ON public.tax_invoices(payment_id);
CREATE INDEX idx_tax_invoices_status ON public.tax_invoices(status);
CREATE INDEX idx_tax_invoices_issue_date ON public.tax_invoices(issue_date DESC);

CREATE INDEX idx_schedules_user_id ON public.schedules(user_id);
CREATE INDEX idx_schedules_start_date ON public.schedules(start_date);
CREATE INDEX idx_schedules_type ON public.schedules(type);
CREATE INDEX idx_schedules_priority ON public.schedules(priority);
CREATE INDEX idx_schedules_is_completed ON public.schedules(is_completed);

-- 세금계산서 번호 시퀀스
CREATE SEQUENCE tax_invoice_number_seq START 1;

-- 자동 증분 함수
CREATE OR REPLACE FUNCTION generate_tax_invoice_number()
RETURNS TEXT AS $$
DECLARE
    current_year TEXT;
    next_number INTEGER;
BEGIN
    current_year := EXTRACT(YEAR FROM NOW())::TEXT;
    next_number := nextval('tax_invoice_number_seq');
    RETURN current_year || '-' || LPAD(next_number::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;
