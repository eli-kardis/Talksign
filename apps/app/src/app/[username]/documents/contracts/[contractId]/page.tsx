// src/app/documents/contracts/[contractId]/page.tsx
'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Edit, Download, Building2, User, Clock, CheckCircle, PenTool, AlertCircle, Calendar } from 'lucide-react';

interface ContractItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  unit?: string;
  amount: number;
}

interface ContractSupplier {
  name: string;
  email: string;
  phone?: string;
  business_name?: string;
  company_name?: string;
  business_registration_number?: string;
  business_address?: string;
}

interface Contract {
  id: string;
  title: string;
  status: string;
  client_name: string;
  client_email: string;
  client_phone?: string;
  client_company?: string;
  client_business_number?: string;
  client_address?: string;
  supplier?: ContractSupplier;
  items: ContractItem[];
  subtotal: number;
  tax_amount: number;
  tax_rate: number;
  total_amount: number;
  description?: string;
  project_start_date?: string;
  project_end_date?: string;
  terms?: string[];
  created_at: string;
  signed_date?: string;

  // 법적 필수 요소
  party_a_role?: string;
  party_b_role?: string;
  contract_copies?: number;
  party_a_representative?: string;
  party_b_representative?: string;

  // 상세 결제 정보
  down_payment_ratio?: number;
  interim_payment_ratio?: number;
  final_payment_ratio?: number;
  down_payment_date?: string;
  interim_payment_date?: string;
  final_payment_date?: string;
  payment_method?: string;
  bank_name?: string;
  bank_account_number?: string;
  bank_account_holder?: string;

  // 계약 이행 조건
  delivery_conditions?: string;
  delivery_location?: string;
  delivery_deadline?: string;
  warranty_period?: string;
  warranty_scope?: string;

  // 법적 보호 조항
  nda_clause?: string;
  termination_conditions?: string;
  dispute_resolution?: string;
  jurisdiction_court?: string;
  force_majeure_clause?: string;

  // 추가 조항
  renewal_conditions?: string;
  amendment_procedure?: string;
  assignment_prohibition?: string;
  special_terms?: string;
  penalty_clause?: string;
}

export default function ContractDetailPage({ params }: { params: Promise<{ contractId: string }> }) {
  const router = useRouter();
  const [contractId, setContractId] = useState<string | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function getParams() {
      const resolvedParams = await params;
      setContractId(resolvedParams.contractId);
    }
    getParams();
  }, [params]);

  useEffect(() => {
    if (!contractId) return;
    
    async function fetchContract() {
      try {
        setLoading(true);
        const response = await fetch(`/api/contracts/${contractId}`);
        
        if (response.status === 404) {
          setError('계약서를 찾을 수 없습니다.');
          return;
        }
        
        if (!response.ok) {
          throw new Error('계약서를 불러오는데 실패했습니다.');
        }
        
        const contractData = await response.json();
        setContract(contractData);
      } catch (err) {
        console.error('Error fetching contract:', err);
        setError(err instanceof Error ? err.message : '계약서를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    }

    fetchContract();
  }, [contractId]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
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
      case 'draft':
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'signed':
        return <CheckCircle className="w-3 h-3 mr-1" />;
      case 'sent':
        return <PenTool className="w-3 h-3 mr-1" />;
      case 'completed':
        return <CheckCircle className="w-3 h-3 mr-1" />;
      default:
        return null;
    }
  };

  const handleDownload = () => {
    alert('계약서 PDF 다운로드 기능은 실제 서비스에서 구현됩니다.');
  };

  const handleBack = () => {
    router.push('/documents/contracts');
  };

  if (loading) {
    return (
      <div className="space-y-4 md:space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-64 mb-4"></div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 md:space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleBack} className="border-border">
            <ArrowLeft className="w-4 h-4 mr-2" />
            돌아가기
          </Button>
        </div>
        <Card className="p-6 md:p-8 text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-medium text-foreground mb-2">오류 발생</h2>
          <p className="text-muted-foreground">{error}</p>
        </Card>
      </div>
    );
  }

  if (!contract) {
    return notFound();
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleBack} className="border-border">
            <ArrowLeft className="w-4 h-4 mr-2" />
            돌아가기
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl md:text-2xl font-medium text-foreground">{contract.title}</h2>
              <Badge className={getStatusBadge(contract.status)}>
                {getStatusIcon(contract.status)}
                {getStatusText(contract.status)}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">계약서 번호: {contract.id.slice(0, 8).toUpperCase()}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" onClick={handleDownload} className="border-border text-xs md:text-sm">
            <Download className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">PDF 다운로드</span>
          </Button>
          <Button 
            onClick={() => router.push(`/documents/contracts/${contractId}/edit`)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs md:text-sm"
          >
            <Edit className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">수정</span>
          </Button>
        </div>
      </div>

      {/* Contract Document */}
      <Card className="max-w-4xl mx-auto bg-white border-gray-300 shadow-lg">
        <div className="p-6 md:p-8 space-y-6 md:space-y-8 text-black">
          
          {/* 1. 계약서 제목과 계약일자 */}
          <div className="border-b border-gray-300 pb-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h2 className="text-3xl md:text-4xl font-bold text-black mb-2">{contract.title}</h2>
                <p className="text-sm text-gray-600">계약서 번호: {contract.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 justify-end">
                  <span className="text-sm font-medium text-gray-600">계약일자:</span>
                  <span className="font-semibold text-black">
                    {new Date(contract.created_at).getFullYear()}년 {String(new Date(contract.created_at).getMonth() + 1).padStart(2, '0')}월 {String(new Date(contract.created_at).getDate()).padStart(2, '0')}일
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. 발주처 정보 및 수급업체 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:items-start">
            {/* 발주처 정보 */}
            <div>
              <h3 className="text-lg font-semibold text-black mb-4">
                발주처
              </h3>
              <Card className="bg-gray-50 border-gray-300 h-full">
                <div className="p-4 md:p-5">
                  <div className="space-y-2">
                    {contract.client_company && (
                      <p className="font-semibold text-black text-lg">회사명: {contract.client_company}</p>
                    )}
                    <p className="text-sm text-gray-700">고객명: {contract.client_name}</p>
                    {contract.client_business_number && (
                      <p className="text-sm text-gray-700">
                        사업자등록번호: {contract.client_business_number}
                      </p>
                    )}
                    <p className="text-sm text-gray-700">이메일: {contract.client_email}</p>
                    {contract.client_phone && (
                      <p className="text-sm text-gray-700">전화번호: {contract.client_phone}</p>
                    )}
                    {contract.client_address && (
                      <p className="text-sm text-gray-700">주소: {contract.client_address}</p>
                    )}
                  </div>
                </div>
              </Card>
            </div>

            {/* 수급업체 정보 */}
            {contract.supplier && (
              <div>
                <h3 className="text-lg font-semibold text-black mb-4">
                  수급업체
                </h3>
                <Card className="bg-gray-50 border-gray-300 h-full">
                  <div className="p-4 md:p-5">
                    <div className="space-y-2">
                      <p className="font-semibold text-black text-lg">
                        회사명: {contract.supplier.company_name || contract.supplier.business_name || contract.supplier.name}
                      </p>
                      <p className="text-sm text-gray-700">대표자: {contract.supplier.name}</p>
                      {contract.supplier.business_registration_number && (
                        <p className="text-sm text-gray-700">
                          사업자등록번호: {contract.supplier.business_registration_number}
                        </p>
                      )}
                      <p className="text-sm text-gray-700">이메일: {contract.supplier.email}</p>
                      {contract.supplier.phone && (
                        <p className="text-sm text-gray-700">전화번호: {contract.supplier.phone}</p>
                      )}
                      {contract.supplier.business_address && (
                        <p className="text-sm text-gray-700">주소: {contract.supplier.business_address}</p>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>

          {/* 3. 프로젝트 정보 */}
          {(contract.project_start_date || contract.project_end_date || contract.description) && (
            <div>
              <h3 className="text-lg font-semibold text-black mb-4">
                프로젝트 정보
              </h3>
              <Card className="bg-gray-50 border-gray-300">
                <div className="p-4 md:p-5">
                  {contract.description && (
                    <p className="text-black mb-3">{contract.description}</p>
                  )}
                  {(contract.project_start_date || contract.project_end_date) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      {contract.project_start_date && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-700">시작일:</span>
                          <span className="text-black font-medium">
                            {new Date(contract.project_start_date).toLocaleDateString('ko-KR')}
                          </span>
                        </div>
                      )}
                      {contract.project_end_date && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-700">완료일:</span>
                          <span className="text-black font-medium">
                            {new Date(contract.project_end_date).toLocaleDateString('ko-KR')}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}

          {/* 4. 계약 내역 */}
          <div>
            <h3 className="text-lg font-semibold text-black mb-4">
              계약 내역
            </h3>
            <Card className="border-gray-300 overflow-hidden bg-white">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead className="bg-gray-100 border-b border-gray-300">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">항목명</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">설명</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">수량</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">단위</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">단가</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">금액</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contract.items.map((item, index) => (
                      <tr key={item.id || index} className="hover:bg-gray-50 transition-colors border-b border-gray-200">
                        <td className="px-4 py-3">
                          <p className="font-medium text-black text-sm">{item.name}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-700">{item.description || '-'}</p>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <p className="text-sm text-black">{item.quantity}</p>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <p className="text-sm text-black">{item.unit || '개'}</p>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-sm text-black">
                            ₩{new Intl.NumberFormat('ko-KR').format(item.unit_price)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-semibold text-black text-sm">
                            ₩{new Intl.NumberFormat('ko-KR').format(item.amount)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* 5. 계약 조건 */}
          {contract.terms && contract.terms.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-black mb-4">
                계약 조건
              </h3>
              <Card className="bg-gray-50 border-gray-300">
                <div className="p-4 md:p-5">
                  <div className="space-y-3">
                    {contract.terms.map((term, index) => (
                      <div key={index} className="flex items-start gap-3 text-sm">
                        <span className="text-black font-medium min-w-[20px]">{index + 1}.</span>
                        <span className="text-black leading-relaxed">{term}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* 6. 상세 결제 정보 */}
          {(contract.down_payment_ratio || contract.bank_name) && (
            <div>
              <h3 className="text-lg font-semibold text-black mb-4">
                상세 결제 정보
              </h3>
              <Card className="bg-gray-50 border-gray-300">
                <div className="p-4 md:p-5">
                  {(contract.down_payment_ratio || contract.interim_payment_ratio || contract.final_payment_ratio) && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-black mb-2 text-sm">대금 지급 비율</h4>
                      <div className="grid grid-cols-3 gap-3">
                        {contract.down_payment_ratio && (
                          <div className="text-sm">
                            <span className="text-gray-700">선금: </span>
                            <span className="text-black font-medium">{contract.down_payment_ratio}%</span>
                          </div>
                        )}
                        {contract.interim_payment_ratio && (
                          <div className="text-sm">
                            <span className="text-gray-700">중도금: </span>
                            <span className="text-black font-medium">{contract.interim_payment_ratio}%</span>
                          </div>
                        )}
                        {contract.final_payment_ratio && (
                          <div className="text-sm">
                            <span className="text-gray-700">잔금: </span>
                            <span className="text-black font-medium">{contract.final_payment_ratio}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {(contract.down_payment_date || contract.interim_payment_date || contract.final_payment_date) && (
                    <div className="mb-4 border-t border-gray-300 pt-4">
                      <h4 className="font-semibold text-black mb-2 text-sm">대금 지급일</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {contract.down_payment_date && (
                          <div className="text-sm">
                            <span className="text-gray-700">선금: </span>
                            <span className="text-black">{contract.down_payment_date}</span>
                          </div>
                        )}
                        {contract.interim_payment_date && (
                          <div className="text-sm">
                            <span className="text-gray-700">중도금: </span>
                            <span className="text-black">{contract.interim_payment_date}</span>
                          </div>
                        )}
                        {contract.final_payment_date && (
                          <div className="text-sm">
                            <span className="text-gray-700">잔금: </span>
                            <span className="text-black">{contract.final_payment_date}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {contract.bank_name && (
                    <div className="border-t border-gray-300 pt-4">
                      <h4 className="font-semibold text-black mb-2 text-sm">입금 계좌</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <div className="text-sm">
                          <span className="text-gray-700">은행: </span>
                          <span className="text-black">{contract.bank_name}</span>
                        </div>
                        {contract.bank_account_number && (
                          <div className="text-sm">
                            <span className="text-gray-700">계좌번호: </span>
                            <span className="text-black">{contract.bank_account_number}</span>
                          </div>
                        )}
                        {contract.bank_account_holder && (
                          <div className="text-sm">
                            <span className="text-gray-700">예금주: </span>
                            <span className="text-black">{contract.bank_account_holder}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}

          {/* 7. 계약 이행 조건 */}
          {(contract.delivery_conditions || contract.warranty_period) && (
            <div>
              <h3 className="text-lg font-semibold text-black mb-4">
                계약 이행 조건
              </h3>
              <Card className="bg-gray-50 border-gray-300">
                <div className="p-4 md:p-5 space-y-3">
                  {contract.delivery_conditions && (
                    <div className="text-sm">
                      <span className="text-gray-700 font-medium">인도/납품 조건: </span>
                      <span className="text-black">{contract.delivery_conditions}</span>
                    </div>
                  )}
                  {contract.delivery_location && (
                    <div className="text-sm">
                      <span className="text-gray-700 font-medium">납품 장소: </span>
                      <span className="text-black">{contract.delivery_location}</span>
                    </div>
                  )}
                  {contract.delivery_deadline && (
                    <div className="text-sm">
                      <span className="text-gray-700 font-medium">납품 기한: </span>
                      <span className="text-black">{contract.delivery_deadline}</span>
                    </div>
                  )}
                  {contract.warranty_period && (
                    <div className="text-sm">
                      <span className="text-gray-700 font-medium">하자보증 기간: </span>
                      <span className="text-black">{contract.warranty_period}</span>
                    </div>
                  )}
                  {contract.warranty_scope && (
                    <div className="text-sm">
                      <span className="text-gray-700 font-medium">하자보증 범위: </span>
                      <span className="text-black">{contract.warranty_scope}</span>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}

          {/* 8. 법적 보호 조항 */}
          {(contract.nda_clause || contract.termination_conditions || contract.force_majeure_clause) && (
            <div>
              <h3 className="text-lg font-semibold text-black mb-4">
                법적 보호 조항
              </h3>
              <Card className="bg-gray-50 border-gray-300">
                <div className="p-4 md:p-5 space-y-4">
                  {contract.nda_clause && (
                    <div>
                      <h4 className="font-semibold text-black mb-2 text-sm">비밀유지 조항 (NDA)</h4>
                      <p className="text-sm text-black leading-relaxed whitespace-pre-wrap">{contract.nda_clause}</p>
                    </div>
                  )}
                  {contract.termination_conditions && (
                    <div className="border-t border-gray-300 pt-4">
                      <h4 className="font-semibold text-black mb-2 text-sm">계약 해지 조건</h4>
                      <p className="text-sm text-black leading-relaxed whitespace-pre-wrap">{contract.termination_conditions}</p>
                    </div>
                  )}
                  {(contract.dispute_resolution || contract.jurisdiction_court) && (
                    <div className="border-t border-gray-300 pt-4">
                      <h4 className="font-semibold text-black mb-2 text-sm">분쟁 해결</h4>
                      <div className="space-y-2">
                        {contract.dispute_resolution && (
                          <div className="text-sm">
                            <span className="text-gray-700">해결 방법: </span>
                            <span className="text-black">{contract.dispute_resolution}</span>
                          </div>
                        )}
                        {contract.jurisdiction_court && (
                          <div className="text-sm">
                            <span className="text-gray-700">관할 법원: </span>
                            <span className="text-black">{contract.jurisdiction_court}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {contract.force_majeure_clause && (
                    <div className="border-t border-gray-300 pt-4">
                      <h4 className="font-semibold text-black mb-2 text-sm">불가항력 조항</h4>
                      <p className="text-sm text-black leading-relaxed whitespace-pre-wrap">{contract.force_majeure_clause}</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}

          {/* 9. 추가 조항 */}
          {(contract.renewal_conditions || contract.amendment_procedure || contract.special_terms || contract.penalty_clause) && (
            <div>
              <h3 className="text-lg font-semibold text-black mb-4">
                추가 조항
              </h3>
              <Card className="bg-gray-50 border-gray-300">
                <div className="p-4 md:p-5 space-y-4">
                  {contract.renewal_conditions && (
                    <div>
                      <h4 className="font-semibold text-black mb-2 text-sm">계약 갱신 조건</h4>
                      <p className="text-sm text-black leading-relaxed whitespace-pre-wrap">{contract.renewal_conditions}</p>
                    </div>
                  )}
                  {contract.amendment_procedure && (
                    <div className="border-t border-gray-300 pt-4">
                      <h4 className="font-semibold text-black mb-2 text-sm">계약 변경/수정 절차</h4>
                      <p className="text-sm text-black leading-relaxed whitespace-pre-wrap">{contract.amendment_procedure}</p>
                    </div>
                  )}
                  {contract.assignment_prohibition && (
                    <div className="border-t border-gray-300 pt-4">
                      <h4 className="font-semibold text-black mb-2 text-sm">권리/의무 양도 금지</h4>
                      <p className="text-sm text-black leading-relaxed whitespace-pre-wrap">{contract.assignment_prohibition}</p>
                    </div>
                  )}
                  {contract.special_terms && (
                    <div className="border-t border-gray-300 pt-4">
                      <h4 className="font-semibold text-black mb-2 text-sm">특약 사항</h4>
                      <p className="text-sm text-black leading-relaxed whitespace-pre-wrap">{contract.special_terms}</p>
                    </div>
                  )}
                  {contract.penalty_clause && (
                    <div className="border-t border-gray-300 pt-4">
                      <h4 className="font-semibold text-black mb-2 text-sm">위약금 조항</h4>
                      <p className="text-sm text-black leading-relaxed whitespace-pre-wrap">{contract.penalty_clause}</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}

          {/* 10. 총 합계 */}
          <div>
            <h3 className="text-lg font-semibold text-black mb-4">총 합계</h3>
            <Card className="bg-gray-50 border-gray-300">
              <div className="p-4 md:p-6 space-y-4">
                <div className="flex justify-between items-center text-base">
                  <span className="text-gray-700">소계</span>
                  <span className="text-black font-semibold">₩{new Intl.NumberFormat('ko-KR').format(contract.subtotal)}</span>
                </div>
                {contract.tax_amount > 0 && (
                  <div className="flex justify-between items-center text-base">
                    <span className="text-gray-700">부가세 ({(contract.tax_rate * 100).toFixed(0)}%)</span>
                    <span className="text-black font-semibold">₩{new Intl.NumberFormat('ko-KR').format(contract.tax_amount)}</span>
                  </div>
                )}
                <Separator className="bg-gray-300" />
                <div className="flex justify-between items-center bg-gray-100 p-4 rounded-lg">
                  <span className="text-xl font-bold text-black">총 계약 금액</span>
                  <div className="text-right">
                    <span className="text-3xl font-bold text-black">
                      ₩{new Intl.NumberFormat('ko-KR').format(contract.total_amount)}
                    </span>
                    <p className="text-sm text-gray-700 mt-1">부가세 포함</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* 7. 계약 정보 */}
          <div className="text-center pt-6 border-t border-gray-300">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm mb-6">
              <div className="text-center">
                <div className="text-gray-700 mb-1">계약서 작성일</div>
                <div className="font-medium text-black">
                  {new Date(contract.created_at).toLocaleDateString('ko-KR')}
                </div>
              </div>
              {contract.signed_date && (
                <div className="text-center">
                  <div className="text-gray-700 mb-1">서명 완료일</div>
                  <div className="font-medium text-black">
                    {new Date(contract.signed_date).toLocaleDateString('ko-KR')}
                  </div>
                </div>
              )}
              <div className="text-center">
                <div className="text-gray-700 mb-1">계약 상태</div>
                <Badge className={getStatusBadge(contract.status)}>
                  {getStatusIcon(contract.status)}
                  {getStatusText(contract.status)}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-black"></div>
                <span className="text-xs font-medium text-black">LinkFlow Contract System</span>
                <div className="w-2 h-2 rounded-full bg-black"></div>
              </div>
              <p>본 계약서는 <span className="text-black font-medium">{new Date(contract.created_at).toLocaleDateString('ko-KR')}</span>에 작성되었습니다.</p>
              {contract.status === 'signed' && contract.signed_date && (
                <p>계약서 서명은 <span className="text-black font-medium">{new Date(contract.signed_date).toLocaleDateString('ko-KR')}</span>에 완료되었습니다.</p>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}