import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ContractItemsTable } from './ContractItemsTable';
import { ArrowLeft, Edit, Download, FileText, Calendar, User, Building, Phone, Mail, MapPin, PenTool, CheckCircle } from 'lucide-react';

interface ContractDetailProps {
  contractId: number | null;
  onBack: () => void;
  onEdit: () => void;
}

// Mock contract data
const mockContract = {
  id: 1,
  contractNumber: 'CON-2024-001',
  title: '웹사이트 리뉴얼 프로젝트 계약서',
  status: 'signed',
  client: {
    name: '김고객',
    company: '(주)스타트업에이',
    businessNumber: '123-45-67890',
    phone: '010-1234-5678',
    email: 'client@startup-a.com',
    address: '서울시 강남구 테헤란로 123, 4층'
  },
  freelancer: {
    name: '김프리',
    company: '김프리 스튜디오',
    businessNumber: '987-65-43210',
    phone: '010-9876-5432',
    email: 'freelancer@kimfree.com',
    address: '서울시 서초구 강남대로 456, 2층'
  },
  project: {
    description: '기존 웹사이트의 UI/UX 개선 및 반응형 웹사이트 구축 프로젝트에 대한 계약입니다.',
    startDate: '2024-01-20',
    dueDate: '2024-03-31'
  },
  items: [
    { id: 1, name: '웹사이트 디자인', description: '웹사이트 디자인 (PC/모바일)', quantity: 1, unitPrice: 1500000, unit: '개', amount: 1500000 },
    { id: 2, name: '프론트엔드 개발', description: '퍼블리싱 및 프론트엔드 개발', quantity: 1, unitPrice: 1200000, unit: '개', amount: 1200000 },
    { id: 3, name: 'SEO 최적화', description: 'SEO 최적화', quantity: 1, unitPrice: 300000, unit: '개', amount: 300000 }
  ],
  createdDate: '2024-01-15',
  signedDate: '2024-01-18',
  terms: [
    '프로젝트 개발 기간: 2024년 1월 20일 ~ 2024년 3월 31일',
    '계약금 50% 선입금, 완료 후 50% 잔금 지급',
    '프로젝트 요구사항 변경 시 추가 비용 발생',
    '저작권은 완전한 대금 지급 후 발주처로 이전',
    '계약 위반 시 위약금 계약금의 10% 부과'
  ]
};

export function ContractDetail({ contractId, onBack, onEdit }: ContractDetailProps) {
  const router = useRouter();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editableItems, setEditableItems] = useState(mockContract.items);
  const [editableStartDate, setEditableStartDate] = useState(mockContract.project.startDate);
  const [editableDueDate, setEditableDueDate] = useState(mockContract.project.dueDate);
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-secondary text-secondary-foreground';
      case 'sent':
        return 'bg-accent text-accent-foreground';
      case 'signed':
        return 'bg-primary/20 text-primary';
      case 'completed':
        return 'bg-primary text-primary-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '작성중';
      case 'sent':
        return '서명대기';
      case 'signed':
        return '서명완료';
      case 'completed':
        return '계약완료';
      default:
        return '알 수 없음';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount) + '원';
  };

  const totalAmount = mockContract.items.reduce((sum, item) => sum + item.amount, 0);
  const vatAmount = Math.floor(totalAmount * 0.1);
  const finalAmount = totalAmount + vatAmount;

  const handleDownload = () => {
    alert('계약서 PDF 다운로드 기능은 실제 서비스에서 구현됩니다.');
  };

  const handleEditItems = () => {
    setIsEditMode(true);
  };

  const handleSaveItems = () => {
    setIsEditMode(false);
    // Here you would save the changes to the backend
    alert('계약 항목이 저장되었습니다.');
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    // Reset to original values
    setEditableItems(mockContract.items);
    setEditableStartDate(mockContract.project.startDate);
    setEditableDueDate(mockContract.project.dueDate);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack} className="border-border">
            <ArrowLeft className="w-4 h-4 mr-2" />
            돌아가기
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl md:text-2xl font-medium text-foreground">{mockContract.title}</h2>
              <Badge className={getStatusBadge(mockContract.status)}>
                {mockContract.status === 'signed' && <CheckCircle className="w-3 h-3 mr-1" />}
                {mockContract.status === 'sent' && <PenTool className="w-3 h-3 mr-1" />}
                {getStatusText(mockContract.status)}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">계약서 번호: {mockContract.contractNumber}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" onClick={handleDownload} className="border-border text-xs md:text-sm">
            <Download className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">PDF 다운로드</span>
          </Button>
          {!isEditMode && (
            <Button 
              onClick={handleEditItems}
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs md:text-sm"
            >
              <Edit className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">항목 수정</span>
            </Button>
          )}
          {isEditMode && (
            <>
              <Button 
                onClick={handleSaveItems}
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs md:text-sm"
              >
                <CheckCircle className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">저장</span>
              </Button>
              <Button 
                onClick={handleCancelEdit}
                variant="outline"
                className="border-border text-xs md:text-sm"
              >
                취소
              </Button>
            </>
          )}
          {mockContract.status === 'pending' && !isEditMode && (
            <Button 
              onClick={() => router.push(`/documents/contracts/${contractId}/edit`)}
              variant="outline"
              className="border-border text-xs md:text-sm"
            >
              <FileText className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">전체 수정</span>
            </Button>
          )}
        </div>
      </div>

      {/* Contract Content */}
      <div className="max-w-4xl mx-auto">
        {/* Contract Header */}
        <Card className="p-6 md:p-8 mb-4 md:mb-6 bg-white border-gray-300">
          <div className="text-center mb-6 md:mb-8 text-black">
            <h1 className="text-2xl md:text-3xl font-medium text-black mb-2">계약서</h1>
            <p className="text-base md:text-lg text-gray-600">CONTRACT</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-6">
            {/* Client Information */}
            <div>
              <div className="mb-3">
                <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wide">발주처</h3>
              </div>
              <div className="space-y-2">
                <div>
                  <span className="font-medium text-black">회사명: {mockContract.client.company}</span>
                </div>
                <div>
                  <span className="text-black">고객명: {mockContract.client.name}</span>
                </div>
                <div>
                  <span className="text-black">전화번호: {mockContract.client.phone}</span>
                </div>
                <div>
                  <span className="text-black">이메일: {mockContract.client.email}</span>
                </div>
                <div>
                  <span className="text-black text-sm">주소: {mockContract.client.address}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  사업자등록번호: {mockContract.client.businessNumber}
                </div>
              </div>
            </div>

            {/* Freelancer Information */}
            <div>
              <div className="mb-3">
                <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wide">수급업체</h3>
              </div>
              <div className="space-y-2">
                <div>
                  <span className="font-medium text-black">회사명: {mockContract.freelancer.company}</span>
                </div>
                <div>
                  <span className="text-black">대표자: {mockContract.freelancer.name}</span>
                </div>
                <div>
                  <span className="text-black">전화번호: {mockContract.freelancer.phone}</span>
                </div>
                <div>
                  <span className="text-black">이메일: {mockContract.freelancer.email}</span>
                </div>
                <div>
                  <span className="text-black text-sm">주소: {mockContract.freelancer.address}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  사업자등록번호: {mockContract.freelancer.businessNumber}
                </div>
              </div>
            </div>
          </div>

          {/* Project Information */}
          <div className="mb-6">
            <div className="mb-3">
              <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wide">프로젝트 정보</h3>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-black mb-3">{mockContract.project.description}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-700">시작일:</span>
                  <span className="text-black font-medium">{new Date(mockContract.project.startDate).toLocaleDateString('ko-KR')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-700">완료일:</span>
                  <span className="text-black font-medium">{new Date(mockContract.project.dueDate).toLocaleDateString('ko-KR')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contract Details */}
          {isEditMode ? (
            <div className="space-y-4">
              <div className="mb-3">
                <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wide">계약 내역 수정</h3>
              </div>
              <ContractItemsTable 
                items={editableItems}
                onItemsChange={setEditableItems}
                startDate={editableStartDate}
                dueDate={editableDueDate}
                onStartDateChange={setEditableStartDate}
                onDueDateChange={setEditableDueDate}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="mb-3">
                <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wide">계약 내역</h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-300">
                      <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">항목</th>
                      <th className="text-center py-3 px-2 text-sm font-medium text-gray-700 w-20">수량</th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-gray-700 w-32">단가</th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-gray-700 w-32">금액</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockContract.items.map((item, index) => (
                      <tr key={item.id} className={index < mockContract.items.length - 1 ? "border-b border-border/50" : ""}>
                        <td className="py-4 px-2">
                          <span className="text-black font-medium">{item.name}</span>
                          {item.description && (
                            <div className="text-xs text-gray-600 mt-1">{item.description}</div>
                          )}
                        </td>
                        <td className="py-4 px-2 text-center text-black">{item.quantity}</td>
                        <td className="py-4 px-2 text-right text-black">
                          {formatCurrency(item.unitPrice)}
                        </td>
                        <td className="py-4 px-2 text-right text-black font-medium">
                          {formatCurrency(item.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-300">
                      <td colSpan={3} className="py-3 px-2 text-right font-medium text-gray-700">소계:</td>
                      <td className="py-3 px-2 text-right font-medium text-black">{formatCurrency(totalAmount)}</td>
                    </tr>
                    <tr>
                      <td colSpan={3} className="py-2 px-2 text-right text-gray-700">부가세 (10%):</td>
                      <td className="py-2 px-2 text-right text-black">{formatCurrency(vatAmount)}</td>
                    </tr>
                    <tr className="border-t border-gray-300">
                      <td colSpan={3} className="py-3 px-2 text-right text-lg font-semibold text-black">총 계약 금액:</td>
                      <td className="py-3 px-2 text-right text-lg font-bold text-black">{formatCurrency(finalAmount)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          <Separator className="my-6" />

          {/* Contract Terms */}
          <div>
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wide">계약 조건</h3>
            </div>
            <div className="space-y-3">
              {mockContract.terms.map((term, index) => (
                <div key={index} className="flex items-start gap-3 text-sm">
                  <span className="text-black font-medium min-w-[20px]">{index + 1}.</span>
                  <span className="text-black leading-relaxed">{term}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator className="my-6" />

          {/* Contract Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-gray-700 mb-1">계약서 작성일</div>
              <div className="font-medium text-black">{new Date(mockContract.createdDate).toLocaleDateString('ko-KR')}</div>
            </div>
            {mockContract.signedDate && (
              <div className="text-center">
                <div className="text-gray-700 mb-1">서명 완료일</div>
                <div className="font-medium text-black">{new Date(mockContract.signedDate).toLocaleDateString('ko-KR')}</div>
              </div>
            )}
            <div className="text-center">
              <div className="text-gray-700 mb-1">계약 상태</div>
              <Badge className={getStatusBadge(mockContract.status)}>
                {getStatusText(mockContract.status)}
              </Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}