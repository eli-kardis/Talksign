'use client'

import React, { useState, useEffect } from 'react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Separator } from './ui/separator'
import { ArrowLeft, MessageSquare, Save } from 'lucide-react'
import { QuoteItemsTable } from './QuoteItemsTable'
import { useAuth } from '@/contexts/AuthContext'
import { formatPhoneNumber, formatBusinessNumber, formatNumber } from '@/lib/formatters'

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
}

export function NewQuote({ onNavigate }: NewQuoteProps) {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [quoteTitle, setQuoteTitle] = useState('')
  const [validUntil, setValidUntil] = useState('')
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
    logoUrl: '',          // ✅ Cursor 보강 유지
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

  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0)
  const vatAmount = Math.floor(totalAmount * 0.1)
  const finalAmount = totalAmount + vatAmount

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

    setIsLoading(true)

    try {
      const quoteData = {
        client_name: clientInfo.name.trim(),
        client_email: clientInfo.email.trim(),
        client_phone: clientInfo.phone.trim() || null,
        client_company: clientInfo.company.trim() || null,
        title: quoteTitle.trim() || '견적서',
        description: null,
        valid_until: validUntil || null,
        items: items.map(item => ({
          id: item.id,
          name: item.name.trim(),
          description: item.description.trim(),
          unit_price: item.unitPrice,
          quantity: item.quantity,
          unit: item.unit.trim(),
          amount: item.amount
        })),
        status,
        // 공급자 정보 추가
        supplier_info: {
          name: supplierInfo.name.trim(),
          email: supplierInfo.email.trim(),
          phone: supplierInfo.phone.trim(),
          business_registration_number: supplierInfo.businessRegistrationNumber.trim() || null,
          company_name: supplierInfo.companyName.trim() || null,
          business_name: supplierInfo.businessName.trim() || null,
        },
        // 추가 메타데이터 (필요시)
        client_business_number: clientInfo.businessNumber.trim() || null,
        client_address: clientInfo.address.trim() || null,
        client_logo_url: clientInfo.logoUrl.trim() || null,
        due_date: null,
        notes: null,
      }

      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quoteData),
      })

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
        alert(`${clientInfo.name}님께 카카오톡으로 견적서가 발송되었습니다!`)
      } else {
        alert('견적서가 임시저장되었습니다.')
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button type="button" variant="outline" onClick={() => onNavigate('documents')} className="border-border">
          <ArrowLeft className="w-4 h-4 mr-2" />
          돌아가기
        </Button>
        <div>
          <h2 className="text-2xl font-medium text-foreground">새 견적서 작성</h2>
          <p className="text-muted-foreground">고객 정보와 프로젝트 내용을 입력하세요</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* 견적서 제목 */}
          <Card className="p-6 bg-card border-border">
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
          <Card className="p-6 bg-card border-border">
            <h3 className="font-medium mb-4 text-foreground">공급자 정보 (본인)</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supplierName" className="text-foreground">대표자명 *</Label>
                <Input
                  id="supplierName"
                  value={supplierInfo.name}
                  onChange={(e) => setSupplierInfo({ ...supplierInfo, name: e.target.value })}
                  placeholder="홍길동"
                  className="bg-input-background border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplierEmail" className="text-foreground">이메일 *</Label>
                <Input
                  id="supplierEmail"
                  type="email"
                  value={supplierInfo.email}
                  onChange={(e) => setSupplierInfo({ ...supplierInfo, email: e.target.value })}
                  placeholder="supplier@example.com"
                  className="bg-input-background border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplierPhone" className="text-foreground">연락처 *</Label>
                <Input
                  id="supplierPhone"
                  value={supplierInfo.phone}
                  onChange={(e) => setSupplierInfo({ ...supplierInfo, phone: formatPhoneNumber(e.target.value) })}
                  placeholder="010-1234-5678"
                  className="bg-input-background border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplierBusinessNumber" className="text-foreground">사업자등록번호</Label>
                <Input
                  id="supplierBusinessNumber"
                  value={supplierInfo.businessRegistrationNumber}
                  onChange={(e) => setSupplierInfo({ ...supplierInfo, businessRegistrationNumber: formatBusinessNumber(e.target.value) })}
                  placeholder="123-12-12345"
                  className="bg-input-background border-border"
                />
              </div>

              {supplierInfo.businessRegistrationNumber && (
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="supplierCompanyName" className="text-foreground">회사명 *</Label>
                  <Input
                    id="supplierCompanyName"
                    value={supplierInfo.companyName}
                    onChange={(e) => setSupplierInfo({ ...supplierInfo, companyName: e.target.value })}
                    placeholder="(주)회사명 또는 개인사업자명"
                    className="bg-input-background border-border"
                  />
                </div>
              )}
            </div>

            <div className="mt-4 p-3 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">
                💡 이 정보는 견적서와 계약서에 공급자 정보로 자동 삽입됩니다. 필요시 수정하세요.
              </p>
            </div>
          </Card>

          {/* 고객 정보 */}
          <Card className="p-6 bg-card border-border">
            <h3 className="font-medium mb-4 text-foreground">고객 정보</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientName" className="text-foreground">고객명 *</Label>
                <Input
                  id="clientName"
                  value={clientInfo.name}
                  onChange={(e) => setClientInfo({ ...clientInfo, name: e.target.value })}
                  placeholder="홍길동"
                  className="bg-input-background border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company" className="text-foreground">회사명</Label>
                <Input
                  id="company"
                  value={clientInfo.company}
                  onChange={(e) => setClientInfo({ ...clientInfo, company: e.target.value })}
                  placeholder="(주)회사명"
                  className="bg-input-background border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessNumber" className="text-foreground">사업자번호</Label>
                <Input
                  id="businessNumber"
                  value={clientInfo.businessNumber}
                  onChange={(e) => setClientInfo({ ...clientInfo, businessNumber: formatBusinessNumber(e.target.value) })}
                  placeholder="123-45-67890"
                  className="bg-input-background border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-foreground">연락처 *</Label>
                <Input
                  id="phone"
                  value={clientInfo.phone}
                  onChange={(e) => setClientInfo({ ...clientInfo, phone: formatPhoneNumber(e.target.value) })}
                  placeholder="010-1234-5678"
                  className="bg-input-background border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  value={clientInfo.email}
                  onChange={(e) => setClientInfo({ ...clientInfo, email: e.target.value })}
                  placeholder="client@example.com"
                  className="bg-input-background border-border"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address" className="text-foreground">주소</Label>
                <Input
                  id="address"
                  value={clientInfo.address}
                  onChange={(e) => setClientInfo({ ...clientInfo, address: e.target.value })}
                  placeholder="도로명 주소"
                  className="bg-input-background border-border"
                />
              </div>
            </div>
          </Card>


          {/* 견적 항목 테이블 */}
          <QuoteItemsTable 
            items={items} 
            onItemsChange={setItems}
            validUntil={validUntil}
            onValidUntilChange={setValidUntil}
          />
        </div>

        {/* Action Sidebar */}
        <div className="space-y-6">
          <Card className="p-6 bg-card border-border">
            <h3 className="font-medium mb-4 text-foreground">발송 옵션</h3>
            <div className="space-y-3">
              <Button
                type="button"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={handleSaveAndSend}
                disabled={isLoading || !supplierInfo.name || !supplierInfo.email || !supplierInfo.phone || !clientInfo.name || !clientInfo.email || !quoteTitle.trim() || (supplierInfo.businessRegistrationNumber && !supplierInfo.companyName)}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                {isLoading ? '발송 중...' : '카카오톡으로 발송'}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full border-border"
                onClick={handleSaveDraft}
                disabled={isLoading}
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? '저장 중...' : '임시저장'}
              </Button>
            </div>

            <div className="mt-4 p-3 bg-accent rounded-lg">
              <p className="text-sm text-accent-foreground">
                💡 견적서가 카카오톡으로 발송되면 고객이 바로 확인하고 승인할 수 있습니다.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}