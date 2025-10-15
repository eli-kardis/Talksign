import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { FileText, ArrowLeft } from 'lucide-react';

interface TermsOfServiceProps {
  onNavigate: (view: string) => void;
  returnTo?: string;
}

export function TermsOfService({ onNavigate, returnTo = 'dashboard' }: TermsOfServiceProps) {
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
              <FileText className="w-5 h-5 text-primary-foreground" />
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
            <CardTitle className="text-2xl text-foreground">이용약관</CardTitle>
            <p className="text-muted-foreground">
              최종 업데이트: 2025년 8월 16일
            </p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none text-foreground">
            <div className="space-y-6">
              <section>
                <h3 className="text-lg font-medium text-foreground mb-3">제1조 (목적)</h3>
                <p className="text-foreground leading-relaxed">
                  이 약관은 톡싸인(이하 &ldquo;서비스&rdquo;)이 제공하는 견적서 작성, 계약서 관리, 결제 처리 등의 서비스 이용에 관한 기본적인 사항을 규정함을 목적으로 합니다.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-medium text-foreground mb-3">제2조 (정의)</h3>
                <div className="space-y-2">
                  <p className="text-foreground leading-relaxed">
                    1. &ldquo;서비스&rdquo;란 톡싸인이 제공하는 견적서 작성, 계약서 관리, 결제 처리, 세금계산서 발행 등의 통합 업무 관리 서비스를 의미합니다.
                  </p>
                  <p className="text-foreground leading-relaxed">
                    2. &ldquo;회원&rdquo;이란 본 약관에 동의하고 서비스에 가입하여 서비스를 이용하는 개인 또는 법인을 의미합니다.
                  </p>
                  <p className="text-foreground leading-relaxed">
                    3. &ldquo;계정&rdquo;이란 회원의 식별과 서비스 이용을 위해 회원이 설정한 문자와 숫자의 조합을 의미합니다.
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-medium text-foreground mb-3">제3조 (약관의 효력 및 변경)</h3>
                <div className="space-y-2">
                  <p className="text-foreground leading-relaxed">
                    1. 본 약관은 서비스 화면에 게시하거나 기타의 방법으로 회원에게 공지함으로써 효력을 발생합니다.
                  </p>
                  <p className="text-foreground leading-relaxed">
                    2. 회사는 필요한 경우 관련 법령을 위배하지 않는 범위에서 본 약관을 변경할 수 있으며, 변경된 약관은 공지 후 적용됩니다.
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-medium text-foreground mb-3">제4조 (서비스의 제공)</h3>
                <div className="space-y-2">
                  <p className="text-foreground leading-relaxed">
                    1. 견적서 작성 및 관리 서비스
                  </p>
                  <p className="text-foreground leading-relaxed">
                    2. 계약서 작성 및 전자서명 서비스
                  </p>
                  <p className="text-foreground leading-relaxed">
                    3. 결제 처리 및 관리 서비스
                  </p>
                  <p className="text-foreground leading-relaxed">
                    4. 세금계산서 발행 서비스
                  </p>
                  <p className="text-foreground leading-relaxed">
                    5. 업무 일정 관리 서비스
                  </p>
                  <p className="text-foreground leading-relaxed">
                    6. 카카오톡 알림톡 발송 서비스
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-medium text-foreground mb-3">제5조 (회원가입)</h3>
                <div className="space-y-2">
                  <p className="text-foreground leading-relaxed">
                    1. 회원가입은 서비스 이용 신청자가 본 약관에 동의한 후 회원가입 양식에 필요한 정보를 기입하여 신청합니다.
                  </p>
                  <p className="text-foreground leading-relaxed">
                    2. 회사는 회원가입 신청자의 신청에 대하여 서비스 이용을 승낙함을 원칙으로 합니다.
                  </p>
                  <p className="text-foreground leading-relaxed">
                    3. 회원은 가입 시 제공한 정보에 변경이 있는 경우 즉시 수정해야 합니다.
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-medium text-foreground mb-3">제6조 (회원의 의무)</h3>
                <div className="space-y-2">
                  <p className="text-foreground leading-relaxed">
                    1. 회원은 서비스 이용 시 본 약관과 관련 법령을 준수해야 합니다.
                  </p>
                  <p className="text-foreground leading-relaxed">
                    2. 회원은 타인의 권리를 침해하거나 불법적인 행위를 하지 않아야 합니다.
                  </p>
                  <p className="text-foreground leading-relaxed">
                    3. 회원은 서비스에 바이러스나 악성 코드를 유포하지 않아야 합니다.
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-medium text-foreground mb-3">제7조 (서비스 이용 제한)</h3>
                <div className="space-y-2">
                  <p className="text-foreground leading-relaxed">
                    1. 회사는 회원이 본 약관을 위반한 경우 서비스 이용을 제한할 수 있습니다.
                  </p>
                  <p className="text-foreground leading-relaxed">
                    2. 서비스 이용 제한은 경고, 일시정지, 영구정지 등의 방법으로 시행됩니다.
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-medium text-foreground mb-3">제8조 (개인정보 보호)</h3>
                <p className="text-foreground leading-relaxed">
                  회사는 관련 법령에 따라 회원의 개인정보를 보호하며, 개인정보의 수집, 이용, 제공 등에 관한 사항은 별도의 개인정보처리방침에 따릅니다.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-medium text-foreground mb-3">제9조 (손해배상)</h3>
                <p className="text-foreground leading-relaxed">
                  회사와 회원은 서비스 이용과 관련하여 고의 또는 중과실로 상대방에게 손해를 끼친 경우 그 손해를 배상할 책임이 있습니다.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-medium text-foreground mb-3">제10조 (면책조항)</h3>
                <div className="space-y-2">
                  <p className="text-foreground leading-relaxed">
                    1. 회사는 천재지변, 전쟁, 기간통신사업자의 서비스 중지 등 불가항력으로 인한 서비스 중단에 대해 책임을 지지 않습니다.
                  </p>
                  <p className="text-foreground leading-relaxed">
                    2. 회사는 회원의 귀책사유로 인한 서비스 이용 장애에 대해 책임을 지지 않습니다.
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-medium text-foreground mb-3">제11조 (분쟁해결)</h3>
                <p className="text-foreground leading-relaxed">
                  본 약관과 관련하여 분쟁이 발생한 경우, 회사의 본사 소재지를 관할하는 법원을 전속관할법원으로 합니다.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-medium text-foreground mb-3">부칙</h3>
                <p className="text-foreground leading-relaxed">
                  본 약관은 2025년 8월 16일부터 시행됩니다.
                </p>
              </section>
            </div>

            <div className="mt-8 pt-6 border-t border-border text-center">
              <p className="text-muted-foreground text-sm">
                문의사항이 있으시면 고객센터로 연락해 주세요.
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                이메일: support@freelancer-allinone.com
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
