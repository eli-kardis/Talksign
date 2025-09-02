'use client'

import React, { useState } from 'react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Separator } from './ui/separator'
import { ImageWithFallback } from './ui/ImageWithFallback' // 파일 존재 확인!
import { ArrowLeft, Plus, Trash2, MessageSquare, Save, Calculator, Image as ImageIcon } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { formatPhoneNumber, formatBusinessNumber, formatNumber } from '@/lib/formatters'

interface QuoteItem {
  id: number
  description: string
  quantity: number
  unitPrice: number
  amount: number
}

interface NewQuoteProps {
  onNavigate: (view: string) => void
}

export function NewQuote({ onNavigate }: NewQuoteProps) {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  
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
    { id: 1, description: '', quantity: 1, unitPrice: 0, amount: 0 },
  ])

  const addItem = () => {
    const newId = (items.length ? Math.max(...items.map((i) => i.id)) : 0) + 1 // ✅ 빈 배열 대비
    setItems([...items, { id: newId, description: '', quantity: 1, unitPrice: 0, amount: 0 }])
  }

  const removeItem = (id: number) => {
    if (items.length > 1) setItems(items.filter((item) => item.id !== id))
  }

  const updateItem = (id: number, field: keyof QuoteItem, value: string | number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item
        
        let processedValue = value
        
        // 숫자 필드의 경우 앞의 0 제거
        if (field === 'quantity' || field === 'unitPrice') {
          if (typeof value === 'string') {
            processedValue = formatNumber(value)
          }
        }
        
        const next = { ...item, [field]: processedValue } as QuoteItem
        if (field === 'quantity' || field === 'unitPrice') {
          next.amount = (Number(next.quantity) || 0) * (Number(next.unitPrice) || 0)
        }
        return next
      })
    )
  }

  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0)
  const vatAmount = Math.floor(totalAmount * 0.1)
  const finalAmount = totalAmount + vatAmount

  const formatCurrency = (amount: number) => new Intl.NumberFormat('ko-KR').format(amount)

  const saveQuote = async (status: 'draft' | 'sent' = 'draft') => {
    // 필수 필드 검증
    if (!clientInfo.name.trim()) {
      alert('고객명을 입력해주세요.')
      return
    }
    
    if (!clientInfo.email.trim()) {
      alert('고객 이메일을 입력해주세요.')
      return
    }
    
    if (!projectInfo.title.trim()) {
      alert('프로젝트명을 입력해주세요.')
      return
    }

    setIsLoading(true)

    try {
      const quoteData = {
        client_name: clientInfo.name.trim(),
        client_email: clientInfo.email.trim(),
        client_phone: clientInfo.phone.trim() || null,
        client_company: clientInfo.company.trim() || null,
        title: projectInfo.title.trim(),
        description: projectInfo.description.trim() || null,
        items: items.map(item => ({
          id: item.id,
          description: item.description.trim(),
          quantity: item.quantity,
          unit_price: item.unitPrice,
          amount: item.amount
        })),
        status,
        // 추가 메타데이터 (필요시)
        client_business_number: clientInfo.businessNumber.trim() || null,
        client_address: clientInfo.address.trim() || null,
        client_logo_url: clientInfo.logoUrl.trim() || null,
        due_date: projectInfo.dueDate || null,
        notes: projectInfo.notes.trim() || null,
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

            {/* 로고 (선택) */}
            <div className="mt-6 pt-4 border-t border-border">
              <Label className="text-foreground">회사 로고 (선택)</Label>
              <div className="mt-2 flex items-start gap-4">
                <div className="flex-1">
                  <Input
                    value={clientInfo.logoUrl}
                    onChange={(e) => setClientInfo({ ...clientInfo, logoUrl: e.target.value })}
                    placeholder="로고 이미지 URL을 입력하세요"
                    className="bg-input-background border-border"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    직접 URL을 입력하거나 파일 업로드 서비스를 이용하세요
                  </p>
                </div>

                {clientInfo.logoUrl ? (
                  <div className="w-16 h-16 flex-shrink-0">
                    <ImageWithFallback
                      src={clientInfo.logoUrl}
                      alt="클라이언트 로고 미리보기"
                      className="w-full h-full rounded-lg object-cover border border-border"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center flex-shrink-0 border border-border">
                    <ImageIcon className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* 프로젝트 정보 */}
          <Card className="p-6 bg-card border-border">
            <h3 className="font-medium mb-4 text-foreground">프로젝트 정보</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="projectTitle" className="text-foreground">프로젝트명 *</Label>
                <Input
                  id="projectTitle"
                  value={projectInfo.title}
                  onChange={(e) => setProjectInfo({ ...projectInfo, title: e.target.value })}
                  placeholder="웹사이트 리뉴얼 프로젝트"
                  className="bg-input-background border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="projectDescription" className="text-foreground">프로젝트 설명</Label>
                <Textarea
                  id="projectDescription"
                  value={projectInfo.description}
                  onChange={(e) => setProjectInfo({ ...projectInfo, description: e.target.value })}
                  placeholder="프로젝트에 대한 상세 설명을 입력하세요"
                  rows={4}
                  className="bg-input-background border-border"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dueDate" className="text-foreground">완료 예정일</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={projectInfo.dueDate}
                    onChange={(e) => setProjectInfo({ ...projectInfo, dueDate: e.target.value })}
                    className="bg-input-background border-border"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-foreground">특이사항</Label>
                <Textarea
                  id="notes"
                  value={projectInfo.notes}
                  onChange={(e) => setProjectInfo({ ...projectInfo, notes: e.target.value })}
                  placeholder="추가 요청사항이나 특이사항을 입력하세요"
                  rows={3}
                  className="bg-input-background border-border"
                />
              </div>
            </div>
          </Card>

          {/* 견적 항목 */}
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-foreground">견적 항목</h3>
              <Button type="button" variant="outline" onClick={addItem} className="border-border">
                <Plus className="w-4 h-4 mr-2" />
                항목 추가
              </Button>
            </div>

            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-12 gap-3 items-center p-4 border border-border rounded-lg bg-secondary"
                >
                  <div className="col-span-12 md:col-span-5">
                    <Input
                      placeholder="작업 내용"
                      value={item.description}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      className="bg-input-background border-border"
                    />
                  </div>

                  <div className="col-span-4 md:col-span-2">
                    <Input
                      type="number"
                      placeholder="수량"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                      className="bg-input-background border-border"
                    />
                  </div>

                  <div className="col-span-4 md:col-span-2">
                    <Input
                      type="number"
                      placeholder="단가"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(item.id, 'unitPrice', parseInt(e.target.value) || 0)}
                      className="bg-input-background border-border"
                    />
                  </div>

                  <div className="col-span-3 md:col-span-2 text-right font-medium text-foreground font-mono">
                    {formatCurrency(item.amount)}원
                  </div>

                  <div className="col-span-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      disabled={items.length === 1}
                      className="border-border hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Summary Sidebar */}
        <div className="space-y-6">
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="w-5 h-5 text-primary" />
              <h3 className="font-medium text-foreground">견적 요약</h3>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">소계</span>
                <span className="text-foreground font-mono">{formatCurrency(totalAmount)}원</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">부가세 (10%)</span>
                <span className="text-foreground font-mono">{formatCurrency(vatAmount)}원</span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium">
                <span className="text-foreground">총 금액</span>
                <span className="text-primary font-mono">{formatCurrency(finalAmount)}원</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <h3 className="font-medium mb-4 text-foreground">발송 옵션</h3>
            <div className="space-y-3">
              <Button
                type="button"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={handleSaveAndSend}
                disabled={isLoading || !clientInfo.name || !clientInfo.email || !projectInfo.title}
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