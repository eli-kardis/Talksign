'use client'

import React, { useState, useEffect } from 'react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Separator } from './ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog'
import { ArrowLeft, MessageSquare, Save, AlertTriangle, User } from 'lucide-react'
import { QuoteItemsTable } from './QuoteItemsTable'
import { CustomerSelector } from './CustomerSelector'
import { ClientInfoForm, SupplierInfoForm } from './contracts'
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
    }
    project: {
      title: string
      description: string
    }
    items: Array<{
      id: string
      description: string
      amount: number
    }>
    taxRate: number
    expiresAt: string
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
  const [supplierInfo, setSupplierInfo] = useState({
    name: '',
    email: '',
    phone: '',
    businessRegistrationNumber: '',
    companyName: '',
    businessName: '',
  })
  
  const [clientInfo, setClientInfo] = useState({
    name: '',
    company: '',
    businessNumber: '',
    phone: '',
    email: '',
    address: '',
  })

  const [projectInfo, setProjectInfo] = useState({
    title: '',
    description: '',
    dueDate: '',          // ✅ 원본 필드 복원
    notes: '',            // ✅ 원본 필드 복원
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
  }, [user?.id])


  // 수정 모드일 때 초기 데이터 설정
  useEffect(() => {
    if (isEdit && initialData) {
      const newClientInfo = {
        name: initialData.client.name,
        email: initialData.client.email,
        phone: initialData.client.phone,
        company: initialData.client.company,
        businessNumber: initialData.client.businessNumber || '',
        address: initialData.client.address || '',
      }
      
      const newProjectInfo = {
        title: initialData.project.title,
        description: initialData.project.description,
        dueDate: '',
        notes: '',
      }

      const newQuoteTitle = initialData.project.title
      const newValidUntil = initialData.expiresAt ? initialData.expiresAt.split('T')[0] : ''
      
      // items 변환
      const transformedItems = initialData.items.map((item, index) => ({
        id: index + 1,
        name: item.description,
        description: item.description,
        unitPrice: item.amount,
        quantity: 1,
        unit: '개',
        amount: item.amount
      }))
      
      setClientInfo(newClientInfo)
      setProjectInfo(newProjectInfo)
      setQuoteTitle(newQuoteTitle)
      setValidUntil(newValidUntil)
      
      if (transformedItems.length > 0) {
        setItems(transformedItems)
      }
    }
  }, [isEdit, initialData])

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
          businessNumber: initialData.client.businessNumber || '',
          address: initialData.client.address || '',
        },
        projectInfo: {
          title: initialData.project.title,
          description: initialData.project.description,
          dueDate: '',
          notes: '',
        },
        quoteTitle: initialData.project.title,
        validUntil: initialData.expiresAt ? initialData.expiresAt.split('T')[0] : '',
        items: initialData.items.map((item, index) => ({
          id: index + 1,
          name: item.description,
          description: item.description,
          unitPrice: item.amount,
          quantity: 1,
          unit: '개',
          amount: item.amount
        })),
        supplierInfo
      })
    }
  }, [isEdit, initialData, supplierInfo.name])

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

  const handleCustomerSelect = (customer: any) => {
    setClientInfo({
      name: customer.name || '',
      company: customer.company || '',
      businessNumber: customer.business_registration_number || '',
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || '',
    })
    setHasUnsavedChanges(true)
  }

  const formatCurrency = (amount: number) => new Intl.NumberFormat('ko-KR').format(amount)

  const saveQuote = async (status: 'draft' | 'sent' = 'draft') => {
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

    // 고객 정보 필수 필드 검증
    if (!clientInfo.name.trim()) {
      alert('고객명을 입력해주세요.')
      return
    }
    
    if (!clientInfo.email.trim()) {
      alert('고객 이메일을 입력해주세요.')
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
        title: (quoteTitle || '').trim() || '견적서',
        issue_date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
        expiry_date: validUntil || '',
        status,
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
          business_registration_number: (supplierInfo.businessRegistrationNumber || '').trim() || null,
          company_name: (supplierInfo.companyName || '').trim() || null,
          business_name: (supplierInfo.businessName || '').trim() || null,
        },
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
      
      if (status === 'sent') {
        alert(`${clientInfo.name}님께 카카오톡으로 견적서가 ${isEdit ? '수정되어' : ''} 발송되었습니다!`)
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
    <div className="space-y-4 md:space-y-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
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

          {/* 고객 정보 */}
          <Card className="p-4 md:p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                <h3 className="font-medium text-foreground">고객 정보</h3>
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


          {/* 견적 항목 테이블 */}
          <QuoteItemsTable 
            items={items} 
            onItemsChange={setItems}
            validUntil={validUntil}
            onValidUntilChange={setValidUntil}
          />
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
                onClick={handleSaveDraft}
                disabled={isLoading || (isEdit && !hasUnsavedChanges)}
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? '저장 중...' : '임시저장'}
              </Button>
            </div>

            <div className="mt-4 p-3 bg-accent rounded-lg">
              <p className="text-xs sm:text-sm text-accent-foreground">
                💡 견적서가 카카오톡으로 발송되면 고객이 바로 확인하고 승인할 수 있습니다.
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