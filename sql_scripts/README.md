# Supabase SQL Editor 실행 가이드

이 폴더의 SQL 스크립트들을 Supabase SQL Editor에서 **순서대로** 실행하여 견적서, 계약서, 결제관리, 세금계산서, 일정 데이터를 설정하세요.

## 실행 순서

### 1. 기본 스키마 (기존 파일)
먼저 기존 마이그레이션 파일들을 실행하세요:
```sql
-- supabase/migrations/001_initial_schema.sql
-- supabase/migrations/002_rls_policies.sql
-- supabase/migrations/003_kv_store.sql (필요시)
```

### 2. 추가 테이블 및 정책 (신규)
```sql
-- 001_additional_tables.sql
-- 세금계산서와 일정 테이블 추가

-- 002_rls_policies_additional.sql  
-- 추가 테이블의 RLS 정책 설정
```

### 3. 샘플 데이터 생성 (순서 중요)
```sql
-- 003_sample_users.sql
-- 데모 사용자 2명 생성

-- 004_sample_quotes.sql
-- 견적서 샘플 데이터 (5개)

-- 005_sample_contracts.sql
-- 계약서 샘플 데이터 (3개, 승인된 견적서 기반)

-- 006_sample_payments.sql
-- 결제 샘플 데이터 (6개, 계약서 기반)

-- 007_sample_tax_invoices.sql
-- 세금계산서 샘플 데이터 (4개, 결제 기반)

-- 008_sample_schedules.sql
-- 일정 샘플 데이터 (9개)

-- 009_sample_notifications.sql
-- 알림 샘플 데이터 (8개)
```

## 생성되는 데이터 개요

### 사용자 (2명)
- **김프리랜서** (freelancer@demo.com): 웹 개발자
- **박디자이너** (designer@demo.com): 그래픽 디자이너

### 견적서 (5개)
- 다양한 상태: draft(1), sent(2), approved(2)
- 웹사이트, 브랜딩, 디자인 프로젝트

### 계약서 (3개)
- 상태: completed(1), signed(1), sent(1)
- 승인된 견적서를 기반으로 생성

### 결제 (6개)
- 상태: completed(5), pending(1)
- 이번 달 매출 통계용 데이터 포함

### 세금계산서 (4개)
- 상태: confirmed(2), sent(1), draft(1)
- 완료된 결제에 대한 세금계산서

### 일정 (9개)
- 타입: task(4), meeting(2), deadline(1), presentation(2), launch(1)
- 우선순위: high(4), medium(4), low(1)
- 완료/미완료 상태 포함

### 알림 (8개)
- 견적서 승인, 계약서 서명, 결제 완료 등
- 읽음/미읽음 상태 포함

## 실행 후 확인사항

실행 완료 후 다음 쿼리로 데이터를 확인하세요:

```sql
-- 사용자별 통계
SELECT 
    u.name,
    COUNT(DISTINCT q.id) as total_quotes,
    COUNT(DISTINCT c.id) as total_contracts,
    COUNT(DISTINCT p.id) as total_payments,
    SUM(CASE WHEN p.status = 'completed' AND p.paid_at >= date_trunc('month', CURRENT_DATE) THEN p.amount ELSE 0 END) as monthly_revenue
FROM users u
LEFT JOIN quotes q ON u.id = q.user_id
LEFT JOIN contracts c ON u.id = c.user_id
LEFT JOIN payments p ON u.id = p.user_id
GROUP BY u.id, u.name;

-- 워크플로우 현황
SELECT 
    'quotes_sent' as step, COUNT(*) as count FROM quotes WHERE status = 'sent'
UNION ALL
SELECT 'contracts_pending', COUNT(*) FROM contracts WHERE status = 'draft'
UNION ALL
SELECT 'contracts_awaiting_signature', COUNT(*) FROM contracts WHERE status = 'sent'
UNION ALL
SELECT 'payments_pending', COUNT(*) FROM payments WHERE status = 'pending'
UNION ALL
SELECT 'contracts_completed', COUNT(*) FROM contracts WHERE status = 'completed';
```

## 주의사항

1. **순서 준수**: 반드시 번호 순서대로 실행하세요 (외래키 의존성)
2. **사용자 ID**: 샘플 데이터는 고정된 UUID를 사용합니다
3. **날짜 기준**: 현재 날짜를 기준으로 과거/미래 데이터가 생성됩니다
4. **RLS 정책**: 각 사용자는 자신의 데이터만 조회 가능합니다

## 데이터 초기화

샘플 데이터를 삭제하고 다시 시작하려면:

```sql
-- 샘플 데이터 삭제 (역순)
DELETE FROM notifications;
DELETE FROM schedules;
DELETE FROM tax_invoices;
DELETE FROM payments;
DELETE FROM contracts;
DELETE FROM quotes;
DELETE FROM users WHERE email LIKE '%@demo.com';

-- 시퀀스 초기화
ALTER SEQUENCE tax_invoice_number_seq RESTART WITH 1;
```
