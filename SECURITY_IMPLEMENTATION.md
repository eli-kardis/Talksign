# Security Implementation Guide

이 문서는 TalkSign 애플리케이션에 구현된 보안 기능들을 설명합니다.

## ✅ 구현 완료된 보안 기능

### 1. Rate Limiting (속도 제한)

**목적**: API 남용 및 스팸 공격 방지

**구현 위치**: `/src/lib/rate-limit.ts`

**적용된 엔드포인트**:
- 모든 API 라우트 (`/api/**`)
- 특별히 PDF 생성은 더 높은 제한 (20 req/min)
- KakaoTalk API는 더 엄격한 제한 (5 req/min)

**제한 설정**:
```typescript
{
  DEFAULT: 10 req/min,           // 일반 API
  AUTH: 5 req/min,               // 인증 엔드포인트
  KAKAO_TALK: 5 req/min,         // 카카오톡 API
  FILE_OPERATIONS: 20 req/min    // PDF 생성
}
```

**응답 헤더**:
- `X-RateLimit-Limit`: 최대 요청 수
- `X-RateLimit-Remaining`: 남은 요청 수
- `X-RateLimit-Reset`: 리셋 시간 (Unix timestamp)
- `Retry-After`: 제한 초과 시 재시도 대기 시간 (초)

**사용 예시**:
```typescript
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'

// API 라우트에서
const rateLimitError = checkRateLimit(userId, RATE_LIMITS.DEFAULT)
if (rateLimitError) {
  return rateLimitError // 429 Too Many Requests
}
```

### 2. Audit Logging (감사 로깅)

**목적**: 모든 CUD 작업 추적 및 규정 준수

**구현 위치**: `/src/lib/audit-log.ts`

**데이터베이스 마이그레이션**: `/_supabase/migrations/003_audit_logs.sql`

**로깅되는 작업**:
- `create`: 리소스 생성
- `update`: 리소스 수정
- `delete`: 리소스 삭제
- `export`: PDF 다운로드 등 민감한 작업
- `send`: 카카오톡 발송
- `sign`: 계약서 서명

**로깅되는 리소스**:
- `quote` (견적서)
- `contract` (계약서)
- `payment` (결제)
- `tax_invoice` (세금계산서)
- `customer` (고객)
- `schedule` (일정)
- `user` (사용자)
- `notification` (알림)

**로그 데이터 구조**:
```typescript
{
  user_id: string,           // 사용자 ID
  action: AuditAction,       // 작업 유형
  resource_type: string,     // 리소스 타입
  resource_id: string,       // 리소스 ID
  changes: {                 // 변경 내용
    old?: any,               // 이전 값 (업데이트 시)
    new?: any,               // 새로운 값
    deleted?: any            // 삭제된 값
  },
  metadata: {                // 메타데이터
    ip: string,              // IP 주소
    user_agent: string,      // User Agent
    timestamp: string        // 타임스탬프
  },
  status: 'success' | 'failure',
  error_message?: string
}
```

**사용 예시**:
```typescript
import { logCreate, logDelete, logSensitiveOperation, extractMetadata } from '@/lib/audit-log'

// 생성 로그
await logCreate(userId, 'contract', contractId, contractData, extractMetadata(request))

// 삭제 로그
await logDelete(userId, 'quote', quoteId, quoteData, extractMetadata(request))

// 민감한 작업 로그 (PDF 다운로드 등)
await logSensitiveOperation(userId, 'export', 'quote', quoteId, {
  ...extractMetadata(request),
  export_type: 'pdf'
})
```

**RLS 정책**:
- ✅ 사용자는 자신의 로그만 조회 가능
- ✅ Service Role만 로그 삽입 가능
- ✅ 로그는 불변 (수정/삭제 불가)

### 3. 개발/프로덕션 환경 분리

**데모 유저 처리**:
- 개발 환경: 데모 유저 자동 생성/사용
- 프로덕션 환경: 인증 실패 시 401 Unauthorized 반환

**Audit Logging**:
- 개발 환경: 콘솔에만 출력 (DB에 저장 안 함)
- 프로덕션 환경: DB에 저장

**환경 변수**:
```bash
NODE_ENV=production           # 프로덕션 모드
ENABLE_AUDIT_LOGS=true        # 개발 환경에서도 감사 로그 활성화 (선택)
```

## 📋 보안 체크리스트

### ✅ 완료된 항목
- [x] Row Level Security (RLS) 정책 적용
- [x] JWT 토큰 검증
- [x] 사용자 인증 확인
- [x] Rate Limiting 구현
- [x] Audit Logging 구현
- [x] 개발/프로덕션 환경 분리
- [x] 서비스 키 대신 사용자 클라이언트 사용
- [x] 민감한 작업 로깅

### 🔄 진행 중
- [ ] PDF 한글 폰트 지원 개선
- [ ] KakaoTalk API 통합

### ⏳ 향후 계획 (선택)
- [ ] CORS 설정
- [ ] CSP 헤더
- [ ] Public 정책 보안 강화

## 🚀 배포 전 체크리스트

1. **환경 변수 확인**
   ```bash
   NODE_ENV=production
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

2. **데이터베이스 마이그레이션 실행**
   ```bash
   # Supabase CLI 사용
   supabase db push

   # 또는 직접 SQL 실행
   # 003_audit_logs.sql 실행
   ```

3. **Rate Limiting 모니터링**
   - 응답 헤더에서 `X-RateLimit-*` 헤더 확인
   - 429 에러 발생 빈도 모니터링

4. **Audit Logs 확인**
   ```sql
   SELECT * FROM audit_logs
   WHERE user_id = 'user-id'
   ORDER BY timestamp DESC
   LIMIT 100;
   ```

## 📊 보안 점수

**현재 점수: 90/100**

| 항목 | 상태 | 점수 |
|-----|------|------|
| RLS 정책 | ✅ | 20/20 |
| API 인증 | ✅ | 20/20 |
| 데이터 격리 | ✅ | 20/20 |
| Rate Limiting | ✅ | 15/15 |
| Audit Logging | ✅ | 15/15 |
| CORS 설정 | ⏳ | 0/2 |
| CSP 헤더 | ⏳ | 0/1 |
| Public 정책 강화 | ⏳ | 0/3 |
| Demo User 분리 | ✅ | 0/4 |

**100점 달성을 위한 남은 작업**:
1. CORS 설정 (30분, +2점)
2. CSP 헤더 추가 (30분, +1점)
3. Public 정책 토큰 검증 (1일, +3점)

## 🔒 비상 대응

**Rate Limit 초과 시**:
```typescript
// 특정 사용자 제한 완화 (긴급 시)
const result = rateLimit(userId, {
  interval: 60 * 1000,
  maxRequests: 100  // 임시로 증가
})
```

**Audit Log 장애 시**:
- Audit logging은 메인 로직을 방해하지 않음
- 로그 실패 시에도 API 요청은 정상 처리
- 에러 로그는 콘솔에 기록됨

## 📚 참고 자료

- [Supabase RLS 문서](https://supabase.com/docs/guides/auth/row-level-security)
- [Rate Limiting 베스트 프랙티스](https://www.cloudflare.com/learning/bots/what-is-rate-limiting/)
- [Audit Logging 가이드](https://www.mezmo.com/learn-log-management/audit-logging-best-practices)
