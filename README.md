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

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Database**: Supabase
- **Payment**: 토스페이먼츠 / 아임포트
- **Notification**: 카카오톡 알림톡 API
- **Deployment**: Vercel
- **CI/CD**: GitHub Actions

## 📋 프로젝트 구조

```
linkflow/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── globals.css         # 글로벌 스타일
│   │   ├── layout.tsx          # 루트 레이아웃
│   │   └── page.tsx            # 메인 페이지
│   ├── components/             # React 컴포넌트
│   │   └── ui/                 # shadcn/ui 컴포넌트
│   └── lib/                    # 유틸리티 및 설정
│       ├── supabase.ts         # Supabase 클라이언트 설정
│       └── utils.ts            # 공통 유틸리티
├── .github/workflows/          # GitHub Actions 워크플로우
├── .env.local                  # 환경 변수 (개발용)
├── .env.example                # 환경 변수 예시
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

### 3. 환경 변수 설정

`.env.example` 파일을 참고하여 `.env.local` 파일을 생성하고 필요한 환경 변수를 설정하세요:

```bash
cp .env.example .env.local
```

필수 환경 변수:
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase 프로젝트 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase 익명 키
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase 서비스 역할 키
- `NEXT_PUBLIC_TOSS_CLIENT_KEY`: 토스페이먼츠 클라이언트 키
- `TOSS_SECRET_KEY`: 토스페이먼츠 시크릿 키
- `KAKAO_API_KEY`: 카카오 API 키
- `KAKAO_SENDER_KEY`: 카카오 발신자 키

### 4. 개발 서버 실행

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

1. Vercel 계정에 연결
2. 환경 변수 설정
3. GitHub 저장소 연결 시 자동 배포

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

- `/api/quotes` - 견적서 관리
- `/api/contracts` - 계약서 관리
- `/api/payments` - 결제 처리
- `/api/notifications` - 카카오톡 알림
- `/api/auth` - 사용자 인증

## 🔧 개발 환경 요구사항

- Node.js 18.x 이상
- npm 9.x 이상
- Supabase 계정
- 토스페이먼츠 또는 아임포트 계정
- 카카오 개발자 계정

## 📄 라이센스

이 프로젝트는 MIT 라이센스 하에 배포됩니다.

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 등록해 주세요.
