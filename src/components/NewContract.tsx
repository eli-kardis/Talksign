import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ArrowLeft, MessageSquare, Save, User, Building, AlertTriangle, Plus, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { formatPhoneNumber, formatBusinessNumber } from '@/lib/formatters';

interface ContractItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

interface NewContractProps {
  onNavigate: (view: string) => void;
  isEdit?: boolean;
  editContractId?: string;
  fromQuote?: boolean;
  initialData?: {
    client: {
      name: string;
      email: string;
      phone: string;
      company: string;
      businessNumber?: string;
      address?: string;
    };
    project: {
      title: string;
      description: string;
      amount: number;
      startDate?: string;
      endDate?: string;
    };
    items?: Array<{
      id: string;
      name: string;
      description?: string;
      quantity?: number;
      unit_price?: number;
      amount: number;
    }>;
    terms?: string[];
    supplier?: any;
    quoteId?: string;
  };
}

export function NewContract({ onNavigate, isEdit = false, editContractId, fromQuote = false, initialData }: NewContractProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  // 변경사항 감지 및 확인 팝업 관련 상태
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [initialFormData, setInitialFormData] = useState<any>(null);

  // 1. 계약서 기본 정보
  const [contractBasicInfo, setContractBasicInfo] = useState({
    title: initialData?.project.title || '',
    description: initialData?.project.description || ''
  });

  // 2. 발주처 정보 (클라이언트)
  const [clientInfo, setClientInfo] = useState({
    name: initialData?.client.name || '',
    company: initialData?.client.company || '',
    phone: initialData?.client.phone || '',
    email: initialData?.client.email || '',
    businessNumber: initialData?.client.businessNumber || '',
    address: initialData?.client.address || ''
  });

  // 3. 수급업체 정보 (공급자)
  const [supplierInfo, setSupplierInfo] = useState({
    name: '',
    email: '',
    phone: '',
    businessRegistrationNumber: '',
    companyName: '',
    businessName: '',
    businessAddress: ''
  });

  // 4. 프로젝트 정보
  const [projectInfo, setProjectInfo] = useState({
    startDate: initialData?.project.startDate || '',
    endDate: initialData?.project.endDate || '',
    description: initialData?.project.description || ''
  });

  // 5. 계약 내역 (항목들)
  const [contractItems, setContractItems] = useState<ContractItem[]>(
    initialData?.items && initialData.items.length > 0 
      ? initialData.items.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description || '',
          quantity: item.quantity || 1,
          unit_price: item.unit_price || item.amount,
          amount: item.amount
        }))
      : [{
          id: Date.now().toString(),
          name: '',
          description: '',
          quantity: 1,
          unit_price: 0,
          amount: 0
        }]
  );

  // 6. 계약 조건
  const [contractTerms, setContractTerms] = useState<string[]>(
    initialData?.terms || [
      "프로젝트 수행 기간은 계약서 체결 후 협의하여 결정합니다.",
      "계약금 50% 선입금, 완료 후 50% 잔금 지급",
      "프로젝트 요구사항 변경 시 추가 비용이 발생할 수 있습니다.",
      "저작권은 완전한 대금 지급 후 발주처로 이전됩니다.",
      "계약 위반 시 위약금이 부과될 수 있습니다."
    ]
  );

  // 7. 결제 정보
  const [paymentInfo, setPaymentInfo] = useState({
    paymentTerms: '50-50', // 기본값
    paymentMethod: '',
    additionalTerms: ''
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
            businessAddress: userData.business_address || ''
          })
        }
      } catch (error) {
        console.error('Failed to load user info:', error)
      }
    }

    loadUserInfo()
  }, [user?.id]);

  // 초기 폼 데이터 설정 (수정 모드에서만)
  useEffect(() => {
    if (isEdit && initialData && supplierInfo.name) {
      setInitialFormData({
        contractBasicInfo,
        clientInfo,
        supplierInfo,
        projectInfo,
        contractItems,
        contractTerms,
        paymentInfo
      });
    }
  }, [isEdit, initialData, supplierInfo.name]);

  // 변경사항 감지
  useEffect(() => {
    if (!initialFormData || !isEdit) {
      setHasUnsavedChanges(false);
      return;
    }

    const compareObjects = (obj1: any, obj2: any) => {
      try {
        return JSON.stringify(obj1) === JSON.stringify(obj2);
      } catch (error) {
        console.warn('Object comparison failed:', error);
        return true;
      }
    };

    const currentFormData = {
      contractBasicInfo,
      clientInfo,
      supplierInfo,
      projectInfo,
      contractItems,
      contractTerms,
      paymentInfo
    };

    const hasChanges = !compareObjects(currentFormData, initialFormData);
    setHasUnsavedChanges(hasChanges);
  }, [contractBasicInfo, clientInfo, supplierInfo, projectInfo, contractItems, contractTerms, paymentInfo, initialFormData, isEdit]);

  // 페이지 언로드 시 경고
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

  // initialData가 나중에 로드되는 경우를 위한 useEffect
  useEffect(() => {
    if (initialData && !isEdit) {
      // 발주처 정보 업데이트
      if (initialData.client) {
        setClientInfo({
          name: initialData.client.name || '',
          company: initialData.client.company || '',
          phone: initialData.client.phone || '',
          email: initialData.client.email || '',
          businessNumber: initialData.client.businessNumber || '',
          address: initialData.client.address || ''
        });
      }

      // 프로젝트 정보 업데이트
      if (initialData.project) {
        setProjectInfo({
          startDate: initialData.project.startDate || '',
          endDate: initialData.project.endDate || '',
          description: initialData.project.description || ''
        });
      }

      // 계약 항목 업데이트
      if (initialData.items && initialData.items.length > 0) {
        setContractItems(initialData.items.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description || '',
          quantity: item.quantity || 1,
          unit_price: item.unit_price || item.amount,
          amount: item.amount
        })));
      }

      // 계약 조건 업데이트
      if (initialData.terms && initialData.terms.length > 0) {
        setContractTerms(initialData.terms);
      }
    }
  }, [initialData, isEdit]);

  // 유틸리티 함수들
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount) + '원';
  };

  const calculateTotals = () => {
    const subtotal = contractItems.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = Math.floor(subtotal * 0.1);
    const total = subtotal + taxAmount;
    return { subtotal, taxAmount, total };
  };

  // 계약 항목 관련 함수들
  const addContractItem = () => {
    const newItem: ContractItem = {
      id: Date.now().toString(),
      name: '',
      description: '',
      quantity: 1,
      unit_price: 0,
      amount: 0
    };
    setContractItems([...contractItems, newItem]);
  };

  const updateContractItem = (id: string, field: keyof ContractItem, value: any) => {
    setContractItems(items => items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unit_price') {
          updated.amount = updated.quantity * updated.unit_price;
        }
        return updated;
      }
      return item;
    }));
  };

  const removeContractItem = (id: string) => {
    setContractItems(items => items.filter(item => item.id !== id));
  };

  // 계약 조건 관련 함수들
  const addTerm = () => {
    setContractTerms([...contractTerms, '']);
  };

  const updateTerm = (index: number, value: string) => {
    const newTerms = [...contractTerms];
    newTerms[index] = value;
    setContractTerms(newTerms);
  };

  const removeTerm = (index: number) => {
    setContractTerms(terms => terms.filter((_, i) => i !== index));
  };

  // 저장 및 발송 함수들
  const handleSaveAndSend = async () => {
    setIsLoading(true);
    
    try {
      const contractData = {
        title: contractBasicInfo.title,
        description: contractBasicInfo.description,
        client_name: clientInfo.name,
        client_email: clientInfo.email,
        client_phone: clientInfo.phone,
        client_company: clientInfo.company,
        client_business_number: clientInfo.businessNumber,
        client_address: clientInfo.address,
        supplier_info: supplierInfo,
        project_start_date: projectInfo.startDate,
        project_end_date: projectInfo.endDate,
        project_description: projectInfo.description,
        items: contractItems,
        terms: contractTerms.filter(term => term.trim()),
        payment_terms: paymentInfo.paymentTerms,
        payment_method: paymentInfo.paymentMethod,
        additional_terms: paymentInfo.additionalTerms,
        ...calculateTotals(),
        status: 'sent',
        ...(initialData?.quoteId && { quote_id: initialData.quoteId })
      };

      if (isEdit && editContractId) {
        const response = await fetch(`/api/contracts/${editContractId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(contractData),
        });

        if (!response.ok) {
          throw new Error('계약서 수정에 실패했습니다.');
        }
        
        alert(`${clientInfo.name}님께 수정된 계약서가 발송되었습니다!`);
      } else {
        const response = await fetch('/api/contracts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(contractData),
        });

        if (!response.ok) {
          throw new Error('계약서 생성에 실패했습니다.');
        }
        
        alert(`${clientInfo.name}님께 계약서가 발송되었습니다!`);
      }

      if (isEdit) {
        setInitialFormData({
          contractBasicInfo, clientInfo, supplierInfo, projectInfo,
          contractItems, contractTerms, paymentInfo
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
        title: contractBasicInfo.title,
        description: contractBasicInfo.description,
        client_name: clientInfo.name,
        client_email: clientInfo.email,
        client_phone: clientInfo.phone,
        client_company: clientInfo.company,
        client_business_number: clientInfo.businessNumber,
        client_address: clientInfo.address,
        supplier_info: supplierInfo,
        project_start_date: projectInfo.startDate,
        project_end_date: projectInfo.endDate,
        project_description: projectInfo.description,
        items: contractItems,
        terms: contractTerms.filter(term => term.trim()),
        payment_terms: paymentInfo.paymentTerms,
        payment_method: paymentInfo.paymentMethod,
        additional_terms: paymentInfo.additionalTerms,
        ...calculateTotals(),
        status: 'draft',
        ...(initialData?.quoteId && { quote_id: initialData.quoteId })
      };

      if (isEdit && editContractId) {
        const response = await fetch(`/api/contracts/${editContractId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(contractData),
        });

        if (!response.ok) {
          throw new Error('계약서 수정에 실패했습니다.');
        }
        
        alert('계약서가 수정되어 임시저장되었습니다.');
      } else {
        const response = await fetch('/api/contracts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(contractData),
        });

        if (!response.ok) {
          throw new Error('계약서 생성에 실패했습니다.');
        }
        
        alert('계약서가 임시저장되었습니다.');
      }

      if (isEdit) {
        setInitialFormData({
          contractBasicInfo, clientInfo, supplierInfo, projectInfo,
          contractItems, contractTerms, paymentInfo
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
    if (isEdit && hasUnsavedChanges) {
      setShowExitConfirm(true);
    } else {
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

  const { subtotal, taxAmount, total } = calculateTotals();

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
            {isEdit ? '계약서 정보를 수정하세요' : (fromQuote ? '견적서 데이터가 자동으로 입력되었습니다. 필요한 정보를 추가 입력하세요.' : '승인된 견적서를 바탕으로 계약서를 작성하세요')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-3 space-y-6">
          {/* 견적서에서 온 경우 안내 문구 */}
          {fromQuote && (
            <Card className="p-4 bg-accent border-accent">
              <div className="flex items-center gap-2 text-accent-foreground">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <span className="text-sm font-medium">견적서에서 가져온 정보</span>
              </div>
              <p className="text-sm text-accent-foreground mt-1">
                견적서 데이터가 자동으로 입력되었습니다. 필요한 항목을 수정하거나 추가 정보를 입력하세요.
              </p>
            </Card>
          )}
          {/* 1. 계약서 기본 정보 */}
          <Card className="p-6 bg-card border-border">
            <h3 className="font-medium mb-4 text-foreground">계약서 기본 정보</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contractTitle" className="text-foreground">계약서 제목 *</Label>
                <Input
                  id="contractTitle"
                  value={contractBasicInfo.title}
                  onChange={(e) => setContractBasicInfo({...contractBasicInfo, title: e.target.value})}
                  placeholder="웹사이트 리뉴얼 프로젝트 용역계약서"
                  className="bg-input-background border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contractDescription" className="text-foreground">계약서 설명</Label>
                <Textarea
                  id="contractDescription"
                  value={contractBasicInfo.description}
                  onChange={(e) => setContractBasicInfo({...contractBasicInfo, description: e.target.value})}
                  placeholder="계약서에 대한 간단한 설명을 입력하세요"
                  rows={3}
                  className="bg-input-background border-border"
                />
              </div>
            </div>
          </Card>

          {/* 2. 발주처 정보 */}
          <Card className="p-6 bg-card border-border">
            <h3 className="font-medium mb-4 text-foreground">발주처 정보 (고객)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground">고객명 *</Label>
                <Input 
                  value={clientInfo.name} 
                  onChange={(e) => setClientInfo({...clientInfo, name: e.target.value})}
                  className="bg-input-background border-border" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">회사명</Label>
                <Input 
                  value={clientInfo.company} 
                  onChange={(e) => setClientInfo({...clientInfo, company: e.target.value})}
                  className="bg-input-background border-border" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">이메일 *</Label>
                <Input 
                  type="email"
                  value={clientInfo.email} 
                  onChange={(e) => setClientInfo({...clientInfo, email: e.target.value})}
                  className="bg-input-background border-border" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">전화번호</Label>
                <Input 
                  value={clientInfo.phone} 
                  onChange={(e) => setClientInfo({...clientInfo, phone: e.target.value})}
                  className="bg-input-background border-border" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">사업자등록번호</Label>
                <Input 
                  value={clientInfo.businessNumber} 
                  onChange={(e) => setClientInfo({...clientInfo, businessNumber: e.target.value})}
                  className="bg-input-background border-border" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">주소</Label>
                <Input 
                  value={clientInfo.address} 
                  onChange={(e) => setClientInfo({...clientInfo, address: e.target.value})}
                  className="bg-input-background border-border" 
                />
              </div>
            </div>
          </Card>

          {/* 3. 수급업체 정보 */}
          <Card className="p-6 bg-card border-border">
            <h3 className="font-medium mb-4 text-foreground">수급업체 정보 (공급자)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground">대표자명</Label>
                <Input 
                  value={supplierInfo.name} 
                  onChange={(e) => setSupplierInfo({...supplierInfo, name: e.target.value})}
                  className="bg-muted text-muted-foreground" 
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">회사명</Label>
                <Input 
                  value={supplierInfo.companyName || supplierInfo.businessName} 
                  onChange={(e) => setSupplierInfo({...supplierInfo, companyName: e.target.value})}
                  className="bg-muted text-muted-foreground"
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">이메일</Label>
                <Input 
                  value={supplierInfo.email} 
                  className="bg-muted text-muted-foreground" 
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">전화번호</Label>
                <Input 
                  value={supplierInfo.phone} 
                  className="bg-muted text-muted-foreground" 
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">사업자등록번호</Label>
                <Input 
                  value={supplierInfo.businessRegistrationNumber} 
                  className="bg-muted text-muted-foreground" 
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">사업장 주소</Label>
                <Input 
                  value={supplierInfo.businessAddress} 
                  onChange={(e) => setSupplierInfo({...supplierInfo, businessAddress: e.target.value})}
                  className="bg-input-background border-border" 
                />
              </div>
            </div>
          </Card>

          {/* 4. 프로젝트 정보 */}
          <Card className="p-6 bg-card border-border">
            <h3 className="font-medium mb-4 text-foreground">프로젝트 정보</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-foreground">프로젝트 시작일 *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={projectInfo.startDate}
                    onChange={(e) => setProjectInfo({...projectInfo, startDate: e.target.value})}
                    className="bg-input-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate" className="text-foreground">프로젝트 완료일 *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={projectInfo.endDate}
                    onChange={(e) => setProjectInfo({...projectInfo, endDate: e.target.value})}
                    className="bg-input-background border-border"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="projectDescription" className="text-foreground">프로젝트 상세 설명</Label>
                <Textarea
                  id="projectDescription"
                  value={projectInfo.description}
                  onChange={(e) => setProjectInfo({...projectInfo, description: e.target.value})}
                  placeholder="프로젝트에 대한 상세한 설명을 입력하세요"
                  rows={4}
                  className="bg-input-background border-border"
                />
              </div>
            </div>
          </Card>

          {/* 5. 계약 내역 */}
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-foreground">계약 내역</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addContractItem}
                className="border-border"
              >
                <Plus className="w-4 h-4 mr-2" />
                항목 추가
              </Button>
            </div>
            
            <div className="overflow-hidden">
                <table className="w-full table-auto">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="px-2 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-1/5">항목명</th>
                      <th className="px-2 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-2/5">설명</th>
                      <th className="px-2 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider w-16 whitespace-nowrap">수량</th>
                      <th className="px-2 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider w-16 whitespace-nowrap">단위</th>
                      <th className="px-2 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider w-32">단가</th>
                      <th className="px-2 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider w-36">금액</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contractItems.map((item, index) => (
                      <tr key={item.id} className="hover:bg-muted/30 transition-colors border-b border-border">
                        <td className="px-2 py-3 align-top">
                          <Input
                            value={item.name}
                            onChange={(e) => updateContractItem(item.id, 'name', e.target.value)}
                            placeholder="서비스 또는 상품명"
                            className="border-0 bg-transparent p-2 h-9 text-sm font-medium focus:ring-1 focus:ring-primary focus:bg-muted/30 hover:bg-muted/20 w-full break-words rounded-sm transition-colors"
                          />
                        </td>
                        <td className="px-2 py-3 align-top">
                          <Textarea
                            value={item.description}
                            onChange={(e) => updateContractItem(item.id, 'description', e.target.value)}
                            placeholder="항목에 대한 상세한 설명"
                            rows={1}
                            className="border-0 bg-transparent p-2 h-9 text-sm resize-none focus:ring-1 focus:ring-primary focus:bg-muted/30 hover:bg-muted/20 w-full break-words rounded-sm transition-colors"
                          />
                        </td>
                        <td className="px-2 py-3 text-center align-top">
                          <Input
                            type="text"
                            value={item.quantity}
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^0-9]/g, '');
                              updateContractItem(item.id, 'quantity', parseInt(value) || 1);
                            }}
                            className="border-0 bg-transparent p-2 h-9 text-sm text-center w-full focus:ring-1 focus:ring-primary focus:bg-muted/30 hover:bg-muted/20 rounded-sm transition-colors"
                          />
                        </td>
                        <td className="px-2 py-3 text-center align-top">
                          <Input
                            type="text"
                            value="개"
                            onChange={(e) => {
                              // You can implement unit changes here if needed
                              // For now, keeping it as "개"
                            }}
                            className="border-0 bg-transparent p-2 h-9 text-sm text-center w-full focus:ring-1 focus:ring-primary focus:bg-muted/30 hover:bg-muted/20 rounded-sm transition-colors"
                          />
                        </td>
                        <td className="px-2 py-3 text-right align-top">
                          <div className="flex items-center justify-end">
                            <Input
                              type="text"
                              value={item.unit_price ? new Intl.NumberFormat('ko-KR').format(item.unit_price) : ''}
                              onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9]/g, '');
                                updateContractItem(item.id, 'unit_price', parseInt(value) || 0);
                              }}
                              onWheel={(e) => e.currentTarget.blur()}
                              className="border-0 bg-transparent p-2 h-9 text-sm text-right focus:ring-1 focus:ring-primary focus:bg-muted/30 hover:bg-muted/20 w-20 rounded-sm transition-colors"
                              placeholder="0"
                            />
                            <span className="text-sm text-muted-foreground ml-1 whitespace-nowrap">원</span>
                          </div>
                        </td>
                        <td className="px-2 py-3 text-right align-top">
                          <div className="flex items-center justify-end gap-1 h-9">
                            <span className="font-semibold text-foreground text-sm whitespace-nowrap">
                              {new Intl.NumberFormat('ko-KR').format(item.amount)}원
                            </span>
                            {contractItems.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeContractItem(item.id)}
                                className="text-destructive hover:text-destructive p-1 h-6 w-6 flex-shrink-0"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            </div>

            {/* 합계 */}
            <div className="mt-6 pt-4 border-t border-border">
              <div className="flex flex-col gap-2 max-w-xs ml-auto">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">소계</span>
                  <span className="text-foreground">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">부가세 (10%)</span>
                  <span className="text-foreground">{formatCurrency(taxAmount)}</span>
                </div>
                <div className="flex justify-between font-medium pt-2 border-t border-border">
                  <span className="text-foreground">총 금액</span>
                  <span className="text-lg text-primary">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* 6. 계약 조건 */}
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-foreground">계약 조건</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addTerm}
                className="border-border"
              >
                <Plus className="w-4 h-4 mr-2" />
                조건 추가
              </Button>
            </div>
            
            <div className="space-y-3">
              {contractTerms.map((term, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-sm text-muted-foreground mt-2 min-w-[20px]">{index + 1}.</span>
                  <div className="flex-1">
                    <Textarea
                      value={term}
                      onChange={(e) => updateTerm(index, e.target.value)}
                      placeholder="계약 조건을 입력하세요"
                      rows={2}
                      className="bg-input-background border-border"
                    />
                  </div>
                  {contractTerms.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTerm(index)}
                      className="text-destructive hover:text-destructive mt-1"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* 7. 결제 정보 */}
          <Card className="p-6 bg-card border-border">
            <h3 className="font-medium mb-4 text-foreground">결제 정보</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="paymentTerms" className="text-foreground">결제 조건 *</Label>
                <Select value={paymentInfo.paymentTerms} onValueChange={(value) => setPaymentInfo({...paymentInfo, paymentTerms: value})}>
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
                <Label htmlFor="paymentMethod" className="text-foreground">결제 방법</Label>
                <Select value={paymentInfo.paymentMethod} onValueChange={(value) => setPaymentInfo({...paymentInfo, paymentMethod: value})}>
                  <SelectTrigger className="bg-input-background border-border">
                    <SelectValue placeholder="결제 방법을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank-transfer">계좌이체</SelectItem>
                    <SelectItem value="card">카드결제</SelectItem>
                    <SelectItem value="cash">현금결제</SelectItem>
                    <SelectItem value="check">수표결제</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalTerms" className="text-foreground">추가 결제 조건</Label>
                <Textarea
                  id="additionalTerms"
                  value={paymentInfo.additionalTerms}
                  onChange={(e) => setPaymentInfo({...paymentInfo, additionalTerms: e.target.value})}
                  placeholder="결제와 관련된 추가 조건이 있다면 입력하세요"
                  rows={3}
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
                  <p className="text-foreground font-medium">{clientInfo.name || '미입력'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">회사명</p>
                  <p className="text-foreground">{clientInfo.company || '미입력'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">연락처</p>
                  <p className="text-foreground">{clientInfo.phone || '미입력'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">총 계약 금액</p>
                  <p className="text-primary font-bold text-lg">{formatCurrency(total)}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card border-border shadow-lg">
              <h3 className="font-medium mb-4 text-foreground">계약서 발송</h3>
              <div className="space-y-3">
                <Button 
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={handleSaveAndSend}
                  disabled={isLoading || !contractBasicInfo.title || !clientInfo.name || !clientInfo.email || !projectInfo.startDate || !projectInfo.endDate || contractItems.length === 0}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  {isLoading ? '처리중...' : (isEdit ? '수정 후 발송' : '계약서 발송')}
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