<<<<<<< HEAD
# 프리톡페이 (FreeTalkPay)

프리랜서와 1인 사업자를 위한 견적, 전자계약, 결제 및 카카오톡 자동 리마인드 기능을 통합한 올인원 SaaS 서비스입니다.

## 🚀 주요 기능

- **💰 견적서 작성 & 발송**: 항목별 금액 입력하면 실시간 합계 표시, 카카오톡으로 즉시 전송
- **📄 전자계약서**: 견적 정보 자동 반영, 모바일 최적화 화면에서 전자서명까지
- **💳 원클릭 결제**: 계약 완료 후 결제 링크 자동 발송, 카드/계좌 결제 지원
- **📱 카카오톡 알림**: 견적 승인, 계약 완료, 결제 완료 등 모든 단계별 자동 알림
- **🧾 세금계산서**: 결제 완료 후 세금계산서 자동 발행 및 알림
- **🔄 반복결제**: 정기 결제 스케줄 설정으로 월 단위 자동 리마인드

## 🛠 기술 스택

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase Edge Functions (Deno), Hono Framework
- **Database**: Supabase PostgreSQL + KV Store
- **Authentication**: Supabase Auth (이메일, Google, Kakao)
- **Payment**: 토스페이먼츠 / 아임포트
- **Notification**: 카카오톡 알림톡 API
- **Deployment**: Vercel (Frontend) + Supabase (Backend)
- **CI/CD**: GitHub Actions

## 📋 프로젝트 구조

```
linkflow/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── auth/               # 인증 관련 페이지
│   │   │   ├── callback/       # OAuth 콜백
│   │   │   ├── signin/         # 로그인 페이지
│   │   │   └── signup/         # 회원가입 페이지
│   │   ├── globals.css         # 글로벌 스타일
│   │   ├── layout.tsx          # 루트 레이아웃
│   │   └── page.tsx            # 메인 애플리케이션
│   ├── components/             # React 컴포넌트
│   │   └── ui/                 # shadcn/ui 컴포넌트
│   ├── contexts/               # React Context
│   │   └── AuthContext.tsx     # 인증 상태 관리
│   └── lib/                    # 유틸리티 및 설정
│       ├── api.ts              # API 호출 함수
│       ├── auth.ts             # 인증 유틸리티
│       ├── supabase.ts         # Supabase 클라이언트
│       └── utils.ts            # 공통 유틸리티
├── supabase/                   # Supabase 설정
│   ├── functions/              # Edge Functions
│   │   └── server/             # 백엔드 API
│   │       ├── index.tsx       # 메인 서버 로직
│   │       └── kv_store.tsx    # KV Store 인터페이스
│   ├── migrations/             # 데이터베이스 마이그레이션
│   └── config.toml             # Supabase 로컬 설정
├── ATTRIBUTIONS.md             # 라이브러리 저작권 정보
├── LICENSE                     # MIT 라이선스
├── .env.local.example          # 환경 변수 예시
├── components.json             # shadcn/ui 설정
├── vercel.json                 # Vercel 배포 설정
└── package.json                # 의존성 및 스크립트
```

## 🚀 시작하기

### 1. 프로젝트 클론

```bash
git clone [repository-url]
cd linkflow
```

### 2. 의존성 설치

```bash
npm install
```

### 3. Supabase 설정

```bash
# Supabase CLI 설치 (필요한 경우)
npm install -g supabase

# Supabase 로컬 환경 시작
supabase start

# 데이터베이스 마이그레이션 실행
supabase db reset
```

### 4. 환경 변수 설정

`.env.local.example` 파일을 참고하여 `.env.local` 파일을 생성:

```bash
cp .env.local.example .env.local
```

필수 환경 변수:
```bash
# Supabase Configuration (개발환경)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_local_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_local_service_role_key_here

# OAuth Provider Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
KAKAO_CLIENT_ID=your_kakao_client_id_here
KAKAO_CLIENT_SECRET=your_kakao_client_secret_here

# 프로덕션 환경에서는 환경 변수 없이도 작동 (supabase-info.ts 파일 사용)
# NEXT_PUBLIC_SUPABASE_URL=https://fwbkesioorqklhlcgmio.supabase.co (자동 설정됨)
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (자동 설정됨)
```

### 5. Edge Functions 배포

```bash
# Edge Functions를 로컬 Supabase에 배포
supabase functions deploy server

# 또는 개발 모드로 실행 (파일 변경 감지)
supabase functions serve server --no-verify-jwt
```

### 6. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 📦 빌드 및 배포

### 로컬 빌드

```bash
npm run build
npm run start
```

### Vercel 배포

1. **Vercel 계정 설정**
   ```bash
   # Vercel CLI 설치
   npm i -g vercel

   # 프로젝트를 Vercel에 배포
   vercel
   ```

2. **환경 변수 설정**

   Vercel 대시보드에서 다음 환경 변수들을 설정하세요:

   **필수 환경 변수:**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

   **선택적 환경 변수:**
   ```
   NEXT_PUBLIC_TOSS_CLIENT_KEY=your_toss_client_key
   TOSS_SECRET_KEY=your_toss_secret_key
   KAKAO_API_KEY=your_kakao_api_key
   KAKAO_SENDER_KEY=your_kakao_sender_key
   JWT_SECRET=your_jwt_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   KAKAO_CLIENT_ID=your_kakao_client_id
   KAKAO_CLIENT_SECRET=your_kakao_client_secret
   ```

3. **도메인 설정**
   - Vercel 대시보드에서 커스텀 도메인 연결 가능
   - SSL 인증서는 자동으로 생성됩니다

4. **배포 확인**
   - GitHub 저장소 연결 시 푸시마다 자동 배포
   - 프리뷰 배포도 자동으로 생성됩니다

## 🧪 개발 도구

```bash
# 타입 체크
npm run type-check

# 린트 검사
npm run lint

# 빌드 테스트
npm run build
```

## 📚 API 문서

### 주요 API 엔드포인트

**Edge Functions (백엔드 API)**
- `POST /auth/signup` - 회원가입
- `POST /auth/verify` - 사용자 인증 확인
- `POST /auth/social-complete` - 소셜 로그인 추가 정보
- `GET /user/profile` - 사용자 프로필 조회
- `POST /user/data/:type` - 사용자 데이터 저장
- `GET /user/data/:type` - 사용자 데이터 조회

**클라이언트 API 함수**
- `api.saveQuotes()` / `api.getQuotes()` - 견적서 관리
- `api.saveContracts()` / `api.getContracts()` - 계약서 관리
- `api.saveSchedules()` / `api.getSchedules()` - 일정 관리
- `api.saveFinancialData()` / `api.getFinancialData()` - 재무 데이터 관리

## 🔧 개발 환경 요구사항

- Node.js 18.x 이상
- npm 9.x 이상
- Supabase CLI 및 계정
- Docker (Supabase 로컬 환경용)
- 토스페이먼츠 또는 아임포트 계정 (결제 기능용)
- 카카오 개발자 계정 (알림톡 및 OAuth용)
- Google Cloud Console 계정 (Google OAuth용)

## 📄 라이센스

이 프로젝트는 MIT 라이센스 하에 배포됩니다. 자세한 내용은 [LICENSE](./LICENSE) 파일을 참조하세요.

## 📋 저작권 정보

사용된 라이브러리와 리소스에 대한 저작권 및 라이센스 정보는 [ATTRIBUTIONS.md](./ATTRIBUTIONS.md) 파일을 참조하세요.

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 등록해 주세요.
