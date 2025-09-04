import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ArrowLeft, MessageSquare, Save, User, Building, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { formatPhoneNumber, formatBusinessNumber } from '@/lib/formatters';

interface NewContractProps {
  onNavigate: (view: string) => void;
  isEdit?: boolean;
  editContractId?: string;
  initialData?: {
    client: {
      name: string;
      email: string;
      phone: string;
      company: string;
    };
    project: {
      title: string;
      description: string;
      amount: number;
    };
  };
}

export function NewContract({ onNavigate, isEdit = false, editContractId, initialData }: NewContractProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  // 변경사항 감지 및 확인 팝업 관련 상태
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [initialFormData, setInitialFormData] = useState<any>(null);
  
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


  // 수정 모드일 때 초기 데이터 설정
  useEffect(() => {
    if (isEdit && initialData) {
      const newClientInfo = {
        name: initialData.client.name,
        email: initialData.client.email,
        phone: initialData.client.phone,
        company: initialData.client.company,
        amount: initialData.project.amount
      };
      
      const newContractInfo = {
        title: initialData.project.title,
        startDate: '',
        endDate: '',
        paymentTerms: '',
        deliverables: initialData.project.description,
        additionalTerms: ''
      };
      
      setClientInfo(newClientInfo);
      setContractInfo(newContractInfo);
      
    }
  }, [isEdit, initialData]);

  // 초기 폼 데이터 설정 (수정 모드에서만)
  useEffect(() => {
    if (isEdit && initialData && supplierInfo.name) {
      // 공급자 정보가 로드된 후에 초기 데이터 설정
      setInitialFormData({
        clientInfo: {
          name: initialData.client.name,
          email: initialData.client.email,
          phone: initialData.client.phone,
          company: initialData.client.company,
          amount: initialData.project.amount
        },
        contractInfo: {
          title: initialData.project.title,
          startDate: '',
          endDate: '',
          paymentTerms: '',
          deliverables: initialData.project.description,
          additionalTerms: ''
        },
        supplierInfo
      });
    }
  }, [isEdit, initialData, supplierInfo.name]);

  // 변경사항 감지
  useEffect(() => {
    if (!initialFormData || !isEdit) {
      setHasUnsavedChanges(false);
      return;
    }

    // Deep comparison을 위한 함수
    const compareObjects = (obj1: any, obj2: any) => {
      try {
        return JSON.stringify(obj1) === JSON.stringify(obj2);
      } catch (error) {
        console.warn('Object comparison failed:', error);
        return true; // 에러 발생시 변경사항 없음으로 처리
      }
    };

    const currentFormData = {
      clientInfo,
      contractInfo,
      supplierInfo
    };

    const hasChanges = !compareObjects(currentFormData, initialFormData);
    setHasUnsavedChanges(hasChanges);
  }, [clientInfo, contractInfo, supplierInfo, initialFormData, isEdit]);


  // 페이지 언로드 시 경고 (변경사항이 있을 때)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount) + '원';
  };

  const handleSaveAndSend = async () => {
    setIsLoading(true);
    
    try {
      const contractData = {
        supplierInfo,
        contractInfo,
        clientInfo
      };

      if (isEdit && editContractId) {
        // Update existing contract
        const response = await fetch(`/api/contracts/${editContractId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(contractData),
        });

        if (!response.ok) {
          throw new Error('계약서 수정에 실패했습니다.');
        }
        
        alert(`${clientInfo.name}님께 수정된 계약서가 카카오톡으로 발송되었습니다!`);
      } else {
        // Create new contract
        const response = await fetch('/api/contracts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(contractData),
        });

        if (!response.ok) {
          throw new Error('계약서 생성에 실패했습니다.');
        }
        
        alert(`${clientInfo.name}님께 카카오톡으로 계약서가 발송되었습니다!`);
      }

      // 저장 후 변경사항 상태 리셋
      if (isEdit) {
        setInitialFormData({
          clientInfo,
          contractInfo,
          supplierInfo
        });
        setHasUnsavedChanges(false);
      }
      
      onNavigate('contracts');
    } catch (error) {
      console.error('Contract save error:', error);
      alert(error instanceof Error ? error.message : '계약서 저장에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    setIsLoading(true);
    
    try {
      const contractData = {
        supplierInfo,
        contractInfo,
        clientInfo,
        isDraft: true
      };

      if (isEdit && editContractId) {
        // Update existing contract as draft
        const response = await fetch(`/api/contracts/${editContractId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(contractData),
        });

        if (!response.ok) {
          throw new Error('계약서 수정에 실패했습니다.');
        }
        
        alert('계약서가 수정되어 임시저장되었습니다.');
      } else {
        // Create new draft contract
        const response = await fetch('/api/contracts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(contractData),
        });

        if (!response.ok) {
          throw new Error('계약서 생성에 실패했습니다.');
        }
        
        alert('계약서가 임시저장되었습니다.');
      }

      // 저장 후 변경사항 상태 리셋
      if (isEdit) {
        setInitialFormData({
          clientInfo,
          contractInfo,
          supplierInfo
        });
        setHasUnsavedChanges(false);
      }
      
      onNavigate('contracts');
    } catch (error) {
      console.error('Contract save error:', error);
      alert(error instanceof Error ? error.message : '계약서 임시저장에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 돌아가기 버튼 클릭 핸들러
  const handleBackClick = () => {
    // 수정 모드이고 변경사항이 있을 때만 확인 팝업 표시
    if (isEdit && hasUnsavedChanges) {
      setShowExitConfirm(true);
    } else {
      // 새 작성이거나 변경사항이 없으면 바로 이동
      onNavigate('contracts');
    }
  };

  // 저장하고 나가기
  const handleSaveAndExit = async () => {
    setShowExitConfirm(false);
    await handleSaveDraft();
  };

  // 저장하지 않고 나가기
  const handleExitWithoutSaving = () => {
    setShowExitConfirm(false);
    onNavigate('contracts');
  };

  // 취소 (계속 작업하기)
  const handleCancelExit = () => {
    setShowExitConfirm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={handleBackClick} className="border-border">
          <ArrowLeft className="w-4 h-4 mr-2" />
          돌아가기
        </Button>
        <div>
          <h2 className="text-2xl font-medium text-foreground">
            {isEdit ? '계약서 수정' : '새 계약서 작성'}
          </h2>
          <p className="text-muted-foreground">
            {isEdit ? '계약서 정보를 수정하세요' : '승인된 견적서를 바탕으로 계약서를 작성하세요'}
          </p>
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

        {/* Summary Sidebar - Sticky */}
        <div className="sticky top-6 self-start">
          <div className="space-y-6">
            <Card className="p-6 bg-card border-border shadow-lg">
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

            <Card className="p-6 bg-card border-border shadow-lg">
              <h3 className="font-medium mb-4 text-foreground">계약서 발송</h3>
              <div className="space-y-3">
                <Button 
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={handleSaveAndSend}
                  disabled={isLoading || !contractInfo.title || !contractInfo.startDate || !contractInfo.endDate || !contractInfo.deliverables}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  {isLoading ? '처리중...' : (isEdit ? '수정 후 발송' : '카카오톡으로 발송')}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full border-border"
                  onClick={handleSaveDraft}
                  disabled={isLoading || (isEdit && !hasUnsavedChanges)}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? '저장중...' : (isEdit ? '수정사항 저장' : '임시저장')}
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

      {/* 저장 확인 팝업 */}
      <Dialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="w-5 h-5" />
              변경사항이 있습니다
            </DialogTitle>
            <DialogDescription>
              수정한 내용이 저장되지 않았습니다. 어떻게 하시겠습니까?
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="flex gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelExit}
              className="flex-1"
            >
              계속 작업하기
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleExitWithoutSaving}
              className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              저장하지 않고 나가기
            </Button>
            <Button
              type="button"
              onClick={handleSaveAndExit}
              disabled={isLoading}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              {isLoading ? '저장 중...' : '저장하고 나가기'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
