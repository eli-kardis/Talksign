export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            TalkSign
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            프리랜서를 위한 견적, 전자계약, 결제 및 카카오톡 자동 리마인드 기능을 통합한 올인원 SaaS 서비스
          </p>
          <div className="space-x-4">
            <a
              href="https://talksign.co.kr/login"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-200"
            >
              로그인
            </a>
            <a
              href="https://talksign.co.kr/signup"
              className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-200"
            >
              무료로 시작하기
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}