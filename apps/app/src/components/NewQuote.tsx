'use client'

import React, { useState, useEffect } from 'react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Separator } from './ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import { ArrowLeft, MessageSquare, Save, AlertTriangle, User, ChevronDown, Mail } from 'lucide-react'
import { QuoteItemsTable } from './QuoteItemsTable'
import { CustomerSelector } from './CustomerSelector'
import { ClientInfoForm, SupplierInfoForm } from './contracts'
import { BankCombobox } from './BankCombobox'
import { useAuth } from '@/contexts/AuthContext'
import { formatPhoneNumber, formatBusinessNumber, formatNumber } from '@/lib/formatters'
import { AuthenticatedApiClient } from '@/lib/api-client'

interface QuoteItem {
  id: number
  name: string
  description: string
  unitPrice: number
  quantity: number
  unit: string
  amount: number
}

interface NewQuoteProps {
  onNavigate: (view: string) => void
  isEdit?: boolean
  editQuoteId?: string
  initialData?: {
    client: {
      name: string
      email: string
      phone: string
      company: string
      businessNumber?: string
      address?: string
      fax?: string
      businessType?: string
      businessCategory?: string
    }
    project: {
      title: string
      notes?: string
    }
    items: Array<{
      id: string
      name: string
      description: string
      quantity: number
      unitPrice: number
      amount: number
    }>
    expiryDate?: string
    supplier?: any
  }
}

export function NewQuote({ onNavigate, isEdit = false, editQuoteId, initialData }: NewQuoteProps) {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [quoteTitle, setQuoteTitle] = useState('')
  const [validUntil, setValidUntil] = useState('')
  const [taxRate, setTaxRate] = useState(10.0) // 기본 세율 10%
  
  // 변경사항 감지 및 확인 팝업 관련 상태
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [initialFormData, setInitialFormData] = useState<any>(null)
  const [isEditingSupplier, setIsEditingSupplier] = useState(false)
  const [isQuoteConditionsOpen, setIsQuoteConditionsOpen] = useState(false)
  const [supplierInfo, setSupplierInfo] = useState({
    name: '',
    email: '',
    phone: '',
    fax: '',
    businessRegistrationNumber: '',
    businessType: '',
    businessCategory: '',
    companyName: '',
    businessName: '',
    businessAddress: '',
    companySealImageUrl: '',
  })

  const [clientInfo, setClientInfo] = useState({
    name: '',
    company: '',
    businessNumber: '',
    phone: '',
    email: '',
    fax: '',
    address: '',
    businessType: '',
    businessCategory: '',
  })

  const [projectInfo, setProjectInfo] = useState({
    title: '',
    description: '',
    dueDate: '',          // ✅ 원본 필드 복원
    notes: '',            // ✅ 원본 필드 복원
  })

  // 결제 정보
  const [paymentInfo, setPaymentInfo] = useState({
    paymentCondition: '',
    paymentMethod: '',
    bankName: '',
    bankAccountNumber: '',
    bankAccountHolder: '',
    paymentDueDate: '',
  })

  // 분할 결제 정보
  const [installmentInfo, setInstallmentInfo] = useState({
    depositRatio: 0,
    interimRatio: 0,
    finalRatio: 0,
    depositAmount: 0,
    interimAmount: 0,
    finalAmount: 0,
    depositDueDate: '',
    interimDueDate: '',
    finalDueDate: '',
  })

  // 분할 결제 입력 모드 ('ratio' 또는 'amount')
  const [installmentInputMode, setInstallmentInputMode] = useState<'ratio' | 'amount'>('ratio')

  // 견적 조건
  const [quoteConditions, setQuoteConditions] = useState({
    deliveryDueDate: '',
    warrantyPeriod: '',
    asConditions: '',
    specialNotes: '',
    disclaimer: '',
  })

  // 할인 정보
  const [discountInfo, setDiscountInfo] = useState({
    discountRate: 0,
    discountAmount: 0,
    promotionCode: '',
    promotionName: '',
  })

  const [items, setItems] = useState<QuoteItem[]>([
    { id: 1, name: '', description: '', unitPrice: 0, quantity: 1, unit: '개', amount: 0 },
  ])

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
            businessType: userData.business_type || '',
            businessCategory: userData.business_category || '',
            companyName: userData.company_name || '',
            businessName: userData.business_name || '',
            businessAddress: userData.business_address || '',
            companySealImageUrl: userData.company_seal_image_url || '',
          })
        }
      } catch (error) {
        console.error('Failed to load user info:', error)
      }
    }

    loadUserInfo()
  }, [user?.id])


  // 초기 폼 데이터 설정 (수정 모드에서만)
  useEffect(() => {
    if (isEdit && initialData) {
      // 공급자 정보 설정
      if (initialData.supplier) {
        setSupplierInfo({
          name: initialData.supplier.name || '',
          email: initialData.supplier.email || '',
          phone: initialData.supplier.phone || '',
          fax: initialData.supplier.fax || '',
          businessRegistrationNumber: initialData.supplier.business_registration_number || '',
          businessType: initialData.supplier.business_type || '',
          businessCategory: initialData.supplier.business_category || '',
          businessName: initialData.supplier.business_name || '',
          companyName: initialData.supplier.company_name || '',
          businessAddress: initialData.supplier.business_address || '',
          companySealImageUrl: initialData.supplier.company_seal_image_url || '',
        })
      }

      // 수신자 정보 설정
      setClientInfo({
        name: initialData.client.name,
        email: initialData.client.email,
        phone: initialData.client.phone,
        company: initialData.client.company,
        businessNumber: initialData.client.businessNumber || '',
        fax: '',
        address: '',
        businessType: '',
        businessCategory: '',
      })

      // 프로젝트 정보 설정
      setProjectInfo({
        title: initialData.project.title,
        description: '',
        dueDate: '',
        notes: initialData.project.notes || '',
      })

      // 견적서 제목 및 유효기간 설정
      setQuoteTitle(initialData.project.title)
      setValidUntil(initialData.expiryDate ? initialData.expiryDate.split('T')[0] : '')

      // 견적 항목 설정
      const loadedItems = initialData.items.map((item, index) => ({
        id: index + 1,
        name: item.name,
        description: item.description,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        unit: '개',
        amount: item.amount
      }))
      setItems(loadedItems)

      // 초기 form data 저장 (변경사항 감지용)
      setInitialFormData({
        clientInfo: {
          name: initialData.client.name,
          email: initialData.client.email,
          phone: initialData.client.phone,
          company: initialData.client.company,
          businessNumber: initialData.client.businessNumber || '',
        },
        projectInfo: {
          title: initialData.project.title,
          description: '',
          dueDate: '',
          notes: initialData.project.notes || '',
        },
        quoteTitle: initialData.project.title,
        validUntil: initialData.expiryDate ? initialData.expiryDate.split('T')[0] : '',
        items: loadedItems,
        supplierInfo: initialData.supplier || supplierInfo
      })
    }
  }, [isEdit, initialData])

  // 변경사항 감지
  useEffect(() => {
    if (!initialFormData || !isEdit) {
      setHasUnsavedChanges(false)
      return
    }

    // Deep comparison을 위한 함수
    const compareObjects = (obj1: any, obj2: any) => {
      try {
        return JSON.stringify(obj1) === JSON.stringify(obj2)
      } catch (error) {
        console.warn('Object comparison failed:', error)
        return true // 에러 발생시 변경사항 없음으로 처리
      }
    }

    const currentFormData = {
      clientInfo,
      projectInfo,
      quoteTitle,
      validUntil,
      items,
      supplierInfo
    }

    const hasChanges = !compareObjects(currentFormData, initialFormData)
    setHasUnsavedChanges(hasChanges)
  }, [clientInfo, projectInfo, quoteTitle, validUntil, items, supplierInfo, initialFormData, isEdit])


  // 페이지 언로드 시 경고 (변경사항이 있을 때)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [hasUnsavedChanges])

  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0)
  const vatAmount = Math.floor(totalAmount * 0.1)
  const finalAmount = totalAmount + vatAmount

  // 총금액 변경 시 금액 모드의 값도 업데이트
  useEffect(() => {
    if (installmentInputMode === 'ratio') {
      setInstallmentInfo(prev => ({
        ...prev,
        depositAmount: Math.floor(finalAmount * prev.depositRatio / 100),
        interimAmount: Math.floor(finalAmount * prev.interimRatio / 100),
        finalAmount: Math.floor(finalAmount * prev.finalRatio / 100),
      }))
    }
  }, [finalAmount, installmentInputMode])

  const handleCustomerSelect = (customer: any) => {
    setClientInfo({
      name: customer.name || '',
      company: customer.company || '',
      businessNumber: customer.business_registration_number || '',
      phone: customer.phone || '',
      email: customer.email || '',
      fax: customer.fax || '',
      address: customer.address || '',
      businessType: customer.business_type || '',
      businessCategory: customer.business_category || '',
    })
    setHasUnsavedChanges(true)
  }

  const formatCurrency = (amount: number) => new Intl.NumberFormat('ko-KR').format(amount)

  // 견적서 완성도 검증 함수
  const isQuoteComplete = (): boolean => {
    // 공급자 정보 필수 필드
    if (!supplierInfo.name.trim() || !supplierInfo.email.trim() || !supplierInfo.phone.trim()) {
      return false
    }

    // 사업자등록번호가 있으면 회사명도 필수
    if (supplierInfo.businessRegistrationNumber.trim() && !supplierInfo.companyName.trim()) {
      return false
    }

    // 수신자 정보 필수 필드
    if (!clientInfo.name.trim() || !clientInfo.email.trim()) {
      return false
    }

    // 견적서 제목 및 유효기간
    if (!quoteTitle.trim() || !validUntil.trim()) {
      return false
    }

    // 항목이 최소 1개 이상이고, 첫 번째 항목이 유효한지 확인
    if (items.length === 0 || !items[0].name.trim() || items[0].amount === 0) {
      return false
    }

    return true
  }

  const saveQuote = async (status: 'draft' | 'saved' | 'sent' = 'draft') => {
    // 분할 결제 유효성 검증 (모든 저장 시 수행)
    if (paymentInfo.paymentCondition === '분할') {
      const totalRatio = installmentInfo.depositRatio + installmentInfo.interimRatio + installmentInfo.finalRatio
      const totalAmount = installmentInfo.depositAmount + installmentInfo.interimAmount + installmentInfo.finalAmount

      if (totalRatio !== 100) {
        alert(`분할 결제 비율의 합계가 100%가 아닙니다.\n현재: ${totalRatio}%\n선금, 중도금, 잔금의 비율을 확인해주세요.`)
        return
      }

      if (totalAmount !== finalAmount) {
        alert(`분할 결제 금액의 합계가 총 견적 금액과 일치하지 않습니다.\n총 견적: ${formatCurrency(finalAmount)}원\n현재 합계: ${formatCurrency(totalAmount)}원\n선금, 중도금, 잔금의 금액을 확인해주세요.`)
        return
      }
    }

    // 발송('sent') 시에만 필수 필드 검증 수행
    if (status === 'sent') {
      // 공급자 정보 필수 필드 검증
      if (!supplierInfo.name.trim()) {
        alert('공급자 대표자명을 입력해주세요.')
        return
      }

      if (!supplierInfo.email.trim()) {
        alert('공급자 이메일을 입력해주세요.')
        return
      }

      if (!supplierInfo.phone.trim()) {
        alert('공급자 연락처를 입력해주세요.')
        return
      }

      // 사업자등록번호가 있으면 회사명도 필수
      if (supplierInfo.businessRegistrationNumber.trim() && !supplierInfo.companyName.trim()) {
        alert('사업자등록번호를 입력하셨다면 회사명도 입력해주세요.')
        return
      }

      // 수신자 정보 필수 필드 검증
      if (!clientInfo.name.trim()) {
        alert('수신자명을 입력해주세요.')
        return
      }

      if (!clientInfo.email.trim()) {
        alert('수신자 이메일을 입력해주세요.')
        return
      }

      if (!quoteTitle.trim()) {
        alert('견적서 제목을 입력해주세요.')
        return
      }

      if (!validUntil.trim()) {
        alert('견적 유효기간을 입력해주세요.')
        return
      }
    }

    // 저장 시 완성도에 따라 상태 자동 결정
    let finalStatus = status
    if (status === 'draft') {
      finalStatus = isQuoteComplete() ? 'saved' : 'draft'
    }

    setIsLoading(true)

    try {
      // 총 소계, 부가세, 총액 계산
      const subtotal = items.reduce((sum, item) => sum + item.amount, 0)
      const tax = Math.round(subtotal * 0.1) // 10% 부가세
      const total = subtotal + tax

      const quoteData = {
        client_name: (clientInfo.name || '').trim(),
        client_email: (clientInfo.email || '').trim() || '',
        client_phone: (clientInfo.phone || '').trim() || '',
        client_company: (clientInfo.company || '').trim() || '',
        client_business_number: (clientInfo.businessNumber || '').trim() || '',
        client_address: (clientInfo.address || '').trim() || '',
        title: (quoteTitle || '').trim() || '견적서',
        issue_date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
        expiry_date: validUntil || '',
        status: finalStatus,
        items: items.map(item => ({
          name: (item.name || '').trim(),
          description: (item.description || '').trim(),
          quantity: item.quantity,
          unit_price: item.unitPrice,
          amount: item.amount,
        })),
        subtotal,
        tax,
        total,
        notes: '',
        // 공급자 정보 추가 (user profile update용)
        supplier_info: {
          name: (supplierInfo.name || '').trim(),
          email: (supplierInfo.email || '').trim(),
          phone: (supplierInfo.phone || '').trim(),
          fax: (supplierInfo.fax || '').trim() || null,
          business_registration_number: (supplierInfo.businessRegistrationNumber || '').trim() || null,
          business_type: (supplierInfo.businessType || '').trim() || null,
          business_category: (supplierInfo.businessCategory || '').trim() || null,
          company_name: (supplierInfo.companyName || '').trim() || null,
          business_name: (supplierInfo.businessName || '').trim() || null,
          business_address: (supplierInfo.businessAddress || '').trim() || null,
          company_seal_image_url: (supplierInfo.companySealImageUrl || '').trim() || null,
        },
        // 결제 정보
        payment_condition: paymentInfo.paymentCondition === '분할'
          ? `분할 (선금 ${installmentInfo.depositRatio}%, 중도금 ${installmentInfo.interimRatio}%, 잔금 ${installmentInfo.finalRatio}%)`
          : (paymentInfo.paymentCondition || '').trim() || null,
        payment_method: (paymentInfo.paymentMethod || '').trim() || null,
        bank_name: (paymentInfo.bankName || '').trim() || null,
        bank_account_number: (paymentInfo.bankAccountNumber || '').trim() || null,
        bank_account_holder: (paymentInfo.bankAccountHolder || '').trim() || null,
        payment_due_date: paymentInfo.paymentCondition === '분할'
          ? null
          : (paymentInfo.paymentDueDate || '').trim() || null,
        // 견적 조건
        delivery_due_date: (quoteConditions.deliveryDueDate || '').trim() || null,
        warranty_period: (quoteConditions.warrantyPeriod || '').trim() || null,
        as_conditions: (quoteConditions.asConditions || '').trim() || null,
        special_notes: (() => {
          let notes = (quoteConditions.specialNotes || '').trim()
          if (paymentInfo.paymentCondition === '분할') {
            const installmentNotes = [
              `\n분할 결제 상세:`,
              installmentInfo.depositDueDate ? `- 선금 (${installmentInfo.depositRatio}%): ${new Date(installmentInfo.depositDueDate).toLocaleDateString('ko-KR')}` : `- 선금: ${installmentInfo.depositRatio}%`,
              installmentInfo.interimDueDate ? `- 중도금 (${installmentInfo.interimRatio}%): ${new Date(installmentInfo.interimDueDate).toLocaleDateString('ko-KR')}` : `- 중도금: ${installmentInfo.interimRatio}%`,
              installmentInfo.finalDueDate ? `- 잔금 (${installmentInfo.finalRatio}%): ${new Date(installmentInfo.finalDueDate).toLocaleDateString('ko-KR')}` : `- 잔금: ${installmentInfo.finalRatio}%`,
            ].join('\n')
            notes = notes ? `${notes}\n${installmentNotes}` : installmentNotes.trim()
          }
          return notes || null
        })(),
        disclaimer: (quoteConditions.disclaimer || '').trim() || null,
        // 할인 정보
        discount_rate: discountInfo.discountRate || 0,
        discount_amount: discountInfo.discountAmount || 0,
        promotion_code: (discountInfo.promotionCode || '').trim() || null,
        promotion_name: (discountInfo.promotionName || '').trim() || null,
      }

      const url = isEdit && editQuoteId ? `/api/quotes/${editQuoteId}` : '/api/quotes'
      const method = isEdit ? 'PUT' : 'POST'
      
      // AuthenticatedApiClient 사용하여 인증된 요청
      const response = method === 'POST'
        ? await AuthenticatedApiClient.post(url, quoteData)
        : await AuthenticatedApiClient.put(url, quoteData)

      console.log('Response status:', response.status)
      console.log('Response headers:', response.headers)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Error response:', errorText)
        
        let errorMessage = 'Failed to save quote'
        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.error || errorMessage
        } catch {
          errorMessage = errorText || errorMessage
        }
        
        throw new Error(errorMessage)
      }

      const savedQuote = await response.json()

      if (finalStatus === 'sent') {
        alert(`${clientInfo.name}님께 카카오톡으로 견적서가 ${isEdit ? '수정되어' : ''} 발송되었습니다!`)
      } else if (finalStatus === 'saved') {
        alert(`견적서가 ${isEdit ? '수정되어' : ''} 저장되었습니다.`)
      } else {
        alert(`견적서가 ${isEdit ? '수정되어' : ''} 임시저장되었습니다.`)
      }

      // 저장 후 변경사항 상태 리셋
      if (isEdit) {
        setInitialFormData({
          clientInfo,
          projectInfo,
          quoteTitle,
          validUntil,
          items,
          supplierInfo
        })
        setHasUnsavedChanges(false)
      }
      
      onNavigate('documents')
    } catch (error) {
      console.error('Error saving quote:', error)
      alert(`견적서 저장 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveAndSend = () => saveQuote('sent')
  const handleSaveDraft = () => saveQuote('draft')

  // 돌아가기 버튼 클릭 핸들러
  const handleBackClick = () => {
    // 수정 모드이고 변경사항이 있을 때만 확인 팝업 표시
    if (isEdit && hasUnsavedChanges) {
      setShowExitConfirm(true)
    } else {
      // 새 작성이거나 변경사항이 없으면 바로 이동
      onNavigate('documents')
    }
  }

  // 저장하고 나가기
  const handleSaveAndExit = async () => {
    setShowExitConfirm(false)
    await saveQuote('draft')
  }

  // 저장하지 않고 나가기
  const handleExitWithoutSaving = () => {
    setShowExitConfirm(false)
    onNavigate('documents')
  }

  // 취소 (계속 작업하기)
  const handleCancelExit = () => {
    setShowExitConfirm(false)
  }

  return (
    <div className="space-y-4 md:space-y-6 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <Button type="button" variant="outline" onClick={handleBackClick} className="border-border w-fit">
          <ArrowLeft className="w-4 h-4 mr-2" />
          돌아가기
        </Button>
        <div>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-medium text-foreground">
            {isEdit ? '견적서 수정' : '새 견적서 작성'}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            {isEdit ? '견적서 정보를 수정하세요' : '고객 정보와 프로젝트 내용을 입력하세요'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6 w-full max-w-full">
        {/* Main Form */}
        <div className="lg:col-span-3 space-y-4 md:space-y-6">
          {/* 견적서 제목 */}
          <Card className="p-4 md:p-6 bg-card border-border">
            <h3 className="font-medium mb-4 text-foreground">견적서 제목</h3>
            <div className="space-y-2">
              <Label htmlFor="quoteTitle" className="text-foreground">제목 *</Label>
              <Input
                id="quoteTitle"
                value={quoteTitle}
                onChange={(e) => setQuoteTitle(e.target.value)}
                placeholder="견적서 제목을 입력하세요 (예: 웹사이트 개발 견적서)"
                className="bg-input-background border-border"
              />
            </div>
          </Card>
          {/* 공급자 정보 */}
          <SupplierInfoForm
            supplierInfo={supplierInfo}
            isEditing={isEditingSupplier}
            onSupplierInfoChange={setSupplierInfo}
            onEditToggle={() => setIsEditingSupplier(!isEditingSupplier)}
          />

          {/* 수신자 정보 */}
          <Card className="p-4 md:p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                <h3 className="font-medium text-foreground">수신자 정보</h3>
              </div>
              <CustomerSelector onCustomerSelect={handleCustomerSelect} />
            </div>
            <ClientInfoForm
              clientInfo={clientInfo}
              isEditing={true}
              onClientInfoChange={setClientInfo}
              onEditToggle={() => {}}
              hideWrapper={true}
            />
          </Card>

          {/* 견적 조건 */}
          <Collapsible open={isQuoteConditionsOpen} onOpenChange={setIsQuoteConditionsOpen}>
            <Card className="p-4 md:p-6 bg-card border-border">
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-foreground">견적 조건 (선택사항)</h3>
                  <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${isQuoteConditionsOpen ? 'rotate-180' : ''}`} />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="deliveryDueDate" className="text-foreground">납품/완료 기한</Label>
                      <Input
                        type="date"
                        id="deliveryDueDate"
                        value={quoteConditions.deliveryDueDate}
                        onChange={(e) => setQuoteConditions({ ...quoteConditions, deliveryDueDate: e.target.value })}
                        className="bg-input-background border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="warrantyPeriod" className="text-foreground">하자보증 기간</Label>
                      <Input
                        id="warrantyPeriod"
                        value={quoteConditions.warrantyPeriod}
                        onChange={(e) => setQuoteConditions({ ...quoteConditions, warrantyPeriod: e.target.value })}
                        placeholder="예: 1년"
                        className="bg-input-background border-border"
                      />
                    </div>
                  </div>
                  <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="asConditions" className="text-foreground">A/S 조건</Label>
                      <Textarea
                        id="asConditions"
                        value={quoteConditions.asConditions}
                        onChange={(e) => setQuoteConditions({ ...quoteConditions, asConditions: e.target.value })}
                        placeholder="A/S 조건을 입력하세요"
                        rows={2}
                        className="bg-input-background border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="specialNotes" className="text-foreground">특기사항</Label>
                      <Textarea
                        id="specialNotes"
                        value={quoteConditions.specialNotes}
                        onChange={(e) => setQuoteConditions({ ...quoteConditions, specialNotes: e.target.value })}
                        placeholder="특기사항을 입력하세요"
                        rows={2}
                        className="bg-input-background border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="disclaimer" className="text-foreground">면책사항</Label>
                      <Textarea
                        id="disclaimer"
                        value={quoteConditions.disclaimer}
                        onChange={(e) => setQuoteConditions({ ...quoteConditions, disclaimer: e.target.value })}
                        placeholder="면책사항을 입력하세요"
                        rows={2}
                        className="bg-input-background border-border"
                      />
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* 견적 항목 테이블 */}
          <QuoteItemsTable
            items={items}
            onItemsChange={setItems}
            validUntil={validUntil}
            onValidUntilChange={setValidUntil}
          />

          {/* 결제 정보 */}
          <Card className="p-4 md:p-6 bg-card border-border">
            <h3 className="font-medium mb-4 text-foreground">결제 정보 (선택사항)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paymentCondition" className="text-foreground">결제 조건</Label>
                <select
                  id="paymentCondition"
                  value={paymentInfo.paymentCondition}
                  onChange={(e) => setPaymentInfo({ ...paymentInfo, paymentCondition: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-border bg-input-background"
                >
                  <option value="">선택하세요</option>
                  <option value="선불">선불</option>
                  <option value="후불">후불</option>
                  <option value="분할">분할</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentMethod" className="text-foreground">결제 방법</Label>
                <select
                  id="paymentMethod"
                  value={paymentInfo.paymentMethod}
                  onChange={(e) => setPaymentInfo({ ...paymentInfo, paymentMethod: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-border bg-input-background"
                >
                  <option value="">선택하세요</option>
                  <option value="계좌이체">계좌이체</option>
                  <option value="카드">카드</option>
                  <option value="현금">현금</option>
                </select>
              </div>
              {paymentInfo.paymentCondition !== '분할' && (
                <div className="space-y-2">
                  <Label htmlFor="paymentDueDate" className="text-foreground">결제 기한</Label>
                  <Input
                    type="date"
                    id="paymentDueDate"
                    value={paymentInfo.paymentDueDate}
                    onChange={(e) => setPaymentInfo({ ...paymentInfo, paymentDueDate: e.target.value })}
                    className="bg-input-background border-border"
                  />
                </div>
              )}
            </div>

            {/* 분할 결제 상세 정보 */}
            {paymentInfo.paymentCondition === '분할' && (
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-foreground">분할 결제 상세</h4>
                  <div className="flex items-center gap-2 text-sm">
                    <button
                      type="button"
                      onClick={() => setInstallmentInputMode('ratio')}
                      className={`px-3 py-1 rounded ${
                        installmentInputMode === 'ratio'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      비율 (%)
                    </button>
                    <button
                      type="button"
                      onClick={() => setInstallmentInputMode('amount')}
                      className={`px-3 py-1 rounded ${
                        installmentInputMode === 'amount'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      금액 (원)
                    </button>
                  </div>
                </div>
                <div className="mb-3 p-3 bg-muted rounded-md">
                  <p className="text-sm text-muted-foreground">
                    총 견적 금액: <span className="font-semibold text-foreground">{formatCurrency(finalAmount)}원</span>
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {/* 선금 */}
                  <div className="space-y-2">
                    <Label htmlFor="depositInput" className="text-foreground">
                      선금 {installmentInputMode === 'ratio' ? '(%)' : '(원)'}
                    </Label>
                    <Input
                      type="text"
                      id="depositInput"
                      value={
                        installmentInputMode === 'ratio'
                          ? installmentInfo.depositRatio
                          : formatCurrency(installmentInfo.depositAmount)
                      }
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/,/g, '')
                        const numValue = Number(rawValue)
                        if (isNaN(numValue)) return

                        if (installmentInputMode === 'ratio') {
                          const value = Math.max(0, Math.min(100, numValue))
                          const depositAmt = Math.floor(finalAmount * value / 100)
                          const remainingRatio = 100 - value - installmentInfo.interimRatio
                          const finalRatio = Math.max(0, remainingRatio)
                          const finalAmt = Math.floor(finalAmount * finalRatio / 100)
                          setInstallmentInfo({
                            ...installmentInfo,
                            depositRatio: value,
                            depositAmount: depositAmt,
                            finalRatio: finalRatio,
                            finalAmount: finalAmt
                          })
                        } else {
                          const amount = Math.max(0, Math.min(finalAmount, numValue))
                          const ratio = finalAmount > 0 ? Math.round((amount / finalAmount) * 100) : 0
                          const finalAmt = Math.max(0, finalAmount - amount - installmentInfo.interimAmount)
                          const finalRatio = finalAmount > 0 ? Math.round((finalAmt / finalAmount) * 100) : 0
                          setInstallmentInfo({
                            ...installmentInfo,
                            depositAmount: amount,
                            depositRatio: ratio,
                            finalAmount: finalAmt,
                            finalRatio: finalRatio
                          })
                        }
                        setHasUnsavedChanges(true)
                      }}
                      className="bg-input-background border-border"
                    />
                    <p className="text-xs text-muted-foreground">
                      {installmentInputMode === 'ratio'
                        ? `금액: ${formatCurrency(installmentInfo.depositAmount)}원`
                        : `비율: ${installmentInfo.depositRatio}%`}
                    </p>
                  </div>
                  {/* 중도금 */}
                  <div className="space-y-2">
                    <Label htmlFor="interimInput" className="text-foreground">
                      중도금 {installmentInputMode === 'ratio' ? '(%)' : '(원)'}
                    </Label>
                    <Input
                      type="text"
                      id="interimInput"
                      value={
                        installmentInputMode === 'ratio'
                          ? installmentInfo.interimRatio
                          : formatCurrency(installmentInfo.interimAmount)
                      }
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/,/g, '')
                        const numValue = Number(rawValue)
                        if (isNaN(numValue)) return

                        if (installmentInputMode === 'ratio') {
                          const value = Math.max(0, Math.min(100, numValue))
                          const interimAmt = Math.floor(finalAmount * value / 100)
                          const remainingRatio = 100 - installmentInfo.depositRatio - value
                          const finalRatio = Math.max(0, remainingRatio)
                          const finalAmt = Math.floor(finalAmount * finalRatio / 100)
                          setInstallmentInfo({
                            ...installmentInfo,
                            interimRatio: value,
                            interimAmount: interimAmt,
                            finalRatio: finalRatio,
                            finalAmount: finalAmt
                          })
                        } else {
                          const amount = Math.max(0, Math.min(finalAmount, numValue))
                          const ratio = finalAmount > 0 ? Math.round((amount / finalAmount) * 100) : 0
                          const finalAmt = Math.max(0, finalAmount - installmentInfo.depositAmount - amount)
                          const finalRatio = finalAmount > 0 ? Math.round((finalAmt / finalAmount) * 100) : 0
                          setInstallmentInfo({
                            ...installmentInfo,
                            interimAmount: amount,
                            interimRatio: ratio,
                            finalAmount: finalAmt,
                            finalRatio: finalRatio
                          })
                        }
                        setHasUnsavedChanges(true)
                      }}
                      className="bg-input-background border-border"
                    />
                    <p className="text-xs text-muted-foreground">
                      {installmentInputMode === 'ratio'
                        ? `금액: ${formatCurrency(installmentInfo.interimAmount)}원`
                        : `비율: ${installmentInfo.interimRatio}%`}
                    </p>
                  </div>
                  {/* 잔금 */}
                  <div className="space-y-2">
                    <Label htmlFor="finalInput" className="text-foreground">
                      잔금 {installmentInputMode === 'ratio' ? '(%)' : '(원)'}
                    </Label>
                    <Input
                      type="text"
                      id="finalInput"
                      value={
                        installmentInputMode === 'ratio'
                          ? installmentInfo.finalRatio
                          : formatCurrency(installmentInfo.finalAmount)
                      }
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/,/g, '')
                        const numValue = Number(rawValue)
                        if (isNaN(numValue)) return

                        if (installmentInputMode === 'ratio') {
                          const value = Math.max(0, Math.min(100, numValue))
                          const amount = Math.floor(finalAmount * value / 100)
                          setInstallmentInfo({ ...installmentInfo, finalRatio: value, finalAmount: amount })
                        } else {
                          const amount = Math.max(0, Math.min(finalAmount, numValue))
                          const ratio = finalAmount > 0 ? Math.round((amount / finalAmount) * 100) : 0
                          setInstallmentInfo({ ...installmentInfo, finalAmount: amount, finalRatio: ratio })
                        }
                        setHasUnsavedChanges(true)
                      }}
                      className={`bg-input-background border-border ${
                        (() => {
                          const totalRatio = installmentInfo.depositRatio + installmentInfo.interimRatio + installmentInfo.finalRatio
                          const totalAmount = installmentInfo.depositAmount + installmentInfo.interimAmount + installmentInfo.finalAmount
                          const isInvalidRatio = installmentInputMode === 'ratio' && totalRatio !== 100
                          const isInvalidAmount = installmentInputMode === 'amount' && totalAmount !== finalAmount
                          return (isInvalidRatio || isInvalidAmount) ? 'border-red-500' : ''
                        })()
                      }`}
                    />
                    <p className="text-xs text-muted-foreground">
                      {installmentInputMode === 'ratio'
                        ? `금액: ${formatCurrency(installmentInfo.finalAmount)}원`
                        : `비율: ${installmentInfo.finalRatio}%`}
                    </p>
                    {(() => {
                      if (installmentInputMode === 'ratio') {
                        const expectedRatio = 100 - installmentInfo.depositRatio - installmentInfo.interimRatio
                        if (installmentInfo.finalRatio !== expectedRatio) {
                          return (
                            <p className="text-xs text-red-600 dark:text-red-400">
                              올바른 비율: {expectedRatio}%
                            </p>
                          )
                        }
                      } else {
                        const expectedAmount = finalAmount - installmentInfo.depositAmount - installmentInfo.interimAmount
                        if (installmentInfo.finalAmount !== expectedAmount) {
                          return (
                            <p className="text-xs text-red-600 dark:text-red-400">
                              올바른 금액: {formatCurrency(expectedAmount)}원
                            </p>
                          )
                        }
                      }
                      return null
                    })()}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="depositDueDate" className="text-foreground">선금 지급일</Label>
                    <Input
                      type="date"
                      id="depositDueDate"
                      value={installmentInfo.depositDueDate}
                      onChange={(e) => {
                        setInstallmentInfo({ ...installmentInfo, depositDueDate: e.target.value })
                        setHasUnsavedChanges(true)
                      }}
                      className={`bg-input-background border-border ${
                        (() => {
                          if (!installmentInfo.depositDueDate) return ''
                          if (installmentInfo.interimDueDate && installmentInfo.depositDueDate > installmentInfo.interimDueDate) return 'border-red-500'
                          if (installmentInfo.finalDueDate && installmentInfo.depositDueDate > installmentInfo.finalDueDate) return 'border-red-500'
                          return ''
                        })()
                      }`}
                    />
                    {(() => {
                      if (!installmentInfo.depositDueDate) return null
                      if (installmentInfo.interimDueDate && installmentInfo.depositDueDate > installmentInfo.interimDueDate) {
                        return <p className="text-xs text-red-600 dark:text-red-400">선금 지급일은 중도금 지급일보다 빠르거나 같아야 합니다</p>
                      }
                      if (installmentInfo.finalDueDate && installmentInfo.depositDueDate > installmentInfo.finalDueDate) {
                        return <p className="text-xs text-red-600 dark:text-red-400">선금 지급일은 잔금 지급일보다 빠르거나 같아야 합니다</p>
                      }
                      return null
                    })()}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="interimDueDate" className="text-foreground">중도금 지급일</Label>
                    <Input
                      type="date"
                      id="interimDueDate"
                      value={installmentInfo.interimDueDate}
                      onChange={(e) => {
                        setInstallmentInfo({ ...installmentInfo, interimDueDate: e.target.value })
                        setHasUnsavedChanges(true)
                      }}
                      className={`bg-input-background border-border ${
                        (() => {
                          if (!installmentInfo.interimDueDate) return ''
                          if (installmentInfo.depositDueDate && installmentInfo.interimDueDate < installmentInfo.depositDueDate) return 'border-red-500'
                          if (installmentInfo.finalDueDate && installmentInfo.interimDueDate > installmentInfo.finalDueDate) return 'border-red-500'
                          return ''
                        })()
                      }`}
                    />
                    {(() => {
                      if (!installmentInfo.interimDueDate) return null
                      if (installmentInfo.depositDueDate && installmentInfo.interimDueDate < installmentInfo.depositDueDate) {
                        return <p className="text-xs text-red-600 dark:text-red-400">중도금 지급일은 선금 지급일보다 늦거나 같아야 합니다</p>
                      }
                      if (installmentInfo.finalDueDate && installmentInfo.interimDueDate > installmentInfo.finalDueDate) {
                        return <p className="text-xs text-red-600 dark:text-red-400">중도금 지급일은 잔금 지급일보다 빠르거나 같아야 합니다</p>
                      }
                      return null
                    })()}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="finalDueDate" className="text-foreground">잔금 지급일</Label>
                    <Input
                      type="date"
                      id="finalDueDate"
                      value={installmentInfo.finalDueDate}
                      onChange={(e) => {
                        setInstallmentInfo({ ...installmentInfo, finalDueDate: e.target.value })
                        setHasUnsavedChanges(true)
                      }}
                      className={`bg-input-background border-border ${
                        (() => {
                          if (!installmentInfo.finalDueDate) return ''
                          if (installmentInfo.depositDueDate && installmentInfo.finalDueDate < installmentInfo.depositDueDate) return 'border-red-500'
                          if (installmentInfo.interimDueDate && installmentInfo.finalDueDate < installmentInfo.interimDueDate) return 'border-red-500'
                          return ''
                        })()
                      }`}
                    />
                    {(() => {
                      if (!installmentInfo.finalDueDate) return null
                      if (installmentInfo.depositDueDate && installmentInfo.finalDueDate < installmentInfo.depositDueDate) {
                        return <p className="text-xs text-red-600 dark:text-red-400">잔금 지급일은 선금 지급일보다 늦거나 같아야 합니다</p>
                      }
                      if (installmentInfo.interimDueDate && installmentInfo.finalDueDate < installmentInfo.interimDueDate) {
                        return <p className="text-xs text-red-600 dark:text-red-400">잔금 지급일은 중도금 지급일보다 늦거나 같아야 합니다</p>
                      }
                      return null
                    })()}
                  </div>
                </div>
              </div>
            )}

            {paymentInfo.paymentMethod === '계좌이체' && (
              <div className="mt-4 pt-4 border-t border-border">
                <h4 className="font-medium mb-3 text-foreground">입금 계좌 정보</h4>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="space-y-2 md:col-span-4">
                    <Label htmlFor="bankName" className="text-foreground">은행명 *</Label>
                    <BankCombobox
                      value={paymentInfo.bankName}
                      onChange={(value) => setPaymentInfo({ ...paymentInfo, bankName: value })}
                      placeholder="은행을 선택하세요"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-5">
                    <Label htmlFor="bankAccountNumber" className="text-foreground">계좌번호 *</Label>
                    <Input
                      id="bankAccountNumber"
                      value={paymentInfo.bankAccountNumber}
                      onChange={(e) => setPaymentInfo({ ...paymentInfo, bankAccountNumber: e.target.value })}
                      placeholder="계좌번호 입력"
                      className="bg-input-background border-border"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-3">
                    <Label htmlFor="bankAccountHolder" className="text-foreground">예금주 *</Label>
                    <Input
                      id="bankAccountHolder"
                      value={paymentInfo.bankAccountHolder}
                      onChange={(e) => setPaymentInfo({ ...paymentInfo, bankAccountHolder: e.target.value })}
                      placeholder="예금주명 입력"
                      className="bg-input-background border-border"
                    />
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* 최종 견적 */}
          <Card className="p-4 md:p-6 bg-card border-border">
            <h3 className="font-medium mb-4 text-foreground">최종 견적</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-muted-foreground">총 합계</span>
                <span className="font-mono font-medium">{new Intl.NumberFormat('ko-KR').format(totalAmount)}원</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="finalDiscountRate" className="text-muted-foreground">할인율</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    id="finalDiscountRate"
                    value={discountInfo.discountRate || ''}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0
                      const rounded = Math.round(value * 10) / 10
                      setDiscountInfo({ ...discountInfo, discountRate: rounded })
                    }}
                    onWheel={(e) => e.currentTarget.blur()}
                    placeholder="0"
                    min="0"
                    max="100"
                    step="1"
                    className="bg-input-background border-border w-24 h-8 text-right text-sm"
                  />
                  <span className="text-muted-foreground">%</span>
                </div>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-muted-foreground">할인 금액</span>
                <span className="font-mono font-medium text-red-500">
                  -{new Intl.NumberFormat('ko-KR').format(Math.floor(totalAmount * (discountInfo.discountRate / 100)))}원
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-muted-foreground">공급가액</span>
                <span className="font-mono font-medium">
                  {new Intl.NumberFormat('ko-KR').format(totalAmount - Math.floor(totalAmount * (discountInfo.discountRate / 100)))}원
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-muted-foreground">VAT (10%)</span>
                <span className="font-mono font-medium">
                  {new Intl.NumberFormat('ko-KR').format(Math.floor((totalAmount - Math.floor(totalAmount * (discountInfo.discountRate / 100))) * 0.1))}원
                </span>
              </div>
              <div className="flex justify-between items-center py-3 bg-primary/5 rounded-lg px-3">
                <span className="font-semibold text-foreground">최종 견적</span>
                <span className="font-mono font-bold text-primary text-xl">
                  {new Intl.NumberFormat('ko-KR').format(
                    totalAmount - Math.floor(totalAmount * (discountInfo.discountRate / 100)) +
                    Math.floor((totalAmount - Math.floor(totalAmount * (discountInfo.discountRate / 100))) * 0.1)
                  )}원
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Action Sidebar - Sticky */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <Card className="p-4 md:p-6 bg-card border-border shadow-lg">
            <h3 className="font-medium mb-3 text-foreground">발송 옵션</h3>
            <div className="space-y-3">
              <Button
                type="button"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11 text-sm sm:text-base"
                onClick={handleSaveAndSend}
                disabled={Boolean(isLoading || !supplierInfo.name || !supplierInfo.email || !supplierInfo.phone || !clientInfo.name || !clientInfo.company || !clientInfo.phone || !clientInfo.email || quoteTitle.trim() === '' || validUntil.trim() === '' || (supplierInfo.businessRegistrationNumber && !supplierInfo.companyName))}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                {isLoading ? '발송 중...' : '카카오톡으로 발송'}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full border-border h-11 text-sm sm:text-base"
                onClick={handleSaveAndSend}
                disabled={Boolean(isLoading || !supplierInfo.name || !supplierInfo.email || !supplierInfo.phone || !clientInfo.name || !clientInfo.company || !clientInfo.phone || !clientInfo.email || quoteTitle.trim() === '' || validUntil.trim() === '' || (supplierInfo.businessRegistrationNumber && !supplierInfo.companyName))}
              >
                <Mail className="w-4 h-4 mr-2" />
                {isLoading ? '발송 중...' : '이메일로 발송'}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full border-border h-11 text-sm sm:text-base"
                onClick={handleSaveDraft}
                disabled={isLoading || (isEdit && !hasUnsavedChanges)}
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? '저장 중...' : '저장'}
              </Button>
            </div>

            <div className="mt-4 p-3 bg-accent rounded-lg">
              <p className="text-xs sm:text-sm text-accent-foreground">
                💡 견적서가 카카오톡 또는 이메일로 발송되면 고객이 바로 확인하고 승인할 수 있습니다.
              </p>
            </div>
          </Card>
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
  )
}