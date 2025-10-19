import React, { useState, useEffect, useRef } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';
import { ArrowLeft, MessageSquare, Save, User, Building, AlertTriangle, Plus, X, Edit3, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { CustomerSelector } from './CustomerSelector';
import { SupplierSignatureModal } from './SupplierSignatureModal';
import { ClientInfoForm, SupplierInfoForm } from './contracts';
import { useAuth } from '@/contexts/AuthContext';
import { formatPhoneNumber, formatBusinessNumber } from '@/lib/formatters';
import { AuthenticatedApiClient } from '@/lib/api-client';

interface ContractItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  unit: string;
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
  
  // 편집 모드 상태
  const [isEditingClient, setIsEditingClient] = useState(false);
  const [isEditingSupplier, setIsEditingSupplier] = useState(false);

  // 폼 요소 참조들 (유효성 검사를 위한 스크롤 및 포커스용)
  const titleRef = useRef<HTMLInputElement>(null);
  const clientNameRef = useRef<HTMLInputElement>(null);
  const clientEmailRef = useRef<HTMLInputElement>(null);
  const startDateRef = useRef<HTMLInputElement>(null);
  const endDateRef = useRef<HTMLInputElement>(null);
  const paymentConditionRef = useRef<HTMLButtonElement>(null);
  const paymentMethodRef = useRef<HTMLDivElement>(null);
  const bankNameRef = useRef<HTMLInputElement>(null);
  const bankAccountNumberRef = useRef<HTMLInputElement>(null);
  const bankAccountHolderRef = useRef<HTMLInputElement>(null);

  // 툴팁 상태 관리
  const [fieldTooltips, setFieldTooltips] = useState<{[key: string]: string}>({});

  // 견적서 불러오기 관련 상태
  const [showQuoteDialog, setShowQuoteDialog] = useState(false);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loadingQuotes, setLoadingQuotes] = useState(false);

  // 전자서명 관련 상태
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [supplierSignature, setSupplierSignature] = useState<string | null>(null);
  const [pendingContractData, setPendingContractData] = useState<any>(null);

  // 1. 계약서 기본 정보
  const [contractBasicInfo, setContractBasicInfo] = useState({
    title: initialData?.project.title || '',
    description: initialData?.project.description || ''
  });

  // 2. 수신자 정보 (클라이언트)
  const [clientInfo, setClientInfo] = useState({
    name: initialData?.client.name || '',
    company: initialData?.client.company || '',
    phone: initialData?.client.phone || '',
    email: initialData?.client.email || '',
    businessNumber: initialData?.client.businessNumber || '',
    fax: (initialData?.client as any)?.fax || '',
    address: initialData?.client.address || '',
    businessType: (initialData?.client as any)?.businessType || '',
    businessCategory: (initialData?.client as any)?.businessCategory || ''
  });

  // 3. 공급자 정보
  const [supplierInfo, setSupplierInfo] = useState({
    name: '',
    email: '',
    phone: '',
    fax: '',
    businessRegistrationNumber: '',
    companyName: '',
    businessName: '',
    businessAddress: '',
    businessType: '',
    businessCategory: ''
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
          amount: item.amount,
          unit: (item as any).unit || '개'
        }))
      : [{
          id: Date.now().toString(),
          name: '',
          description: '',
          quantity: 1,
          unit_price: 0,
          amount: 0,
          unit: '개'
        }]
  );

  // 6. 계약 조건
  const [contractTerms, setContractTerms] = useState<string[]>(
    initialData?.terms || [
      "프로젝트 요구사항 변경 시 추가 비용이 발생할 수 있습니다.",
      "저작권은 완전한 대금 지급 후 수신자로 이전됩니다.",
      "계약 위반 시 위약금이 부과될 수 있습니다."
    ]
  );

  // 7. 통합 결제 정보
  const [paymentInfo, setPaymentInfo] = useState({
    // 결제 조건
    paymentCondition: 'immediate', // 'immediate' | 'custom'

    // 입력 단위
    inputUnit: 'amount', // 'amount' | 'percent'

    // 금액 모드 필드
    amountDeposit: '',
    amountMilestone: '',
    amountBalance: '',

    // 비율 모드 필드
    percentDeposit: '',
    percentMilestone: '',
    percentBalance: '',

    // 지급일
    dueDeposit: '',
    dueMilestone: '',
    dueBalance: '',

    // 결제 방법
    paymentMethod: '', // 'bank' | 'card'

    // 계좌이체 선택 시 필수 필드
    bankName: '',
    bankAccountNumber: '',
    bankAccountHolder: ''
  });

  // 8. 법적 필수 요소
  const [legalInfo, setLegalInfo] = useState({
    partyARole: '수신자', // 갑의 역할
    partyBRole: '공급자', // 을의 역할
    contractCopies: 2,
    partyARepresentative: '', // 수신자 대표자
    partyBRepresentative: '' // 공급자 대표자
  });

  // 10. 계약 이행 조건
  const [deliveryInfo, setDeliveryInfo] = useState({
    deliveryConditions: '',
    deliveryLocation: '',
    deliveryDeadline: '',
    warrantyPeriod: '',
    warrantyScope: ''
  });

  // 11. 법적 보호 조항
  const [legalClauses, setLegalClauses] = useState({
    ndaClause: '',
    terminationConditions: '',
    disputeResolution: '서울중앙지방법원',
    jurisdictionCourt: '서울중앙지방법원',
    forceMajeureClause: ''
  });

  // 12. 추가 조항
  const [additionalClauses, setAdditionalClauses] = useState({
    renewalConditions: '',
    amendmentProcedure: '',
    assignmentProhibition: '',
    specialTerms: '',
    penaltyClause: ''
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
            fax: userData.fax || '',
            businessRegistrationNumber: userData.business_registration_number || '',
            companyName: userData.company_name || '',
            businessName: userData.business_name || '',
            businessAddress: userData.business_address || '',
            businessType: userData.business_type || '',
            businessCategory: userData.business_category || ''
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
        paymentInfo,
        legalInfo,
        deliveryInfo,
        legalClauses,
        additionalClauses
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
      paymentInfo,
      legalInfo,
      deliveryInfo,
      legalClauses,
      additionalClauses
    };

    const hasChanges = !compareObjects(currentFormData, initialFormData);
    setHasUnsavedChanges(hasChanges);
  }, [contractBasicInfo, clientInfo, supplierInfo, projectInfo, contractItems, contractTerms, paymentInfo, legalInfo, deliveryInfo, legalClauses, additionalClauses, initialFormData, isEdit]);

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
      // 수신자 정보 업데이트
      if (initialData.client) {
        setClientInfo({
          name: initialData.client.name || '',
          company: initialData.client.company || '',
          phone: initialData.client.phone || '',
          email: initialData.client.email || '',
          businessNumber: initialData.client.businessNumber || '',
          fax: (initialData.client as any).fax || '',
          address: initialData.client.address || '',
          businessType: (initialData.client as any).businessType || '',
          businessCategory: (initialData.client as any).businessCategory || ''
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
          amount: item.amount,
          unit: (item as any).unit || '개'
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

  // 툴팁 헬퍼 함수들
  const showFieldTooltip = (fieldKey: string, message: string) => {
    setFieldTooltips(prev => ({ ...prev, [fieldKey]: message }));
  };

  const hideFieldTooltip = (fieldKey: string) => {
    setFieldTooltips(prev => {
      const newTooltips = { ...prev };
      delete newTooltips[fieldKey];
      return newTooltips;
    });
  };

  // 유효성 검사 및 툴팁으로 오류 표시
  const validateWithTooltips = () => {
    // 모든 이전 툴팁 제거
    setFieldTooltips({});

    let firstErrorRef: React.RefObject<any> | null = null;
    let firstErrorKey = '';

    if (!contractBasicInfo.title.trim()) {
      showFieldTooltip('title', '해당 항목을 입력해주세요');
      if (!firstErrorRef) {
        firstErrorRef = titleRef;
        firstErrorKey = 'title';
      }
    }
    
    if (!clientInfo.name.trim()) {
      showFieldTooltip('clientName', '해당 항목을 입력해주세요');
      if (!firstErrorRef) {
        firstErrorRef = clientNameRef;
        firstErrorKey = 'clientName';
      }
    }
    
    if (!clientInfo.email.trim()) {
      showFieldTooltip('clientEmail', '해당 항목을 입력해주세요');
      if (!firstErrorRef) {
        firstErrorRef = clientEmailRef;
        firstErrorKey = 'clientEmail';
      }
    } else if (clientInfo.email.trim() && !isValidEmail(clientInfo.email)) {
      showFieldTooltip('clientEmail', '올바른 이메일 형식을 입력해주세요');
      if (!firstErrorRef) {
        firstErrorRef = clientEmailRef;
        firstErrorKey = 'clientEmail';
      }
    }
    
    if (!clientInfo.company.trim()) {
      showFieldTooltip('clientCompany', '해당 항목을 입력해주세요');
      if (!firstErrorRef) {
        firstErrorKey = 'clientCompany';
      }
    }
    
    if (!clientInfo.phone.trim()) {
      showFieldTooltip('clientPhone', '해당 항목을 입력해주세요');
      if (!firstErrorRef) {
        firstErrorKey = 'clientPhone';
      }
    }
    
    if (!supplierInfo.name.trim()) {
      showFieldTooltip('supplierName', '해당 항목을 입력해주세요');
      if (!firstErrorRef) {
        firstErrorKey = 'supplierName';
      }
    }
    
    if (!supplierInfo.email.trim()) {
      showFieldTooltip('supplierEmail', '해당 항목을 입력해주세요');
      if (!firstErrorRef) {
        firstErrorKey = 'supplierEmail';
      }
    } else if (supplierInfo.email.trim() && !isValidEmail(supplierInfo.email)) {
      showFieldTooltip('supplierEmail', '올바른 이메일 형식을 입력해주세요');
      if (!firstErrorRef) {
        firstErrorKey = 'supplierEmail';
      }
    }
    
    if (!supplierInfo.phone.trim()) {
      showFieldTooltip('supplierPhone', '해당 항목을 입력해주세요');
      if (!firstErrorRef) {
        firstErrorKey = 'supplierPhone';
      }
    }
    
    if (!projectInfo.startDate) {
      showFieldTooltip('startDate', '해당 항목을 입력해주세요');
      if (!firstErrorRef) {
        firstErrorRef = startDateRef;
        firstErrorKey = 'startDate';
      }
    }
    
    if (!projectInfo.endDate) {
      showFieldTooltip('endDate', '해당 항목을 입력해주세요');
      if (!firstErrorRef) {
        firstErrorRef = endDateRef;
        firstErrorKey = 'endDate';
      }
    } else if (projectInfo.startDate && projectInfo.endDate && projectInfo.startDate > projectInfo.endDate) {
      showFieldTooltip('startDate', '프로젝트 시작일은 완료일보다 이전이어야 합니다');
      if (!firstErrorRef) {
        firstErrorRef = startDateRef;
        firstErrorKey = 'startDate';
      }
    }

    // 결제 조건 검증
    if (!paymentInfo.paymentCondition) {
      showFieldTooltip('paymentCondition', '결제 조건을 선택해주세요');
      if (!firstErrorRef) {
        firstErrorRef = paymentConditionRef;
        firstErrorKey = 'paymentCondition';
      }
    }

    // 직접 입력 선택 시 결제 방법 필수 검증
    if (paymentInfo.paymentCondition === 'custom' && !paymentInfo.paymentMethod) {
      showFieldTooltip('paymentMethod', '결제 방법을 선택해주세요');
      if (!firstErrorRef) {
        firstErrorRef = paymentMethodRef;
        firstErrorKey = 'paymentMethod';
      }
    }

    // 계좌이체 선택 시 은행 정보 필수 검증
    if (paymentInfo.paymentCondition === 'custom' && paymentInfo.paymentMethod === 'bank' && !paymentInfo.bankName.trim()) {
      showFieldTooltip('bankName', '은행명은 필수 입력입니다.');
      if (!firstErrorRef) {
        firstErrorRef = bankNameRef;
        firstErrorKey = 'bankName';
      }
    }

    if (paymentInfo.paymentCondition === 'custom' && paymentInfo.paymentMethod === 'bank' && !paymentInfo.bankAccountNumber.trim()) {
      showFieldTooltip('bankAccountNumber', '계좌번호는 필수 입력입니다.');
      if (!firstErrorRef) {
        firstErrorRef = bankAccountNumberRef;
        firstErrorKey = 'bankAccountNumber';
      }
    }

    if (paymentInfo.paymentCondition === 'custom' && paymentInfo.paymentMethod === 'bank' && !paymentInfo.bankAccountHolder.trim()) {
      showFieldTooltip('bankAccountHolder', '예금주는 필수 입력입니다.');
      if (!firstErrorRef) {
        firstErrorRef = bankAccountHolderRef;
        firstErrorKey = 'bankAccountHolder';
      }
    }

    // 직접 입력 선택 시 추가 검증
    if (paymentInfo.paymentCondition === 'custom') {
      // 금액/비율 합계 검증
      if (paymentInfo.inputUnit === 'amount' && !validateAmountSum()) {
        const { total } = calculateTotals();
        const formattedTotal = new Intl.NumberFormat('ko-KR').format(total);
        showFieldTooltip('amountBalance', `선금 + 중도금 + 잔금 = 총 계약 금액(₩${formattedTotal}) 이어야 합니다.`);
        if (!firstErrorRef) {
          firstErrorRef = null;
          firstErrorKey = 'amountBalance';
        }
      }

      if (paymentInfo.inputUnit === 'percent' && !validatePercentSum()) {
        showFieldTooltip('percentBalance', '선금 + 중도금 + 잔금 = 100% 이어야 합니다.');
        if (!firstErrorRef) {
          firstErrorRef = null;
          firstErrorKey = 'percentBalance';
        }
      }

      // 조건부 지급일 필수 검증 (값이 있는 항목만)
      const hasDeposit = paymentInfo.inputUnit === 'amount'
        ? (paymentInfo.amountDeposit && parseFloat(paymentInfo.amountDeposit) > 0)
        : (paymentInfo.percentDeposit && parseFloat(paymentInfo.percentDeposit) > 0);

      const hasMilestone = paymentInfo.inputUnit === 'amount'
        ? (paymentInfo.amountMilestone && parseFloat(paymentInfo.amountMilestone) > 0)
        : (paymentInfo.percentMilestone && parseFloat(paymentInfo.percentMilestone) > 0);

      const hasBalance = paymentInfo.inputUnit === 'amount'
        ? (paymentInfo.amountBalance && parseFloat(paymentInfo.amountBalance) > 0)
        : (paymentInfo.percentBalance && parseFloat(paymentInfo.percentBalance) > 0);

      if (hasDeposit && !paymentInfo.dueDeposit.trim()) {
        showFieldTooltip('dueDeposit', '선금 지급일은 필수 입력입니다.');
        if (!firstErrorRef) {
          firstErrorRef = null;
          firstErrorKey = 'dueDeposit';
        }
      }

      if (hasMilestone && !paymentInfo.dueMilestone.trim()) {
        showFieldTooltip('dueMilestone', '중도금 지급일은 필수 입력입니다.');
        if (!firstErrorRef) {
          firstErrorRef = null;
          firstErrorKey = 'dueMilestone';
        }
      }

      if (hasBalance && !paymentInfo.dueBalance.trim()) {
        showFieldTooltip('dueBalance', '잔금 지급일은 필수 입력입니다.');
        if (!firstErrorRef) {
          firstErrorRef = null;
          firstErrorKey = 'dueBalance';
        }
      }

      // 음수/NaN/무한대 검증
      const validateNumber = (value: string, fieldName: string): boolean => {
        if (!value) return true; // 빈 값은 허용 (선택적)
        const num = parseFloat(value);
        if (isNaN(num) || !isFinite(num) || num < 0) {
          showFieldTooltip(fieldName, '올바른 숫자를 입력해주세요 (0 이상)');
          if (!firstErrorRef) {
            firstErrorRef = null;
            firstErrorKey = fieldName;
          }
          return false;
        }
        return true;
      };

      if (paymentInfo.inputUnit === 'amount') {
        validateNumber(paymentInfo.amountDeposit, 'amountDeposit');
        validateNumber(paymentInfo.amountMilestone, 'amountMilestone');
        validateNumber(paymentInfo.amountBalance, 'amountBalance');
      } else {
        validateNumber(paymentInfo.percentDeposit, 'percentDeposit');
        validateNumber(paymentInfo.percentMilestone, 'percentMilestone');
        validateNumber(paymentInfo.percentBalance, 'percentBalance');
      }
    }

    const validItems = contractItems.filter(item => item.name.trim() && item.amount > 0);
    if (validItems.length === 0) {
      if (!firstErrorRef) {
        // 첫 번째 항목의 name 필드로 스크롤
        const contractItemsCard = document.querySelector('[data-section="contract-items"]');
        if (contractItemsCard) {
          contractItemsCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(() => {
            const firstNameInput = document.querySelector('[data-item-field="name"]:first-of-type') as HTMLInputElement;
            if (firstNameInput) {
              firstNameInput.focus();
              // 첫 번째 항목에 툴팁 추가 (임시로 DOM 조작)
              const tooltip = document.createElement('div');
              tooltip.className = 'absolute z-50 px-2 py-1 text-xs text-white bg-red-500 rounded shadow-lg -top-8 left-0 whitespace-nowrap';
              tooltip.textContent = '해당 항목을 입력해주세요';
              tooltip.style.pointerEvents = 'none';
              firstNameInput.parentElement?.appendChild(tooltip);
              
              // 입력 시 툴팁 제거
              const removeTooltip = () => {
                if (tooltip && tooltip.parentElement) {
                  tooltip.parentElement.removeChild(tooltip);
                  firstNameInput.removeEventListener('input', removeTooltip);
                }
              };
              firstNameInput.addEventListener('input', removeTooltip);
            }
          }, 500);
        }
        return true; // 오류가 있음
      }
    }

    // 첫 번째 오류 필드로 스크롤
    if (firstErrorRef && firstErrorRef.current) {
      firstErrorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        if (firstErrorRef && firstErrorRef.current) {
          firstErrorRef.current.focus();
        }
      }, 500);
      return true; // 오류가 있음
    }

    return false; // 오류가 없음
  };


  // 이메일 유효성 검사 헬퍼 함수
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const calculateTotals = () => {
    const subtotal = contractItems.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = Math.floor(subtotal * 0.1);
    const total = subtotal + taxAmount;
    return { subtotal, taxAmount, total };
  };

  // 결제 금액 자동 계산 (금액 모드)
  const handleAmountChange = (field: 'deposit' | 'milestone' | 'balance', value: string) => {
    const { total } = calculateTotals();
    const numValue = parseFloat(value) || 0;

    let newDeposit = field === 'deposit' ? value : paymentInfo.amountDeposit;
    let newMilestone = field === 'milestone' ? value : paymentInfo.amountMilestone;
    let newBalance = field === 'balance' ? value : paymentInfo.amountBalance;

    // 잔금이 아닌 필드를 수정한 경우, 잔금 자동 계산
    if (field !== 'balance') {
      const depositVal = parseFloat(newDeposit) || 0;
      const milestoneVal = parseFloat(newMilestone) || 0;
      const calculatedBalance = total - depositVal - milestoneVal;
      newBalance = calculatedBalance > 0 ? calculatedBalance.toString() : '0';
    }

    setPaymentInfo({
      ...paymentInfo,
      amountDeposit: newDeposit,
      amountMilestone: newMilestone,
      amountBalance: newBalance
    });
  };

  // 결제 비율 자동 계산 (비율 모드)
  const handlePercentChange = (field: 'deposit' | 'milestone' | 'balance', value: string) => {
    const numValue = parseFloat(value) || 0;

    let newDeposit = field === 'deposit' ? value : paymentInfo.percentDeposit;
    let newMilestone = field === 'milestone' ? value : paymentInfo.percentMilestone;
    let newBalance = field === 'balance' ? value : paymentInfo.percentBalance;

    // 잔금이 아닌 필드를 수정한 경우, 잔금 자동 계산
    if (field !== 'balance') {
      const depositVal = parseFloat(newDeposit) || 0;
      const milestoneVal = parseFloat(newMilestone) || 0;
      const calculatedBalance = 100 - depositVal - milestoneVal;
      // 소수점 2자리로 반올림
      newBalance = calculatedBalance > 0 ? calculatedBalance.toFixed(2) : '0';
    }

    setPaymentInfo({
      ...paymentInfo,
      percentDeposit: newDeposit,
      percentMilestone: newMilestone,
      percentBalance: newBalance
    });
  };

  // 결제 합계 검증 (금액 모드)
  const validateAmountSum = (): boolean => {
    if (paymentInfo.paymentCondition !== 'custom') return true;

    const { total } = calculateTotals();
    const deposit = parseFloat(paymentInfo.amountDeposit) || 0;
    const milestone = parseFloat(paymentInfo.amountMilestone) || 0;
    const balance = parseFloat(paymentInfo.amountBalance) || 0;
    const sum = deposit + milestone + balance;

    // 합계가 있고 총 금액과 다른 경우
    if (sum > 0 && Math.abs(sum - total) > 0.01) {
      return false;
    }
    return true;
  };

  // 결제 합계 검증 (비율 모드)
  const validatePercentSum = (): boolean => {
    if (paymentInfo.paymentCondition !== 'custom') return true;

    const deposit = parseFloat(paymentInfo.percentDeposit) || 0;
    const milestone = parseFloat(paymentInfo.percentMilestone) || 0;
    const balance = parseFloat(paymentInfo.percentBalance) || 0;
    const sum = deposit + milestone + balance;

    // 합계가 있고 100%가 아닌 경우
    if (sum > 0 && Math.abs(sum - 100) > 0.01) {
      return false;
    }
    return true;
  };

  // 입력 단위 전환 핸들러
  const handleInputUnitChange = (newUnit: 'amount' | 'percent') => {
    if (newUnit === paymentInfo.inputUnit) return;

    // 기존 값이 있는 경우 경고
    const hasValues = paymentInfo.inputUnit === 'amount'
      ? (paymentInfo.amountDeposit || paymentInfo.amountMilestone || paymentInfo.amountBalance)
      : (paymentInfo.percentDeposit || paymentInfo.percentMilestone || paymentInfo.percentBalance);

    if (hasValues) {
      const confirmed = window.confirm('입력 단위 변경 시 기존 값이 초기화됩니다. 계속하시겠습니까?');
      if (!confirmed) return;
    }

    // 값 초기화하고 단위 변경
    setPaymentInfo({
      ...paymentInfo,
      inputUnit: newUnit,
      amountDeposit: '',
      amountMilestone: '',
      amountBalance: '',
      percentDeposit: '',
      percentMilestone: '',
      percentBalance: ''
    });
  };

  const handleCustomerSelect = (customer: any) => {
    setClientInfo({
      name: customer.company_name || '',
      company: customer.representative_name || '',
      phone: customer.phone || '',
      email: customer.email || '',
      businessNumber: customer.business_registration_number || '',
      fax: customer.fax || '',
      address: customer.address || '',
      businessType: customer.business_type || '',
      businessCategory: customer.business_category || ''
    });
  };

  // 견적서 목록 조회
  const fetchQuotes = async () => {
    setLoadingQuotes(true);
    try {
      const response = await AuthenticatedApiClient.get('/api/quotes');
      if (!response.ok) {
        throw new Error('견적서를 불러오는데 실패했습니다.');
      }
      const data = await response.json();
      console.log('Fetched quotes data:', data);

      // data가 배열인지 확인하고, 배열이 아니면 빈 배열로 설정
      if (Array.isArray(data)) {
        setQuotes(data);
      } else if (data && Array.isArray(data.data)) {
        // API가 { data: [...] } 형식으로 반환하는 경우
        setQuotes(data.data);
      } else {
        console.warn('Quotes data is not an array:', data);
        setQuotes([]);
      }
    } catch (error) {
      console.error('Error fetching quotes:', error);
      alert('견적서를 불러오는데 실패했습니다.');
      setQuotes([]);
    } finally {
      setLoadingQuotes(false);
    }
  };

  // 견적서 불러오기 버튼 클릭
  const handleLoadQuote = () => {
    setShowQuoteDialog(true);
    fetchQuotes();
  };

  // 견적서 선택시 데이터 입력
  const handleQuoteSelect = (quote: any) => {
    console.log('Selected quote:', quote);
    console.log('Quote items:', quote.items);

    // 수신자 정보 설정
    setClientInfo({
      name: quote.client_name || '',
      company: quote.client_company || '',
      phone: quote.client_phone || '',
      email: quote.client_email || '',
      businessNumber: quote.client_business_number || '',
      fax: quote.client_fax || '',
      address: quote.client_address || '',
      businessType: quote.client_business_type || '',
      businessCategory: quote.client_business_category || ''
    });

    // 계약서 제목을 견적서 제목으로 설정
    setContractBasicInfo(prev => ({
      ...prev,
      title: quote.title || '',
      description: quote.description || ''
    }));

    // 계약 항목들 설정
    let quoteItems = quote.items;

    // items가 문자열인 경우 파싱 시도
    if (typeof quoteItems === 'string') {
      try {
        quoteItems = JSON.parse(quoteItems);
      } catch (e) {
        console.error('Failed to parse quote items:', e);
        quoteItems = [];
      }
    }

    // 배열 확인 및 매핑
    if (quoteItems && Array.isArray(quoteItems) && quoteItems.length > 0) {
      const items = quoteItems.map((item: any, index: number) => {
        console.log(`Item ${index}:`, item);
        console.log(`Item unit:`, item.unit);
        return {
          id: `item-${Date.now()}-${index}`,
          name: item.name || '',
          description: item.description || '',
          quantity: item.quantity || 1,
          unit_price: item.unit_price || 0,
          amount: item.amount || 0,
          unit: item.unit
        };
      });
      console.log('Mapped items:', items);
      setContractItems(items);
    } else {
      console.warn('No valid items found in quote');
      setContractItems([]);
    }

    setShowQuoteDialog(false);
    alert('견적서 정보가 불러와졌습니다.');
  };

  // 계약 항목 관련 함수들
  const addContractItem = () => {
    const newItem: ContractItem = {
      id: Date.now().toString(),
      name: '',
      description: '',
      quantity: 1,
      unit_price: 0,
      amount: 0,
      unit: '개'
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
    // 유효성 검사 및 툴팁 표시
    const hasErrors = validateWithTooltips();
    if (hasErrors) {
      return;
    }

    // 계약서 데이터 준비
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
      payment_method: paymentInfo.paymentMethod,
      ...calculateTotals(),
      status: 'draft', // 먼저 draft로 저장
      ...(initialData?.quoteId && { quote_id: initialData.quoteId })
    };

    // 계약서 데이터 저장 후 서명 모달 표시
    setPendingContractData(contractData);
    setShowSignatureModal(true);
  };

  // 서명 완료 후 실제 전송 처리
  const handleSignatureConfirm = async (signatureData: string) => {
    if (!pendingContractData) return;

    setIsLoading(true);

    try {
      let contractId = editContractId;

      // 1. 계약서 생성 또는 수정 (draft 상태로)
      if (isEdit && editContractId) {
        const response = await fetch(`/api/contracts/${editContractId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(pendingContractData),
        });

        if (!response.ok) {
          throw new Error('계약서 수정에 실패했습니다.');
        }
      } else {
        const response = await fetch('/api/contracts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(pendingContractData),
        });

        if (!response.ok) {
          throw new Error('계약서 생성에 실패했습니다.');
        }

        const contract = await response.json();
        contractId = contract.id;
      }

      // 2. 공급자 서명 추가
      const signResponse = await fetch(`/api/contracts/${contractId}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signatureData }),
      });

      if (!signResponse.ok) {
        throw new Error('서명 저장에 실패했습니다.');
      }

      // 3. 계약서 상태를 'sent'로 변경
      const updateResponse = await fetch(`/api/contracts/${contractId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...pendingContractData, status: 'sent' }),
      });

      if (!updateResponse.ok) {
        throw new Error('계약서 전송에 실패했습니다.');
      }

      setSupplierSignature(signatureData);
      alert(`${clientInfo.name}님께 서명된 계약서가 발송되었습니다!`);

      // 성공 시 처리
      if (isEdit) {
        setInitialFormData({
          contractBasicInfo, clientInfo, supplierInfo, projectInfo,
          contractItems, contractTerms, paymentInfo, legalInfo,
          deliveryInfo, legalClauses, additionalClauses
        });
        setHasUnsavedChanges(false);
      }

      onNavigate('contracts');
    } catch (error) {
      console.error('Contract save error:', error);
      alert(error instanceof Error ? error.message : '계약서 저장에 실패했습니다.');
    } finally {
      setIsLoading(false);
      setPendingContractData(null);
    }
  };

  const handleSaveDraft = async () => {
    // 임시저장시에도 모든 필수항목 검증 적용
    const hasErrors = validateWithTooltips();
    if (hasErrors) {
      return;
    }

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
        ...calculateTotals(),
        status: 'draft',
        ...(initialData?.quoteId && { quote_id: initialData.quoteId }),

        // 법적 필수 요소
        party_a_role: legalInfo.partyARole || null,
        party_b_role: legalInfo.partyBRole || null,
        contract_copies: legalInfo.contractCopies || 2,
        party_a_representative: legalInfo.partyARepresentative || null,
        party_b_representative: legalInfo.partyBRepresentative || null,

        // 통합 결제 정보
        payment_condition: paymentInfo.paymentCondition || null,
        payment_input_unit: paymentInfo.inputUnit || null,
        amount_deposit: paymentInfo.amountDeposit || null,
        amount_milestone: paymentInfo.amountMilestone || null,
        amount_balance: paymentInfo.amountBalance || null,
        percent_deposit: paymentInfo.percentDeposit || null,
        percent_milestone: paymentInfo.percentMilestone || null,
        percent_balance: paymentInfo.percentBalance || null,
        due_deposit: paymentInfo.dueDeposit || null,
        due_milestone: paymentInfo.dueMilestone || null,
        due_balance: paymentInfo.dueBalance || null,
        bank_name: paymentInfo.bankName || null,
        bank_account_number: paymentInfo.bankAccountNumber || null,
        bank_account_holder: paymentInfo.bankAccountHolder || null,

        // 계약 이행 조건
        delivery_conditions: deliveryInfo.deliveryConditions || null,
        delivery_location: deliveryInfo.deliveryLocation || null,
        delivery_deadline: deliveryInfo.deliveryDeadline || null,
        warranty_period: deliveryInfo.warrantyPeriod || null,
        warranty_scope: deliveryInfo.warrantyScope || null,

        // 법적 보호 조항
        nda_clause: legalClauses.ndaClause || null,
        termination_conditions: legalClauses.terminationConditions || null,
        dispute_resolution: legalClauses.disputeResolution || null,
        jurisdiction_court: legalClauses.jurisdictionCourt || null,
        force_majeure_clause: legalClauses.forceMajeureClause || null,

        // 추가 조항
        renewal_conditions: additionalClauses.renewalConditions || null,
        amendment_procedure: additionalClauses.amendmentProcedure || null,
        assignment_prohibition: additionalClauses.assignmentProhibition || null,
        special_terms: additionalClauses.specialTerms || null,
        penalty_clause: additionalClauses.penaltyClause || null
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

      // 성공 시 처리

      if (isEdit) {
        setInitialFormData({
          contractBasicInfo, clientInfo, supplierInfo, projectInfo,
          contractItems, contractTerms, paymentInfo, legalInfo,
          deliveryInfo, legalClauses, additionalClauses
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
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="outline" onClick={handleBackClick} className="border-border w-fit">
          <ArrowLeft className="w-4 h-4 mr-2" />
          돌아가기
        </Button>
        <div className="sm:text-right">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-medium text-foreground">
            {isEdit ? '계약서 수정' : '새 계약서 작성'}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            {isEdit ? '계약서 정보를 수정하세요' : (fromQuote ? '견적서 데이터가 자동으로 입력되었습니다. 필요한 정보를 추가 입력하세요.' : '승인된 견적서를 바탕으로 계약서를 작성하세요')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Main Form */}
        <div className="lg:col-span-3 space-y-4 md:space-y-6">
          {/* 견적서에서 온 경우 안내 문구 */}
          {fromQuote && (
            <Card className="p-3 md:p-4 bg-accent border-accent">
              <div className="flex items-center gap-2 text-accent-foreground">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <span className="text-sm font-medium">견적서에서 가져온 정보</span>
              </div>
              <p className="text-xs sm:text-sm text-accent-foreground mt-1">
                견적서 데이터가 자동으로 입력되었습니다. 필요한 항목을 수정하거나 추가 정보를 입력하세요.
              </p>
            </Card>
          )}

          {/* 1. 계약서 기본 정보 */}
          <Card className="p-4 md:p-6 bg-card border-border">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
              <h3 className="font-medium text-foreground">계약서 기본 정보</h3>
              {!isEdit && (
                <Button variant="outline" size="sm" onClick={handleLoadQuote} className="border-border w-fit">
                  견적서 불러오기
                </Button>
              )}
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contractTitle" className="text-foreground">계약서 제목 *</Label>
                <div className="relative">
                  <Input
                    ref={titleRef}
                    id="contractTitle"
                    value={contractBasicInfo.title}
                    onChange={(e) => {
                      setContractBasicInfo({...contractBasicInfo, title: e.target.value});
                      if (e.target.value.trim() && fieldTooltips.title) {
                        hideFieldTooltip('title');
                      }
                    }}
                    placeholder="웹사이트 리뉴얼 프로젝트 용역계약서"
                    className="bg-input-background border-border"
                  />
                  {fieldTooltips.title && (
                    <div className="absolute z-50 px-2 py-1 text-xs text-white bg-red-500 rounded shadow-lg -top-8 left-0 whitespace-nowrap pointer-events-none">
                      {fieldTooltips.title}
                    </div>
                  )}
                </div>
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

          {/* 2. 수신자 정보 */}
          <Card className="p-4 md:p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                <h3 className="font-medium text-foreground">발주처 정보</h3>
              </div>
              <div className="flex items-center gap-2">
                <CustomerSelector onCustomerSelect={handleCustomerSelect} />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingClient(!isEditingClient)}
                  className="p-2"
                >
                  <Edit3 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <ClientInfoForm
              clientInfo={clientInfo}
              isEditing={isEditingClient}
              onClientInfoChange={setClientInfo}
              onEditToggle={() => setIsEditingClient(!isEditingClient)}
              hideWrapper={true}
            />
          </Card>

          {/* 3. 공급자 정보 */}
          <SupplierInfoForm
            supplierInfo={supplierInfo}
            isEditing={isEditingSupplier}
            onSupplierInfoChange={setSupplierInfo}
            onEditToggle={() => setIsEditingSupplier(!isEditingSupplier)}
          />

          {/* 4. 프로젝트 정보 */}
          <Card className="p-4 md:p-6 bg-card border-border">
            <h3 className="font-medium mb-4 text-foreground">프로젝트 정보</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-foreground">프로젝트 시작일 *</Label>
                  <div className="relative">
                    <Input
                      ref={startDateRef}
                      id="startDate"
                      type="date"
                      value={projectInfo.startDate}
                      onChange={(e) => {
                        setProjectInfo({...projectInfo, startDate: e.target.value});
                        if (e.target.value && fieldTooltips.startDate) {
                          hideFieldTooltip('startDate');
                        }
                      }}
                      className="bg-input-background border-border"
                    />
                    {fieldTooltips.startDate && (
                      <div className="absolute z-50 px-2 py-1 text-xs text-white bg-red-500 rounded shadow-lg -top-8 left-0 whitespace-nowrap pointer-events-none">
                        {fieldTooltips.startDate}
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate" className="text-foreground">프로젝트 완료일 *</Label>
                  <div className="relative">
                    <Input
                      ref={endDateRef}
                      id="endDate"
                      type="date"
                      value={projectInfo.endDate}
                      onChange={(e) => {
                        setProjectInfo({...projectInfo, endDate: e.target.value});
                        if (e.target.value && fieldTooltips.endDate) {
                          hideFieldTooltip('endDate');
                        }
                      }}
                      className="bg-input-background border-border"
                    />
                    {fieldTooltips.endDate && (
                      <div className="absolute z-50 px-2 py-1 text-xs text-white bg-red-500 rounded shadow-lg -top-8 left-0 whitespace-nowrap pointer-events-none">
                        {fieldTooltips.endDate}
                      </div>
                    )}
                  </div>
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
          <Card className="p-4 md:p-6 bg-card border-border" data-section="contract-items">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
              <h3 className="font-medium text-foreground">계약 내역</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addContractItem}
                className="border-border w-fit"
              >
                <Plus className="w-4 h-4 mr-2" />
                항목 추가
              </Button>
            </div>
            
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-hidden">
                <table className="w-full table-auto">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="px-2 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-1/5">항목명</th>
                      <th className="px-2 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-1/3">설명</th>
                      <th className="px-2 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider w-18 whitespace-nowrap">수량</th>
                      <th className="px-2 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider w-18 whitespace-nowrap">단위</th>
                      <th className="px-2 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider w-36">단가</th>
                      <th className="px-2 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider w-40">금액</th>
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
                            data-item-field="name"
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
                              className="border-0 bg-transparent p-2 h-9 text-sm text-right focus:ring-1 focus:ring-primary focus:bg-muted/30 hover:bg-muted/20 w-24 rounded-sm transition-colors"
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

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {contractItems.map((item, index) => (
                <Card key={item.id} className="p-4 border-border">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-medium text-muted-foreground">항목 {index + 1}</span>
                      {contractItems.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeContractItem(item.id)}
                          className="text-destructive hover:text-destructive p-1 h-6 w-6"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">항목명</Label>
                        <Input
                          value={item.name}
                          onChange={(e) => updateContractItem(item.id, 'name', e.target.value)}
                          placeholder="서비스 또는 상품명"
                          className="mt-1"
                          data-item-field="name"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-xs text-muted-foreground">설명</Label>
                        <Textarea
                          value={item.description}
                          onChange={(e) => updateContractItem(item.id, 'description', e.target.value)}
                          placeholder="항목에 대한 상세한 설명"
                          rows={2}
                          className="mt-1"
                        />
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <Label className="text-xs text-muted-foreground">수량</Label>
                          <Input
                            type="text"
                            value={item.quantity}
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^0-9]/g, '');
                              updateContractItem(item.id, 'quantity', parseInt(value) || 1);
                            }}
                            className="mt-1 text-center"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">단위</Label>
                          <Input
                            type="text"
                            value="개"
                            className="mt-1 text-center"
                            disabled
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">단가</Label>
                          <div className="flex items-center mt-1">
                            <Input
                              type="text"
                              value={item.unit_price ? new Intl.NumberFormat('ko-KR').format(item.unit_price) : ''}
                              onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9]/g, '');
                                updateContractItem(item.id, 'unit_price', parseInt(value) || 0);
                              }}
                              className="text-right pr-8"
                              placeholder="0"
                            />
                            <span className="text-xs text-muted-foreground ml-1">원</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-2 border-t border-border">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">금액</span>
                          <span className="font-semibold text-primary text-lg">
                            {new Intl.NumberFormat('ko-KR').format(item.amount)}원
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
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
          <Card className="p-4 md:p-6 bg-card border-border">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
              <h3 className="font-medium text-foreground">계약 조건</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addTerm}
                className="border-border w-fit"
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

          {/* 7. 결제 정보 (통합) */}
          <Card className="p-4 md:p-6 bg-card border-border">
            <h3 className="font-medium mb-4 text-foreground">결제 정보</h3>

            {/* 인라인 배너 - 필수 입력 누락 안내 */}
            {paymentInfo.paymentCondition === 'custom' && paymentInfo.paymentMethod === 'bank' &&
             (!paymentInfo.bankName.trim() || !paymentInfo.bankAccountNumber.trim() || !paymentInfo.bankAccountHolder.trim()) && (
              <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800 dark:text-amber-200">
                  <p className="font-medium">필수 입력 항목이 누락되었습니다</p>
                  <p className="mt-1">은행명/계좌번호/예금주는 필수 입력입니다.</p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {/* 결제 조건 */}
              <div className="space-y-2">
                <Label className="text-foreground">결제 조건 *</Label>
                <div className="relative">
                  <Select
                    value={paymentInfo.paymentCondition}
                    onValueChange={(value: 'immediate' | 'custom') => {
                      setPaymentInfo({...paymentInfo, paymentCondition: value});
                      if (value && fieldTooltips.paymentCondition) {
                        hideFieldTooltip('paymentCondition');
                      }
                    }}
                  >
                    <SelectTrigger ref={paymentConditionRef} className="bg-input-background border-border">
                      <SelectValue placeholder="결제 조건을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">계약 체결 즉시</SelectItem>
                      <SelectItem value="custom">직접 입력</SelectItem>
                    </SelectContent>
                  </Select>
                  {fieldTooltips.paymentCondition && (
                    <div className="absolute z-50 px-2 py-1 text-xs text-white bg-red-500 rounded shadow-lg -top-8 left-0 whitespace-nowrap pointer-events-none">
                      {fieldTooltips.paymentCondition}
                    </div>
                  )}
                </div>
              </div>

              {/* 직접 입력 선택 시 하위 폼 */}
              {paymentInfo.paymentCondition === 'custom' && (
                <div className="space-y-4 pt-2 border-t border-border">
                  {/* 입력 단위 토글 */}
                  <div className="space-y-2">
                    <Label className="text-foreground">입력 단위</Label>
                    <ToggleGroup
                      type="single"
                      value={paymentInfo.inputUnit}
                      onValueChange={(value: 'amount' | 'percent') => {
                        if (value) handleInputUnitChange(value);
                      }}
                      className="justify-start"
                    >
                      <ToggleGroupItem value="amount" aria-label="금액 단위" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                        금액(원)
                      </ToggleGroupItem>
                      <ToggleGroupItem value="percent" aria-label="비율 단위" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                        비율(%)
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </div>

                  {/* 선금/중도금/잔금 필드 세트 */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* 선금 */}
                    <div className="space-y-2">
                      <Label htmlFor="deposit" className="text-foreground">선금</Label>
                      <Input
                        id="deposit"
                        type="number"
                        min="0"
                        max={paymentInfo.inputUnit === 'percent' ? '100' : undefined}
                        step={paymentInfo.inputUnit === 'percent' ? '0.01' : '1'}
                        value={paymentInfo.inputUnit === 'amount' ? paymentInfo.amountDeposit : paymentInfo.percentDeposit}
                        onChange={(e) => {
                          if (paymentInfo.inputUnit === 'amount') {
                            handleAmountChange('deposit', e.target.value);
                          } else {
                            handlePercentChange('deposit', e.target.value);
                          }
                        }}
                        placeholder={paymentInfo.inputUnit === 'amount' ? '예: 1000000' : '예: 30'}
                        className="bg-input-background border-border"
                      />
                    </div>

                    {/* 중도금 */}
                    <div className="space-y-2">
                      <Label htmlFor="milestone" className="text-foreground">중도금</Label>
                      <Input
                        id="milestone"
                        type="number"
                        min="0"
                        max={paymentInfo.inputUnit === 'percent' ? '100' : undefined}
                        step={paymentInfo.inputUnit === 'percent' ? '0.01' : '1'}
                        value={paymentInfo.inputUnit === 'amount' ? paymentInfo.amountMilestone : paymentInfo.percentMilestone}
                        onChange={(e) => {
                          if (paymentInfo.inputUnit === 'amount') {
                            handleAmountChange('milestone', e.target.value);
                          } else {
                            handlePercentChange('milestone', e.target.value);
                          }
                        }}
                        placeholder={paymentInfo.inputUnit === 'amount' ? '예: 1500000' : '예: 40'}
                        className="bg-input-background border-border"
                      />
                    </div>

                    {/* 잔금 */}
                    <div className="space-y-2">
                      <Label htmlFor="balance" className="text-foreground">잔금</Label>
                      <div className="relative">
                        <Input
                          id="balance"
                          type="number"
                          min="0"
                          max={paymentInfo.inputUnit === 'percent' ? '100' : undefined}
                          step={paymentInfo.inputUnit === 'percent' ? '0.01' : '1'}
                          value={paymentInfo.inputUnit === 'amount' ? paymentInfo.amountBalance : paymentInfo.percentBalance}
                          onChange={(e) => {
                            if (paymentInfo.inputUnit === 'amount') {
                              handleAmountChange('balance', e.target.value);
                            } else {
                              handlePercentChange('balance', e.target.value);
                            }
                          }}
                          placeholder={paymentInfo.inputUnit === 'amount' ? '예: 1500000' : '예: 30'}
                          className={`bg-input-background border-border ${
                            (paymentInfo.inputUnit === 'amount' && fieldTooltips.amountBalance) ||
                            (paymentInfo.inputUnit === 'percent' && fieldTooltips.percentBalance)
                              ? 'border-red-500'
                              : ''
                          }`}
                        />
                        {paymentInfo.inputUnit === 'amount' && fieldTooltips.amountBalance && (
                          <div className="absolute z-50 px-2 py-1 text-xs text-white bg-red-500 rounded shadow-lg -top-8 left-0 whitespace-nowrap pointer-events-none">
                            {fieldTooltips.amountBalance}
                          </div>
                        )}
                        {paymentInfo.inputUnit === 'percent' && fieldTooltips.percentBalance && (
                          <div className="absolute z-50 px-2 py-1 text-xs text-white bg-red-500 rounded shadow-lg -top-8 left-0 whitespace-nowrap pointer-events-none">
                            {fieldTooltips.percentBalance}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 합계 표시 */}
                  {(paymentInfo.amountDeposit || paymentInfo.amountMilestone || paymentInfo.amountBalance ||
                    paymentInfo.percentDeposit || paymentInfo.percentMilestone || paymentInfo.percentBalance) && (
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">
                          {paymentInfo.inputUnit === 'amount' ? '합계' : '합계 비율'}
                        </span>
                        <span className={`font-medium ${
                          (paymentInfo.inputUnit === 'amount' && !validateAmountSum()) ||
                          (paymentInfo.inputUnit === 'percent' && !validatePercentSum())
                            ? 'text-red-500'
                            : 'text-foreground'
                        }`}>
                          {paymentInfo.inputUnit === 'amount' ? (
                            <>
                              {new Intl.NumberFormat('ko-KR').format(
                                (parseFloat(paymentInfo.amountDeposit) || 0) +
                                (parseFloat(paymentInfo.amountMilestone) || 0) +
                                (parseFloat(paymentInfo.amountBalance) || 0)
                              )}원
                              {' / '}
                              {new Intl.NumberFormat('ko-KR').format(calculateTotals().total)}원
                            </>
                          ) : (
                            <>
                              {(
                                (parseFloat(paymentInfo.percentDeposit) || 0) +
                                (parseFloat(paymentInfo.percentMilestone) || 0) +
                                (parseFloat(paymentInfo.percentBalance) || 0)
                              ).toFixed(2)}%
                              {' / 100%'}
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* 지급일 */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dueDeposit" className="text-foreground">
                        선금 지급일
                        {paymentInfo.inputUnit === 'amount' && paymentInfo.amountDeposit && parseFloat(paymentInfo.amountDeposit) > 0 && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                        {paymentInfo.inputUnit === 'percent' && paymentInfo.percentDeposit && parseFloat(paymentInfo.percentDeposit) > 0 && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </Label>
                      <div className="relative">
                        <Input
                          id="dueDeposit"
                          value={paymentInfo.dueDeposit}
                          onChange={(e) => {
                            setPaymentInfo({...paymentInfo, dueDeposit: e.target.value});
                            if (e.target.value.trim() && fieldTooltips.dueDeposit) {
                              hideFieldTooltip('dueDeposit');
                            }
                          }}
                          placeholder="예: 계약 체결 후 7일 이내"
                          className="bg-input-background border-border"
                        />
                        {fieldTooltips.dueDeposit && (
                          <div className="absolute z-50 px-2 py-1 text-xs text-white bg-red-500 rounded shadow-lg -top-8 left-0 whitespace-nowrap pointer-events-none">
                            {fieldTooltips.dueDeposit}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dueMilestone" className="text-foreground">
                        중도금 지급일
                        {paymentInfo.inputUnit === 'amount' && paymentInfo.amountMilestone && parseFloat(paymentInfo.amountMilestone) > 0 && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                        {paymentInfo.inputUnit === 'percent' && paymentInfo.percentMilestone && parseFloat(paymentInfo.percentMilestone) > 0 && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </Label>
                      <div className="relative">
                        <Input
                          id="dueMilestone"
                          value={paymentInfo.dueMilestone}
                          onChange={(e) => {
                            setPaymentInfo({...paymentInfo, dueMilestone: e.target.value});
                            if (e.target.value.trim() && fieldTooltips.dueMilestone) {
                              hideFieldTooltip('dueMilestone');
                            }
                          }}
                          placeholder="예: 중간 검수 후 7일 이내"
                          className="bg-input-background border-border"
                        />
                        {fieldTooltips.dueMilestone && (
                          <div className="absolute z-50 px-2 py-1 text-xs text-white bg-red-500 rounded shadow-lg -top-8 left-0 whitespace-nowrap pointer-events-none">
                            {fieldTooltips.dueMilestone}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dueBalance" className="text-foreground">
                        잔금 지급일
                        {paymentInfo.inputUnit === 'amount' && paymentInfo.amountBalance && parseFloat(paymentInfo.amountBalance) > 0 && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                        {paymentInfo.inputUnit === 'percent' && paymentInfo.percentBalance && parseFloat(paymentInfo.percentBalance) > 0 && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </Label>
                      <div className="relative">
                        <Input
                          id="dueBalance"
                          value={paymentInfo.dueBalance}
                          onChange={(e) => {
                            setPaymentInfo({...paymentInfo, dueBalance: e.target.value});
                            if (e.target.value.trim() && fieldTooltips.dueBalance) {
                              hideFieldTooltip('dueBalance');
                            }
                          }}
                          placeholder="예: 최종 인도 후 7일 이내"
                          className="bg-input-background border-border"
                        />
                        {fieldTooltips.dueBalance && (
                          <div className="absolute z-50 px-2 py-1 text-xs text-white bg-red-500 rounded shadow-lg -top-8 left-0 whitespace-nowrap pointer-events-none">
                            {fieldTooltips.dueBalance}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 결제 방법 */}
                  <div className="space-y-2">
                    <Label className="text-foreground">결제 방법 *</Label>
                    <div className="relative" ref={paymentMethodRef}>
                      <RadioGroup
                        value={paymentInfo.paymentMethod}
                        onValueChange={(value: 'bank' | 'card') => {
                          setPaymentInfo({...paymentInfo, paymentMethod: value});
                          if (value && fieldTooltips.paymentMethod) {
                            hideFieldTooltip('paymentMethod');
                          }
                        }}
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="bank" id="bank" />
                          <Label htmlFor="bank" className="cursor-pointer">계좌이체</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="card" id="card" />
                          <Label htmlFor="card" className="cursor-pointer">카드결제</Label>
                        </div>
                      </RadioGroup>
                      {fieldTooltips.paymentMethod && (
                        <div className="absolute z-50 px-2 py-1 text-xs text-white bg-red-500 rounded shadow-lg -top-8 left-0 whitespace-nowrap pointer-events-none">
                          {fieldTooltips.paymentMethod}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 계좌이체 선택 시 은행 정보 */}
                  {paymentInfo.paymentMethod === 'bank' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-border">
                      <div className="space-y-2">
                        <Label htmlFor="bankName" className="text-foreground">은행명 *</Label>
                        <div className="relative">
                          <Input
                            ref={bankNameRef}
                            id="bankName"
                            value={paymentInfo.bankName}
                            onChange={(e) => {
                              setPaymentInfo({...paymentInfo, bankName: e.target.value});
                              if (e.target.value.trim() && fieldTooltips.bankName) {
                                hideFieldTooltip('bankName');
                              }
                            }}
                            placeholder="예: 국민은행"
                            className="bg-input-background border-border"
                          />
                          {fieldTooltips.bankName && (
                            <div className="absolute z-50 px-2 py-1 text-xs text-white bg-red-500 rounded shadow-lg -top-8 left-0 whitespace-nowrap pointer-events-none">
                              {fieldTooltips.bankName}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bankAccountNumber" className="text-foreground">계좌번호 *</Label>
                        <div className="relative">
                          <Input
                            ref={bankAccountNumberRef}
                            id="bankAccountNumber"
                            value={paymentInfo.bankAccountNumber}
                            onChange={(e) => {
                              setPaymentInfo({...paymentInfo, bankAccountNumber: e.target.value});
                              if (e.target.value.trim() && fieldTooltips.bankAccountNumber) {
                                hideFieldTooltip('bankAccountNumber');
                              }
                            }}
                            placeholder="예: 123-456-789012"
                            className="bg-input-background border-border"
                          />
                          {fieldTooltips.bankAccountNumber && (
                            <div className="absolute z-50 px-2 py-1 text-xs text-white bg-red-500 rounded shadow-lg -top-8 left-0 whitespace-nowrap pointer-events-none">
                              {fieldTooltips.bankAccountNumber}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bankAccountHolder" className="text-foreground">예금주 *</Label>
                        <div className="relative">
                          <Input
                            ref={bankAccountHolderRef}
                            id="bankAccountHolder"
                            value={paymentInfo.bankAccountHolder}
                            onChange={(e) => {
                              setPaymentInfo({...paymentInfo, bankAccountHolder: e.target.value});
                              if (e.target.value.trim() && fieldTooltips.bankAccountHolder) {
                                hideFieldTooltip('bankAccountHolder');
                              }
                            }}
                            placeholder="예: (주)회사명"
                            className="bg-input-background border-border"
                          />
                          {fieldTooltips.bankAccountHolder && (
                            <div className="absolute z-50 px-2 py-1 text-xs text-white bg-red-500 rounded shadow-lg -top-8 left-0 whitespace-nowrap pointer-events-none">
                              {fieldTooltips.bankAccountHolder}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* 9. 계약 이행 조건 */}
          <Card className="p-4 md:p-6 bg-card border-border">
            <h3 className="font-medium mb-4 text-foreground">계약 이행 조건 (선택사항)</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="deliveryConditions" className="text-foreground">인도/납품 조건</Label>
                <Textarea
                  id="deliveryConditions"
                  value={deliveryInfo.deliveryConditions}
                  onChange={(e) => setDeliveryInfo({...deliveryInfo, deliveryConditions: e.target.value})}
                  placeholder="예: 최종 검수 완료 후 5영업일 이내 납품"
                  rows={2}
                  className="bg-input-background border-border"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deliveryLocation" className="text-foreground">납품 장소</Label>
                  <Input
                    id="deliveryLocation"
                    value={deliveryInfo.deliveryLocation}
                    onChange={(e) => setDeliveryInfo({...deliveryInfo, deliveryLocation: e.target.value})}
                    placeholder="예: 수신자 지정 장소"
                    className="bg-input-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deliveryDeadline" className="text-foreground">납품 기한</Label>
                  <Input
                    id="deliveryDeadline"
                    value={deliveryInfo.deliveryDeadline}
                    onChange={(e) => setDeliveryInfo({...deliveryInfo, deliveryDeadline: e.target.value})}
                    placeholder="예: 2025-12-31"
                    className="bg-input-background border-border"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="warrantyPeriod" className="text-foreground">하자보증 기간</Label>
                  <Input
                    id="warrantyPeriod"
                    value={deliveryInfo.warrantyPeriod}
                    onChange={(e) => setDeliveryInfo({...deliveryInfo, warrantyPeriod: e.target.value})}
                    placeholder="예: 납품 후 1년"
                    className="bg-input-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="warrantyScope" className="text-foreground">하자보증 범위</Label>
                  <Input
                    id="warrantyScope"
                    value={deliveryInfo.warrantyScope}
                    onChange={(e) => setDeliveryInfo({...deliveryInfo, warrantyScope: e.target.value})}
                    placeholder="예: 프로그램 오류 수정"
                    className="bg-input-background border-border"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* 10. 법적 보호 조항 */}
          <Card className="p-4 md:p-6 bg-card border-border">
            <h3 className="font-medium mb-4 text-foreground">법적 보호 조항 (선택사항)</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ndaClause" className="text-foreground">비밀유지 조항 (NDA)</Label>
                <Textarea
                  id="ndaClause"
                  value={legalClauses.ndaClause}
                  onChange={(e) => setLegalClauses({...legalClauses, ndaClause: e.target.value})}
                  placeholder="예: 양 당사자는 본 계약과 관련하여 취득한 상대방의 기밀정보를 제3자에게 공개하거나 누설하지 않는다."
                  rows={3}
                  className="bg-input-background border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="terminationConditions" className="text-foreground">계약 해지 조건</Label>
                <Textarea
                  id="terminationConditions"
                  value={legalClauses.terminationConditions}
                  onChange={(e) => setLegalClauses({...legalClauses, terminationConditions: e.target.value})}
                  placeholder="예: 상대방이 계약 의무를 중대하게 위반한 경우 서면 통지 후 14일 이내 시정되지 않으면 해지 가능"
                  rows={3}
                  className="bg-input-background border-border"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="disputeResolution" className="text-foreground">분쟁 해결 방법</Label>
                  <Input
                    id="disputeResolution"
                    value={legalClauses.disputeResolution}
                    onChange={(e) => setLegalClauses({...legalClauses, disputeResolution: e.target.value})}
                    placeholder="예: 중재 또는 조정"
                    className="bg-input-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jurisdictionCourt" className="text-foreground">관할 법원</Label>
                  <Input
                    id="jurisdictionCourt"
                    value={legalClauses.jurisdictionCourt}
                    onChange={(e) => setLegalClauses({...legalClauses, jurisdictionCourt: e.target.value})}
                    placeholder="예: 서울중앙지방법원"
                    className="bg-input-background border-border"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="forceMajeureClause" className="text-foreground">불가항력 조항</Label>
                <Textarea
                  id="forceMajeureClause"
                  value={legalClauses.forceMajeureClause}
                  onChange={(e) => setLegalClauses({...legalClauses, forceMajeureClause: e.target.value})}
                  placeholder="예: 천재지변, 전쟁, 법령 개정 등 불가항력적 사유로 계약 이행이 불가능한 경우 당사자는 책임을 지지 않는다."
                  rows={3}
                  className="bg-input-background border-border"
                />
              </div>
            </div>
          </Card>

          {/* 11. 추가 조항 */}
          <Card className="p-4 md:p-6 bg-card border-border">
            <h3 className="font-medium mb-4 text-foreground">추가 조항 (선택사항)</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="renewalConditions" className="text-foreground">계약 갱신 조건</Label>
                <Textarea
                  id="renewalConditions"
                  value={additionalClauses.renewalConditions}
                  onChange={(e) => setAdditionalClauses({...additionalClauses, renewalConditions: e.target.value})}
                  placeholder="예: 계약 만료 30일 전까지 별도 통지가 없는 경우 동일 조건으로 1년 자동 연장"
                  rows={2}
                  className="bg-input-background border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amendmentProcedure" className="text-foreground">계약 변경/수정 절차</Label>
                <Textarea
                  id="amendmentProcedure"
                  value={additionalClauses.amendmentProcedure}
                  onChange={(e) => setAdditionalClauses({...additionalClauses, amendmentProcedure: e.target.value})}
                  placeholder="예: 계약 내용 변경은 양 당사자의 서면 합의로만 가능하다."
                  rows={2}
                  className="bg-input-background border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignmentProhibition" className="text-foreground">권리/의무 양도 금지</Label>
                <Textarea
                  id="assignmentProhibition"
                  value={additionalClauses.assignmentProhibition}
                  onChange={(e) => setAdditionalClauses({...additionalClauses, assignmentProhibition: e.target.value})}
                  placeholder="예: 당사자는 상대방의 사전 서면 동의 없이 본 계약상 권리와 의무를 제3자에게 양도할 수 없다."
                  rows={2}
                  className="bg-input-background border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialTerms" className="text-foreground">특약 사항</Label>
                <Textarea
                  id="specialTerms"
                  value={additionalClauses.specialTerms}
                  onChange={(e) => setAdditionalClauses({...additionalClauses, specialTerms: e.target.value})}
                  placeholder="기타 특별히 합의된 사항을 입력하세요"
                  rows={3}
                  className="bg-input-background border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="penaltyClause" className="text-foreground">위약금 조항</Label>
                <Textarea
                  id="penaltyClause"
                  value={additionalClauses.penaltyClause}
                  onChange={(e) => setAdditionalClauses({...additionalClauses, penaltyClause: e.target.value})}
                  placeholder="예: 계약 위반 시 계약금액의 10%를 위약금으로 지급한다."
                  rows={2}
                  className="bg-input-background border-border"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Summary Sidebar - Sticky */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <div className="space-y-4 md:space-y-6">
            <Card className="p-4 md:p-6 bg-card border-border shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-primary" />
                <h3 className="font-medium text-foreground">수신자 정보</h3>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground">회사명</p>
                  <p className="text-foreground font-medium">{clientInfo.name || '미입력'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">대표자명</p>
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

            <Card className="p-4 md:p-6 bg-card border-border shadow-lg">
              <h3 className="font-medium mb-4 text-foreground">계약서 발송</h3>
              <div className="space-y-3">
                <Button 
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11 text-sm sm:text-base"
                  onClick={handleSaveAndSend}
                  disabled={isLoading}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  {isLoading ? '처리중...' : (isEdit ? '수정 후 발송' : '계약서 발송')}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full border-border h-11 text-sm sm:text-base"
                  onClick={handleSaveDraft}
                  disabled={isLoading}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? '저장중...' : (isEdit ? '수정사항 저장' : '임시저장')}
                </Button>
              </div>
              
              <div className="mt-4 p-3 bg-accent rounded-lg">
                <p className="text-xs sm:text-sm text-accent-foreground">
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

      {/* 견적서 선택 대화상자 */}
      <Dialog open={showQuoteDialog} onOpenChange={setShowQuoteDialog}>
        <DialogContent className="w-[95vw] max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>견적서 불러오기</DialogTitle>
            <DialogDescription>
              계약서에 적용할 견적서를 선택하세요. 수신자 정보와 계약 항목이 자동으로 입력됩니다.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 max-h-[50vh] overflow-y-auto">
            {loadingQuotes ? (
              <div className="flex justify-center py-8">
                <div className="text-muted-foreground">견적서를 불러오는 중...</div>
              </div>
            ) : quotes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                저장된 견적서가 없습니다.
              </div>
            ) : (
              <div className="grid gap-3">
                {quotes.map((quote) => (
                  <Card 
                    key={quote.id} 
                    className="p-3 md:p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => handleQuoteSelect(quote)}
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground text-sm sm:text-base truncate">견적서 제목: {quote.title}</h3>
                        <div className="mt-1 space-y-1 text-xs sm:text-sm text-muted-foreground">
                          <p className="truncate">고객명: {quote.client_name} ({quote.client_company || '개인'})</p>
                          <p className="truncate">이메일: {quote.client_email}</p>
                          {quote.description && <p className="line-clamp-2">설명: {quote.description}</p>}
                          <p>항목 수: {quote.items?.length || 0}개</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-base sm:text-lg font-medium text-foreground">
                          ₩{quote.subtotal?.toLocaleString() || 0}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {quote.created_at && new Date(quote.created_at).toLocaleDateString()}
                        </div>
                        {quote.status && (
                          <div className={`text-xs px-2 py-1 rounded mt-1 inline-block ${
                            quote.status === 'approved' ? 'bg-green-100 text-green-800' :
                            quote.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {quote.status === 'approved' ? '승인됨' :
                             quote.status === 'sent' ? '전송됨' :
                             '임시저장'}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowQuoteDialog(false)}
            >
              취소
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 공급자 전자서명 모달 */}
      <SupplierSignatureModal
        open={showSignatureModal}
        onClose={() => {
          setShowSignatureModal(false);
          setPendingContractData(null);
        }}
        onConfirm={handleSignatureConfirm}
        supplierName={supplierInfo.name || user?.name || ''}
      />
    </div>
  );
}