import React, { useState, useRef } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { CheckCircle, PenTool, FileText, User, Building, CreditCard, AlertCircle } from 'lucide-react';

interface ClientSignatureProps {
  onComplete: () => void;
}

export function ClientSignature({ onComplete }: ClientSignatureProps) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [signature, setSignature] = useState<string>('');
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Mock contract data
  const contractData = {
    id: 'CONTRACT-2024-001',
    title: '웹사이트 리뉴얼 프로젝트 용역계약서',
    client: {
      name: '김고객',
      company: '(주)스타트업에이',
      phone: '010-1234-5678'
    },
    freelancer: {
      name: '김프리',
      company: '김프리 스튜디오',
      phone: '010-9876-5432'
    },
    project: {
      title: '웹사이트 리뉴얼 프로젝트',
      amount: 3000000,
      startDate: '2024-02-01',
      endDate: '2024-03-31',
      paymentTerms: '착수금 50% / 완료 후 50%'
    },
    deliverables: [
      '반응형 웹사이트 디자인 및 구축',
      '관리자 페이지 개발',
      'SEO 최적화',
      '1개월 무상 A/S'
    ]
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount) + '원';
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let x, y;
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let x, y;
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0064FF';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      setSignature(canvas.toDataURL());
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignature('');
  };

  const handleComplete = () => {
    if (!signature || !agreedTerms || !agreedPrivacy) {
      alert('서명과 약관 동의를 모두 완료해주세요.');
      return;
    }

    // Mock contract signing completion
    alert('계약서 서명이 완료되었습니다! 결제 링크를 발송합니다.');
    onComplete();
  };

  const canSign = signature && agreedTerms && agreedPrivacy;

  return (
    <div className="min-h-screen bg-secondary p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-medium text-foreground">전자계약서 서명</h1>
              <p className="text-sm text-muted-foreground">계약서를 확인하고 서명해주세요</p>
            </div>
          </div>
          <Badge className="bg-accent text-accent-foreground">
            계약번호: {contractData.id}
          </Badge>
        </Card>

        {/* Contract Overview */}
        <Card className="p-6 bg-card border-border">
          <h2 className="text-lg font-medium mb-4 text-foreground">{contractData.title}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                <h3 className="font-medium text-foreground">발주자 정보</h3>
              </div>
              <div className="space-y-2 text-sm">
                <p><span className="text-muted-foreground">성명:</span> <span className="text-foreground">{contractData.client.name}</span></p>
                <p><span className="text-muted-foreground">회사:</span> <span className="text-foreground">{contractData.client.company}</span></p>
                <p><span className="text-muted-foreground">연락처:</span> <span className="text-foreground">{contractData.client.phone}</span></p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-primary" />
                <h3 className="font-medium text-foreground">수행자 정보</h3>
              </div>
              <div className="space-y-2 text-sm">
                <p><span className="text-muted-foreground">성명:</span> <span className="text-foreground">{contractData.freelancer.name}</span></p>
                <p><span className="text-muted-foreground">회사:</span> <span className="text-foreground">{contractData.freelancer.company}</span></p>
                <p><span className="text-muted-foreground">연락처:</span> <span className="text-foreground">{contractData.freelancer.phone}</span></p>
              </div>
            </div>
          </div>
        </Card>

        {/* Project Details */}
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-4 h-4 text-primary" />
            <h3 className="font-medium text-foreground">프로젝트 상세</h3>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">프로젝트명</p>
                <p className="text-foreground font-medium">{contractData.project.title}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">계약 금액</p>
                <p className="text-lg font-medium text-primary font-mono">{formatCurrency(contractData.project.amount)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">시작일</p>
                <p className="text-foreground">{contractData.project.startDate}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">완료일</p>
                <p className="text-foreground">{contractData.project.endDate}</p>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-2">결제 조건</p>
              <p className="text-foreground">{contractData.project.paymentTerms}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">납품물</p>
              <ul className="space-y-1">
                {contractData.deliverables.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-foreground">
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>

        {/* Terms Agreement */}
        <Card className="p-6 bg-card border-border">
          <h3 className="font-medium mb-4 text-foreground">약관 동의</h3>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Checkbox 
                id="terms" 
                checked={agreedTerms}
                onCheckedChange={(checked) => setAgreedTerms(checked as boolean)}
                className="mt-1"
              />
              <div className="flex-1">
                <label htmlFor="terms" className="text-sm text-foreground cursor-pointer">
                  <span className="font-medium">서비스 이용약관</span>에 동의합니다.
                </label>
                <p className="text-xs text-muted-foreground mt-1">
                  계약 조건, 납품 기준, 결제 조건 등에 동의합니다.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox 
                id="privacy" 
                checked={agreedPrivacy}
                onCheckedChange={(checked) => setAgreedPrivacy(checked as boolean)}
                className="mt-1"
              />
              <div className="flex-1">
                <label htmlFor="privacy" className="text-sm text-foreground cursor-pointer">
                  <span className="font-medium">개인정보처리방침</span>에 동의합니다.
                </label>
                <p className="text-xs text-muted-foreground mt-1">
                  계약 이행을 위한 개인정보 수집 및 처리에 동의합니다.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Digital Signature */}
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PenTool className="w-4 h-4 text-primary" />
              <h3 className="font-medium text-foreground">전자서명</h3>
            </div>
            <Button 
              variant="outline" 
              onClick={clearSignature}
              className="border-border"
              disabled={!signature}
            >
              다시 서명
            </Button>
          </div>
          
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={600}
              height={200}
              className="w-full h-32 border-2 border-dashed border-border rounded-lg cursor-crosshair bg-input-background"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
            {!signature && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className="text-muted-foreground text-sm">여기에 서명해주세요</p>
              </div>
            )}
          </div>
          
          <p className="text-xs text-muted-foreground mt-2">
            서명은 법적 효력을 가지며, 계약서 내용에 대한 동의를 의미합니다.
          </p>
        </Card>

        {/* Completion Button */}
        <Card className="p-6 bg-card border-border">
          <div className="space-y-4">
            {!canSign && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg">
                <AlertCircle className="w-4 h-4 text-destructive" />
                <p className="text-sm text-destructive">
                  서명과 약관 동의를 모두 완료해주세요.
                </p>
              </div>
            )}
            
            <Button 
              onClick={handleComplete}
              disabled={!canSign}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              계약서 서명 완료
            </Button>
            
            {canSign && (
              <div className="flex items-center gap-2 p-3 bg-accent rounded-lg">
                <CreditCard className="w-4 h-4 text-accent-foreground" />
                <p className="text-sm text-accent-foreground">
                  서명 완료 후 결제 링크가 자동으로 발송됩니다.
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
