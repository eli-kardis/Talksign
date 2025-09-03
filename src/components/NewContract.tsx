import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ArrowLeft, MessageSquare, Save, User, Building } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { formatPhoneNumber, formatBusinessNumber } from '@/lib/formatters';

interface NewContractProps {
  onNavigate: (view: string) => void;
}

export function NewContract({ onNavigate }: NewContractProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const [supplierInfo, setSupplierInfo] = useState({
    name: '',
    email: '',
    phone: '',
    businessRegistrationNumber: '',
    companyName: '',
    businessName: '',
  });

  const [contractInfo, setContractInfo] = useState({
    title: '',
    startDate: '',
    endDate: '',
    paymentTerms: '',
    deliverables: '',
    additionalTerms: ''
  });

  const [clientInfo, setClientInfo] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    amount: 0
  });

  // 사용자 정보를 자동으로 로드
  useEffect(() => {
    const loadUserInfo = async () => {
      if (!user?.id) return

      try {
        const response = await fetch(`/api/users/${user.id}`)
        if (response.ok) {
          const userData = await response.json()
          setSupplierInfo({
            name: userData.name || '',
            email: userData.email || '',
            phone: userData.phone || '',
            businessRegistrationNumber: userData.business_registration_number || '',
            companyName: userData.company_name || '',
            businessName: userData.business_name || '',
          })
        }
      } catch (error) {
        console.error('Failed to load user info:', error)
      }
    }

    loadUserInfo()
  }, [user?.id]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount) + '원';
  };

  const handleSaveAndSend = () => {
    alert(`${clientInfo.name}님께 카카오톡으로 계약서가 발송되었습니다!`);
    onNavigate('documents');
  };

  const handleSaveDraft = () => {
    alert('계약서가 임시저장되었습니다.');
    onNavigate('documents');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => onNavigate('documents')} className="border-border">
          <ArrowLeft className="w-4 h-4 mr-2" />
          돌아가기
        </Button>
        <div>
          <h2 className="text-2xl font-medium text-foreground">새 계약서 작성</h2>
          <p className="text-muted-foreground">승인된 견적서를 바탕으로 계약서를 작성하세요</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quote Information (Auto-filled) */}
          <Card className="p-6 bg-card border-border">
            <h3 className="font-medium mb-4 text-foreground">견적서 정보 (자동 입력)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground">고객명</Label>
                <Input value={clientInfo.name} disabled className="bg-muted text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">회사명</Label>
                <Input value={clientInfo.company} disabled className="bg-muted text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">계약 금액</Label>
                <Input value={formatCurrency(clientInfo.amount)} disabled className="bg-muted text-muted-foreground font-mono" />
              </div>
            </div>
          </Card>

          {/* Contract Details */}
          <Card className="p-6 bg-card border-border">
            <h3 className="font-medium mb-4 text-foreground">계약서 세부사항</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contractTitle" className="text-foreground">계약서 제목 *</Label>
                <Input
                  id="contractTitle"
                  value={contractInfo.title}
                  onChange={(e) => setContractInfo({...contractInfo, title: e.target.value})}
                  placeholder="웹사이트 리뉴얼 프로젝트 용역계약서"
                  className="bg-input-background border-border"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-foreground">프로젝트 시작일 *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={contractInfo.startDate}
                    onChange={(e) => setContractInfo({...contractInfo, startDate: e.target.value})}
                    className="bg-input-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate" className="text-foreground">프로젝트 완료일 *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={contractInfo.endDate}
                    onChange={(e) => setContractInfo({...contractInfo, endDate: e.target.value})}
                    className="bg-input-background border-border"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentTerms" className="text-foreground">결제 조건</Label>
                <Select value={contractInfo.paymentTerms} onValueChange={(value) => setContractInfo({...contractInfo, paymentTerms: value})}>
                  <SelectTrigger className="bg-input-background border-border">
                    <SelectValue placeholder="결제 조건을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">계약 체결 즉시</SelectItem>
                    <SelectItem value="50-50">착수금 50% / 완료 후 50%</SelectItem>
                    <SelectItem value="30-70">착수금 30% / 완료 후 70%</SelectItem>
                    <SelectItem value="milestone">마일스톤별 분할 결제</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deliverables" className="text-foreground">납품물 및 서비스 내용 *</Label>
                <Textarea
                  id="deliverables"
                  value={contractInfo.deliverables}
                  onChange={(e) => setContractInfo({...contractInfo, deliverables: e.target.value})}
                  placeholder="구체적인 납품물과 서비스 내용을 입력하세요"
                  rows={5}
                  className="bg-input-background border-border"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Summary Sidebar */}
        <div className="space-y-6">
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-primary" />
              <h3 className="font-medium text-foreground">고객 정보</h3>
            </div>
            
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground">고객명</p>
                <p className="text-foreground font-medium">{clientInfo.name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">회사명</p>
                <p className="text-foreground">{clientInfo.company}</p>
              </div>
              <div>
                <p className="text-muted-foreground">연락처</p>
                <p className="text-foreground">{clientInfo.phone}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <h3 className="font-medium mb-4 text-foreground">계약서 발송</h3>
            <div className="space-y-3">
              <Button 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={handleSaveAndSend}
                disabled={!contractInfo.title || !contractInfo.startDate || !contractInfo.endDate || !contractInfo.deliverables}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                카카오톡으로 발송
              </Button>
              <Button 
                variant="outline" 
                className="w-full border-border"
                onClick={handleSaveDraft}
              >
                <Save className="w-4 h-4 mr-2" />
                임시저장
              </Button>
            </div>
            
            <div className="mt-4 p-3 bg-accent rounded-lg">
              <p className="text-sm text-accent-foreground">
                💡 계약서가 발송되면 고객이 모바일에서 바로 확인하고 전자서명할 수 있습니다.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
