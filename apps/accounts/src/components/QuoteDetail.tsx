import React from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ArrowLeft, Edit, Download, FileText, Calendar, User, Building, Phone, Mail, MapPin } from 'lucide-react';

interface QuoteDetailProps {
  quoteId: number | null;
  onBack: () => void;
  onEdit: () => void;
}

// Mock quote data
const mockQuote = {
  id: 1,
  quoteNumber: 'QUO-2024-001',
  title: '웹사이트 리뉴얼 프로젝트',
  status: '승인됨',
  client: {
    name: '김고객',
    company: '(주)스타트업에이',
    businessNumber: '123-45-67890',
    phone: '010-1234-5678',
    email: 'client@startup-a.com',
    address: '서울시 강남구 테헤란로 123, 4층'
  },
  freelancer: {
    name: '김프리',
    company: '김프리 스튜디오',
    businessNumber: '987-65-43210',
    phone: '010-9876-5432',
    email: 'freelancer@kimfree.com',
    address: '서울시 서초구 강남대로 456, 2층'
  },
  project: {
    description: '기존 웹사이트의 UI/UX 개선 및 반응형 웹사이트 구축 프로젝트입니다.',
    dueDate: '2024-03-31'
  },
  items: [
    { id: 1, description: '웹사이트 디자인 (PC/모바일)', quantity: 1, unitPrice: 1500000, amount: 1500000 },
    { id: 2, description: '퍼블리싱 및 프론트엔드 개발', quantity: 1, unitPrice: 1200000, amount: 1200000 },
    { id: 3, description: 'SEO 최적화', quantity: 1, unitPrice: 300000, amount: 300000 }
  ],
  createdDate: '2024-01-15',
  validUntil: '2024-02-15',
  approvedDate: '2024-01-18'
};

export function QuoteDetail({ quoteId, onBack, onEdit }: QuoteDetailProps) {
  if (!quoteId) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack} className="border-border">
            <ArrowLeft className="w-4 h-4 mr-2" />
            돌아가기
          </Button>
          <div>
            <h2 className="text-2xl font-medium text-foreground">견적서를 찾을 수 없습니다</h2>
          </div>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      "승인됨": "bg-primary/20 text-primary",
      "대기중": "bg-secondary text-secondary-foreground",
      "계약 진행중": "bg-accent text-accent-foreground",
      "거절됨": "bg-destructive/20 text-destructive"
    };
    return variants[status as keyof typeof variants] || "bg-muted text-muted-foreground";
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount) + '원';
  };

  const totalAmount = mockQuote.items.reduce((sum, item) => sum + item.amount, 0);
  const vatAmount = Math.floor(totalAmount * 0.1);
  const finalAmount = totalAmount + vatAmount;

  const handleDownload = () => {
    alert('견적서 PDF 다운로드 기능은 실제 서비스에서 구현됩니다.');
  };

  const handleCreateContract = () => {
    alert('계약서 작성 기능은 실제 서비스에서 구현됩니다.');
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack} className="border-border">
            <ArrowLeft className="w-4 h-4 mr-2" />
            돌아가기
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl md:text-2xl font-medium text-foreground">{mockQuote.title}</h2>
              <Badge className={getStatusBadge(mockQuote.status)}>
                {mockQuote.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">견적서 번호: {mockQuote.quoteNumber}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <Button onClick={onEdit} className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs md:text-sm">
            <Edit className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">수정</span>
          </Button>
          <Button variant="outline" onClick={handleDownload} className="border-border text-xs md:text-sm">
            <Download className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">다운로드</span>
          </Button>
          <Button variant="outline" onClick={handleCreateContract} className="border-border text-xs md:text-sm">
            <FileText className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">계약서 작성</span>
          </Button>
        </div>
      </div>

      {/* Quote Content */}
      <div className="max-w-4xl mx-auto">
        {/* Quote Header */}
        <Card className="p-6 md:p-8 mb-4 md:mb-6 bg-card border-border">
          <div className="text-center mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-medium text-foreground mb-2">견적서</h1>
            <p className="text-base md:text-lg text-muted-foreground">QUOTATION</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            {/* Client Information */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-primary" />
                <h3 className="font-medium text-foreground">받는 분 (고객)</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground font-medium">{mockQuote.client.company}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">{mockQuote.client.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">{mockQuote.client.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground break-all">{mockQuote.client.email}</span>
                </div>
              </div>
            </div>

            {/* Freelancer Information */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Building className="w-5 h-5 text-primary" />
                <h3 className="font-medium text-foreground">보내는 분 (수행자)</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground font-medium">{mockQuote.freelancer.company}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">{mockQuote.freelancer.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">{mockQuote.freelancer.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground break-all">{mockQuote.freelancer.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quote Info */}
          <div className="mt-6 md:mt-8 pt-6 border-t border-border">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">작성일</p>
                <p className="text-foreground font-medium">{mockQuote.createdDate}</p>
              </div>
              <div>
                <p className="text-muted-foreground">유효기한</p>
                <p className="text-foreground font-medium">{mockQuote.validUntil}</p>
              </div>
              {mockQuote.approvedDate && (
                <div>
                  <p className="text-muted-foreground">승인일</p>
                  <p className="text-primary font-medium">{mockQuote.approvedDate}</p>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Quote Items */}
        <Card className="p-4 md:p-6 mb-4 md:mb-6 bg-card border-border">
          <h3 className="font-medium mb-4 text-foreground">견적 상세</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 text-sm font-medium text-muted-foreground">항목</th>
                  <th className="text-center py-3 text-sm font-medium text-muted-foreground w-16 md:w-20">수량</th>
                  <th className="text-right py-3 text-sm font-medium text-muted-foreground w-24 md:w-32">단가</th>
                  <th className="text-right py-3 text-sm font-medium text-muted-foreground w-24 md:w-32">금액</th>
                </tr>
              </thead>
              <tbody>
                {mockQuote.items.map((item, index) => (
                  <tr key={item.id} className={index % 2 === 0 ? 'bg-secondary' : 'bg-background'}>
                    <td className="py-3 md:py-4 text-foreground text-sm md:text-base pr-2">{item.description}</td>
                    <td className="py-3 md:py-4 text-center text-foreground text-sm md:text-base">{item.quantity}</td>
                    <td className="py-3 md:py-4 text-right text-foreground font-mono text-sm md:text-base">{formatCurrency(item.unitPrice)}</td>
                    <td className="py-3 md:py-4 text-right text-foreground font-medium font-mono text-sm md:text-base">{formatCurrency(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 md:mt-6 pt-4 border-t border-border">
            <div className="flex flex-col gap-2 max-w-xs ml-auto">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">소계</span>
                <span className="text-foreground font-mono">{formatCurrency(totalAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">부가세 (10%)</span>
                <span className="text-foreground font-mono">{formatCurrency(vatAmount)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium">
                <span className="text-foreground">총 금액</span>
                <span className="text-lg text-primary font-mono">{formatCurrency(finalAmount)}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <Card className="p-4 md:p-6 bg-accent">
          <div className="text-center">
            <p className="text-sm text-accent-foreground mb-2">
              본 견적서는 {mockQuote.validUntil}까지 유효합니다.
            </p>
            <p className="text-sm text-accent-foreground">
              견적서 관련 문의사항이 있으시면 언제든지 연락해 주세요.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
