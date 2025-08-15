# 프리톡페이 설정 가이드

## 🗄️ 데이터베이스 설정 (Supabase)

### 1. Supabase 프로젝트 생성

1. [Supabase Dashboard](https://supabase.com/dashboard)에 접속
2. "New project" 클릭
3. 프로젝트 이름: `linkflow` 또는 `freetalkpay`
4. 비밀번호 설정 및 지역 선택 (Asia Northeast - Seoul 권장)

### 2. 데이터베이스 마이그레이션 실행

Supabase Dashboard > SQL Editor에서 다음 파일들을 순서대로 실행:

1. `supabase/migrations/001_initial_schema.sql` - 기본 테이블 구조 생성
2. `supabase/migrations/002_rls_policies.sql` - Row Level Security 정책 설정

### 3. 환경 변수 설정

`.env.local` 파일에서 다음 값들을 Supabase 프로젝트 설정에서 가져와 설정:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

### 4. OAuth 프로바이더 설정

#### Google OAuth 설정
1. Supabase Dashboard > Authentication > Providers
2. Google 활성화
3. Google Cloud Console에서 OAuth 2.0 클라이언트 ID 생성
4. 클라이언트 ID와 시크릿을 Supabase에 입력
5. 리다이렉트 URL: `https://your-project-id.supabase.co/auth/v1/callback`

#### Kakao OAuth 설정 (선택사항)
1. Supabase Dashboard > Authentication > Providers
2. Kakao 프로바이더 활성화 (커스텀 설정 필요)
3. Kakao Developers에서 애플리케이션 등록
4. REST API 키와 시크릿 설정

## 🔧 데이터베이스 스키마

### 주요 테이블

#### 1. users (사용자)
- 프리랜서/클라이언트 구분
- 사업자 정보 포함
- Supabase Auth와 연동

#### 2. quotes (견적서)
- 견적 항목들 (JSONB)
- 자동 계산된 금액 필드들
- 상태 관리 (draft → sent → approved)

#### 3. contracts (계약서)
- 견적서와 1:1 관계
- 전자서명 데이터 저장
- 첨부파일 지원

#### 4. payments (결제)
- 계약서와 1:1 관계
- PG사 연동 정보
- 영수증/세금계산서 URL

#### 5. notifications (알림)
- 카카오톡 알림톡 연동
- 다채널 알림 지원
- 알림 이력 관리

### Row Level Security (RLS)

- 사용자별 데이터 격리
- 공개 링크 접근 제어
- 시스템 권한 분리

## 🔐 인증 시스템

### 지원 기능

- 이메일/비밀번호 인증
- Google OAuth
- Kakao OAuth (설정 필요)
- 자동 프로필 생성
- 세션 관리

### 사용법

```typescript
import { useAuth } from '@/contexts/AuthContext'

function MyComponent() {
  const { user, profile, signIn, signOut } = useAuth()
  
  // 인증 상태 확인
  if (!user) return <LoginPage />
  
  // 사용자 정보 사용
  return <div>안녕하세요, {profile?.name}님!</div>
}
```

## 🚦 다음 단계

1. **Supabase 프로젝트 생성 및 설정**
2. **OAuth 프로바이더 설정**
3. **실제 Supabase 연결 테스트**
4. **견적서 작성 기능 구현**
5. **계약서 및 전자서명 기능**
6. **결제 시스템 연동**
7. **카카오톡 알림톡 연동**

## 📝 주의사항

- 실제 Supabase 프로젝트 연결 전까지는 인증 기능이 작동하지 않음
- 환경 변수 설정 후 개발 서버 재시작 필요
- RLS 정책으로 인해 서비스 역할 키 필요한 작업들 있음

## 🔗 유용한 링크

- [Supabase 문서](https://supabase.com/docs)
- [Supabase Auth 가이드](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
