-- 개발 테스트를 위해 quotes 테이블의 user_id를 NULL 허용으로 변경
ALTER TABLE public.quotes ALTER COLUMN user_id DROP NOT NULL;

-- FK 제약조건도 일시적으로 제거 (개발용)
ALTER TABLE public.quotes DROP CONSTRAINT quotes_user_id_fkey;
