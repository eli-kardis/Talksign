import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { FileText, ArrowLeft, Shield } from 'lucide-react';

interface PrivacyPolicyProps {
  onNavigate: (view: string) => void;
  returnTo?: string;
}

export function PrivacyPolicy({ onNavigate, returnTo = 'dashboard' }: PrivacyPolicyProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background border-b border-border px-4 py-5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => onNavigate(returnTo)}
            className="flex items-center gap-2 text-foreground hover:bg-accent"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>돌아가기</span>
          </Button>
          
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-medium text-foreground">톡싸인</h1>
          </div>
          
          <div className="w-[100px]"></div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="border-border">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-foreground">개인정보처리방침</CardTitle>
            <p className="text-muted-foreground">
              최종 업데이트: 2025년 8월 16일
            </p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none text-foreground">
            <div className="space-y-6">
              <section>
                <h3 className="text-lg font-medium text-foreground mb-3">1. 개인정보의 처리목적</h3>
                <p className="text-foreground leading-relaxed mb-3">
                  톡싸인(이하 &ldquo;회사&rdquo;)은 다음의 목적을 위해 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 개인정보보호법 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
                </p>
                <div className="space-y-2">
                  <p className="text-foreground leading-relaxed">
                    1) 회원가입 및 관리: 회원 가입의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증, 회원자격 유지·관리
                  </p>
                  <p className="text-foreground leading-relaxed">
                    2) 서비스 제공: 견적서 작성, 계약서 관리, 결제 처리, 세금계산서 발행, 업무 일정 관리 서비스 제공
                  </p>
                  <p className="text-foreground leading-relaxed">
                    3) 고객 지원: 고객 문의 처리, 서비스 개선을 위한 의견 수렴
                  </p>
                  <p className="text-foreground leading-relaxed">
                    4) 마케팅 및 광고: 신규 서비스 안내, 이벤트 정보 제공 (선택 동의 시)
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-medium text-foreground mb-3">2. 개인정보의 처리 및 보유기간</h3>
                <div className="space-y-2">
                  <p className="text-foreground leading-relaxed">
                    1) 회사는 정보주체로부터 개인정보를 수집할 때 동의받은 개인정보 보유·이용기간 또는 법령에 따른 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.
                  </p>
                  <p className="text-foreground leading-relaxed">
                    2) 각각의 개인정보 처리 및 보유 기간은 다음과 같습니다:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li className="text-foreground leading-relaxed">회원가입 및 관리: 회원 탈퇴 시까지</li>
                    <li className="text-foreground leading-relaxed">서비스 제공: 서비스 이용계약 종료 후 5년</li>
                    <li className="text-foreground leading-relaxed">결제 정보: 전자상거래법에 따라 5년</li>
                    <li className="text-foreground leading-relaxed">세금계산서 관련 정보: 국세기본법에 따라 5년</li>
                  </ul>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-medium text-foreground mb-3">3. 처리하는 개인정보의 항목</h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-foreground mb-2">필수항목:</h4>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li className="text-foreground leading-relaxed">이름, 이메일주소, 전화번호</li>
                      <li className="text-foreground leading-relaxed">사업자명 (사업자인 경우)</li>
                      <li className="text-foreground leading-relaxed">서비스 이용 기록, 접속 로그, 쿠키, 접속 IP 정보</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-2">선택항목:</h4>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li className="text-foreground leading-relaxed">프로필 사진</li>
                      <li className="text-foreground leading-relaxed">마케팅 수신 동의 정보</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-medium text-foreground mb-3">4. 개인정보의 제3자 제공</h3>
                <div className="space-y-2">
                  <p className="text-foreground leading-relaxed">
                    회사는 원칙적으로 정보주체의 개인정보를 제3자에게 제공하지 않습니다. 다만, 다음의 경우에는 예외로 합니다:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li className="text-foreground leading-relaxed">정보주체가 사전에 동의한 경우</li>
                    <li className="text-foreground leading-relaxed">법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
                    <li className="text-foreground leading-relaxed">결제 처리를 위해 결제대행업체에 제공하는 경우 (최소한의 정보만 제공)</li>
                  </ul>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-medium text-foreground mb-3">5. 개인정보처리의 위탁</h3>
                <div className="space-y-2">
                  <p className="text-foreground leading-relaxed">
                    회사는 원활한 개인정보 업무처리를 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있습니다:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li className="text-foreground leading-relaxed">카카오톡 알림톡 발송: 카카오</li>
                    <li className="text-foreground leading-relaxed">클라우드 서비스 제공: Supabase</li>
                    <li className="text-foreground leading-relaxed">결제 처리: 각종 결제대행업체</li>
                  </ul>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-medium text-foreground mb-3">6. 정보주체의 권리·의무 및 행사방법</h3>
                <div className="space-y-2">
                  <p className="text-foreground leading-relaxed">
                    정보주체는 회사에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li className="text-foreground leading-relaxed">개인정보 처리현황 통지 요구</li>
                    <li className="text-foreground leading-relaxed">개인정보 열람 요구</li>
                    <li className="text-foreground leading-relaxed">개인정보 정정·삭제 요구</li>
                    <li className="text-foreground leading-relaxed">개인정보 처리정지 요구</li>
                  </ul>
                  <p className="text-foreground leading-relaxed">
                    위의 권리 행사는 개인정보보호법 시행령 제41조제1항에 따라 서면, 전자우편, 모사전송(FAX) 등을 통하여 하실 수 있으며 회사는 이에 대해 지체없이 조치하겠습니다.
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-medium text-foreground mb-3">7. 개인정보의 파기</h3>
                <div className="space-y-2">
                  <p className="text-foreground leading-relaxed">
                    회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.
                  </p>
                  <p className="text-foreground leading-relaxed">
                    파기의 절차 및 방법은 다음과 같습니다:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li className="text-foreground leading-relaxed">전자적 파일 형태: 복구 및 재생이 되지 않도록 안전하게 삭제</li>
                    <li className="text-foreground leading-relaxed">기타 기록물: 분쇄하거나 소각하여 파기</li>
                  </ul>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-medium text-foreground mb-3">8. 개인정보의 안전성 확보조치</h3>
                <div className="space-y-2">
                  <p className="text-foreground leading-relaxed">
                    회사는 개인정보보호법 제29조에 따라 다음과 같이 안전성 확보에 필요한 기술적/관리적 및 물리적 조치를 하고 있습니다:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li className="text-foreground leading-relaxed">정기적인 자체 감사 실시</li>
                    <li className="text-foreground leading-relaxed">개인정보 취급 직원의 최소화 및 교육</li>
                    <li className="text-foreground leading-relaxed">개인정보에 대한 접근 제한</li>
                    <li className="text-foreground leading-relaxed">개인정보를 저장하는 데이터베이스 시스템에 대한 접근권한의 부여·변경·말소를 통한 개인정보에 대한 접근통제</li>
                    <li className="text-foreground leading-relaxed">해킹이나 컴퓨터 바이러스 등에 의한 개인정보 유출 및 훼손을 막기 위한 보안프로그램 설치 및 갱신</li>
                  </ul>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-medium text-foreground mb-3">9. 개인정보 보호책임자</h3>
                <div className="space-y-2">
                  <p className="text-foreground leading-relaxed">
                    회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다:
                  </p>
                  <div className="bg-muted/20 p-4 rounded-lg">
                    <p className="text-foreground leading-relaxed">개인정보 보호책임자</p>
                    <p className="text-foreground leading-relaxed">이메일: privacy@freelancer-allinone.com</p>
                    <p className="text-foreground leading-relaxed">전화번호: 02-1234-5678</p>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-medium text-foreground mb-3">10. 개인정보 처리방침 변경</h3>
                <p className="text-foreground leading-relaxed">
                  이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-medium text-foreground mb-3">부칙</h3>
                <p className="text-foreground leading-relaxed">
                  본 방침은 2025년 8월 16일부터 시행됩니다.
                </p>
              </section>
            </div>

            <div className="mt-8 pt-6 border-t border-border text-center">
              <p className="text-muted-foreground text-sm">
                개인정보 처리와 관련하여 문의사항이 있으시면 아래로 연락해 주세요.
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                이메일: privacy@freelancer-allinone.com
              </p>
              <p className="text-muted-foreground text-sm">
                전화번호: 02-1234-5678
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
