import React from 'react';

interface FooterProps {
  onNavigate?: (view: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const handlePrivacyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate('privacy');
    }
  };

  const handleTermsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate('terms');
    }
  };

  return (
    <footer className="bg-background border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Company Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <h3 className="font-medium text-foreground">TalkSign</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              견적서 작성부터 계약, 결제까지<br />
              프리랜서·1인 사업자를 위한 올인원 솔루션
            </p>
          </div>

          {/* Support */}
          <div className="space-y-3">
            <h3 className="font-medium text-foreground">고객지원</h3>
            <ul className="space-y-1.5 text-sm">
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  이용가이드
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  자주 묻는 질문
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  고객센터
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  요금안내
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h3 className="font-medium text-foreground">정보</h3>
            <div className="space-y-2 text-sm">
              <div className="text-muted-foreground">
                사업자등록번호: 613-31-11781
              </div>
              <div className="text-muted-foreground">
                <a href="mailto:dhtj123@naver.com" className="hover:text-primary transition-colors">
                  dhtj123@naver.com
                </a>
              </div>
              <div className="text-muted-foreground">
                <a href="tel:010-8398-1144" className="hover:text-primary transition-colors">
                  010-8398-1144
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-5 pt-4 border-t border-border">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm text-muted-foreground">
              <span>© 2025 Talkisign. All rights reserved.</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrivacyClick}
                  className="hover:text-primary transition-colors cursor-pointer bg-transparent border-none p-0 text-inherit"
                >
                  개인정보처리방침
                </button>
                <button
                  onClick={handleTermsClick}
                  className="hover:text-primary transition-colors cursor-pointer bg-transparent border-none p-0 text-inherit"
                >
                  이용약관
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </footer>
  );
}
