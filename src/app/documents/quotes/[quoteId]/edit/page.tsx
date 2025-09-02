// src/app/documents/quotes/[quoteId]/edit/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useTenant } from "@/contexts/TenantContext";
import { formatPhoneNumber, formatNumber } from "@/lib/formatters";

interface QuoteEditPageProps {
  params: {
    quoteId: string;
  };
}

export default function QuoteEditPage({ params }: QuoteEditPageProps) {
  const router = useRouter();
  const { basePath } = useTenant();
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // 견적서 데이터 상태 (실제로는 quoteId로 데이터 조회)
  const [formData, setFormData] = useState({
    title: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    description: '',
    amount: '',
  });

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value;
    
    // 필드별 포맷팅
    if (field === 'clientPhone') {
      formattedValue = formatPhoneNumber(value);
    } else if (field === 'amount') {
      formattedValue = formatNumber(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: formattedValue
    }));
  };

  const handleBack = () => {
    router.push(`${basePath}/documents/quotes`);
  };

  const handleTempSave = async () => {
    setIsSaving(true);
    
    // 임시저장 로직 (실제로는 API 호출)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    alert('견적서가 임시저장되었습니다.');
    setIsSaving(false);
    router.push(`${basePath}/documents/quotes`);
  };

  const handleSend = async () => {
    setIsSending(true);
    
    // 발송 로직 (실제로는 API 호출)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    alert('견적서가 발송되었습니다.');
    router.push(`${basePath}/documents/quotes`);
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">견적서 편집</h1>
          <p className="text-muted-foreground">견적서 ID: {params.quoteId}</p>
        </div>
      </div>

      {/* 편집 폼 */}
      <Card className="p-6">
        <div className="space-y-6">
          {/* 기본 정보 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">기본 정보</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">견적서 제목</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="견적서 제목을 입력하세요"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="amount">견적 금액</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">상세 설명</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="견적서 상세 내용을 입력하세요"
                rows={4}
              />
            </div>
          </div>

          {/* 고객 정보 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">고객 정보</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">고객명</Label>
                <Input
                  id="clientName"
                  value={formData.clientName}
                  onChange={(e) => handleInputChange('clientName', e.target.value)}
                  placeholder="고객명을 입력하세요"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="clientEmail">이메일</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={formData.clientEmail}
                  onChange={(e) => handleInputChange('clientEmail', e.target.value)}
                  placeholder="이메일을 입력하세요"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="clientPhone">연락처</Label>
                <Input
                  id="clientPhone"
                  value={formData.clientPhone}
                  onChange={(e) => handleInputChange('clientPhone', e.target.value)}
                  placeholder="연락처를 입력하세요"
                />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 액션 버튼 */}
      <div className="flex items-center gap-4 justify-between">
        <Button 
          variant="outline" 
          onClick={handleBack}
          disabled={isSaving || isSending}
        >
          뒤로가기
        </Button>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline"
            onClick={handleTempSave}
            disabled={isSaving || isSending}
          >
            {isSaving ? "저장중..." : "임시저장"}
          </Button>
          <Button 
            onClick={handleSend}
            disabled={isSaving || isSending}
          >
            {isSending ? "발송중..." : "발송"}
          </Button>
        </div>
      </div>
    </div>
  );
}