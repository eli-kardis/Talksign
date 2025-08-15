import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">프리톡페이</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost">로그인</Button>
              <Button>회원가입</Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">프리랜서를 위한</span>
            <span className="block text-indigo-600">올인원 견적·계약·결제</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            견적서 작성부터 전자계약, 결제까지 한 번에 처리하고 카카오톡으로 자동 리마인드까지
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <Button size="lg" className="w-full sm:w-auto">
              지금 시작하기
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-20">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium text-gray-900">
                  💰 견적서 작성 & 발송
                </CardTitle>
                <CardDescription>
                  항목별 금액 입력하면 실시간 합계 표시, 카카오톡으로 즉시 전송
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium text-gray-900">
                  📄 전자계약서
                </CardTitle>
                <CardDescription>
                  견적 정보 자동 반영, 모바일 최적화 화면에서 전자서명까지
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium text-gray-900">
                  💳 원클릭 결제
                </CardTitle>
                <CardDescription>
                  계약 완료 후 결제 링크 자동 발송, 카드/계좌 결제 지원
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium text-gray-900">
                  📱 카카오톡 알림
                </CardTitle>
                <CardDescription>
                  견적 승인, 계약 완료, 결제 완료 등 모든 단계별 자동 알림
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium text-gray-900">
                  🧾 세금계산서
                </CardTitle>
                <CardDescription>
                  결제 완료 후 세금계산서 자동 발행 및 알림
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium text-gray-900">
                  🔄 반복결제
                </CardTitle>
                <CardDescription>
                  정기 결제 스케줄 설정으로 월 단위 자동 리마인드
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 bg-indigo-600 rounded-lg">
          <div className="px-6 py-12 sm:px-12 lg:px-16">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-white">
                지금 바로 시작해보세요
              </h2>
              <p className="mt-4 text-lg text-indigo-200">
                무료로 시작하고, 첫 번째 거래까지 완전 무료
              </p>
              <div className="mt-8">
                <Button size="lg" variant="secondary">
                  무료로 시작하기
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
