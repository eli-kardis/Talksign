import React from 'react';
import { FileText, Mail, Phone, MapPin, MessageSquare, Github, Twitter } from 'lucide-react';

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
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary-foreground" />
              </div>
              <h3 className="font-medium text-foreground">Link Flow</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              견적서 작성부터 계약, 결제까지<br />
              프리랜서·1인 사업자를 위한<br />
              올인원 솔루션
            </p>
            <div className="flex items-center gap-4">
              <a 
                href="#" 
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Github"
              >
                <Github className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="KakaoTalk"
              >
                <MessageSquare className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="font-medium text-foreground">고객지원</h3>
            <ul className="space-y-2 text-sm">
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
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  API 문서
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-medium text-foreground">연락처</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                <a href="mailto:support@freelancer-allinone.com" className="text-muted-foreground hover:text-primary transition-colors">
                  support@freelancer-allinone.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                <a href="tel:1588-0000" className="text-muted-foreground hover:text-primary transition-colors">
                  1588-0000
                </a>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground">
                  서울시 강남구 테헤란로 123<br />
                  프리랜서타워 10층
                </span>
              </div>
              <div className="text-muted-foreground">
                평일 09:00 - 18:00<br />
                (토요일, 일요일, 공휴일 휴무)
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-muted-foreground">
              <span>© 2024 Link Flow. All rights reserved.</span>
              <div className="flex items-center gap-4">
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
                <a href="#" className="hover:text-primary transition-colors">
                  전자금융거래약관
                </a>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <span>사업자등록번호: 123-45-67890</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
