// src/app/documents/quotes/[quoteId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { notFound, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AuthenticatedApiClient } from "@/lib/api-client";
import {
  ArrowLeft,
  Download,
  Edit,
  Calendar,
  Building2,
  Mail,
  Phone,
  FileText,
  Loader2,
  AlertCircle,
  User,
  Clock
} from "lucide-react";

interface QuoteItem {
  id: string;
  name: string;
  description?: string;
  quantity?: number;
  unit_price?: number;
  unit?: string;
  amount: number;
}

interface SupplierInfo {
  name: string;
  email: string;
  phone?: string;
  fax?: string;
  business_name?: string;
  business_registration_number?: string;
  business_type?: string;
  business_category?: string;
  company_name?: string;
  business_address?: string;
  company_seal_image_url?: string;
}

interface Quote {
  id: string;
  user_id: string;
  client_name: string;
  client_email: string;
  client_phone?: string;
  client_fax?: string;
  client_company?: string;
  client_business_number?: string;
  client_business_type?: string;
  client_business_category?: string;
  client_address?: string;
  title: string;
  description?: string;
  items: QuoteItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: "draft" | "sent" | "approved" | "rejected" | "expired";
  expiry_date?: string;
  created_at: string;
  updated_at: string;
  supplier?: SupplierInfo;
  // 결제 정보
  payment_condition?: string;
  payment_method?: string;
  bank_name?: string;
  bank_account_number?: string;
  bank_account_holder?: string;
  payment_due_date?: string;
  // 견적 조건
  delivery_due_date?: string;
  warranty_period?: string;
  as_conditions?: string;
  special_notes?: string;
  disclaimer?: string;
  // 할인 정보
  discount_rate?: number;
  discount_amount?: number;
  promotion_code?: string;
  promotion_name?: string;
}

export default function QuoteDetailPage({ params }: { params: Promise<{ username: string; quoteId: string }> }) {
  const router = useRouter();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quoteId, setQuoteId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const unwrapParams = async () => {
      const resolvedParams = await params;
      setQuoteId(resolvedParams.quoteId);
      setUsername(resolvedParams.username);
    };

    unwrapParams();
  }, [params]);

  useEffect(() => {
    const fetchQuote = async () => {
      if (!quoteId) return;

      try {
        setLoading(true);
        setError(null);

        const response = await AuthenticatedApiClient.get(`/api/quotes/${quoteId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            notFound();
            return;
          }
          throw new Error('Failed to fetch quote');
        }

        const quoteData: Quote = await response.json();
        setQuote(quoteData);
      } catch (err) {
        console.error('Error fetching quote:', err);
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuote();
  }, [quoteId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-gray-600" />
        <span className="ml-2 text-gray-600">견적서를 불러오는 중...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 text-center bg-card border-border border-destructive/50">
        <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-2" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">오류가 발생했습니다</h3>
        <p className="text-sm text-gray-600 mb-4">{error}</p>
        <Button
          onClick={() => router.back()}
          variant="outline"
          className="border-border"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          돌아가기
        </Button>
      </Card>
    );
  }

  if (!quote) {
    return notFound();
  }

  const getStatusBadge = (status: Quote['status']) => {
    const statusConfig = {
      draft: { label: '임시저장', variant: 'secondary' as const },
      sent: { label: '발송됨', variant: 'default' as const },
      approved: { label: '승인됨', variant: 'default' as const },
      rejected: { label: '거절됨', variant: 'destructive' as const },
      expired: { label: '만료됨', variant: 'secondary' as const },
    };
    return statusConfig[status] || statusConfig.draft;
  };

  const statusBadge = getStatusBadge(quote.status);

  const handleCreateContract = () => {
    // 견적서 데이터를 쿼리 파라미터로 인코딩하여 계약서 작성 페이지로 이동
    const quoteData = {
      quoteId: quote.id,
      title: quote.title,
      description: quote.description,
      clientName: quote.client_name,
      clientEmail: quote.client_email,
      clientPhone: quote.client_phone,
      clientCompany: quote.client_company,
      clientBusinessNumber: quote.client_business_number,
      clientAddress: quote.client_address,
      supplier: quote.supplier,
      items: quote.items,
      subtotal: quote.subtotal,
      tax: quote.tax,
      total: quote.total
    };

    // UTF-8 안전한 Base64 인코딩
    const encodedData = btoa(encodeURIComponent(JSON.stringify(quoteData)));
    router.push(`/${username}/documents/contracts/new?from=quote&data=${encodedData}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="border-border"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            돌아가기
          </Button>
          
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{quote.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
              <span className="text-sm text-gray-600">
                {new Date(quote.created_at).toLocaleDateString('ko-KR')}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => router.push(`/${username}/documents/quotes/${quoteId}/edit`)}>
            <Edit className="w-4 h-4 mr-2" />
            수정
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            다운로드
          </Button>
          {(quote.status === 'approved' || quote.status === 'sent') && (
            <Button onClick={handleCreateContract} className="bg-green-600 hover:bg-green-700 text-white">
              <FileText className="w-4 h-4 mr-2" />
              계약서 작성
            </Button>
          )}
        </div>
      </div>

      {/* Quote Document */}
      <Card className="max-w-4xl mx-auto bg-white dark:bg-white border-border shadow-lg [&_*::selection]:bg-blue-200 [&_*::selection]:text-gray-900">
        <div className="p-6 md:p-8 space-y-6 md:space-y-8 text-gray-900">
          
          {/* 1. 견적서 제목과 견적일자 */}
          <div className="border-b border-border pb-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{quote.title}</h2>
                <p className="text-sm text-gray-600">견적서 번호: {quote.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 justify-end">
                  <span className="text-sm font-medium text-gray-600">견적일자:</span>
                  <span className="font-semibold text-gray-900">
                    {new Date(quote.created_at).getFullYear()}년 {String(new Date(quote.created_at).getMonth() + 1).padStart(2, '0')}월 {String(new Date(quote.created_at).getDate()).padStart(2, '0')}일
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. 공급자 정보 및 수신자 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:items-start">
            {/* 공급자 정보 */}
            {quote.supplier && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  공급자 정보
                </h3>
                <Card className="bg-gray-50 border-border h-full">
                  <div className="p-4 md:p-5">
                    <div className="space-y-2">
                      <p className="font-semibold text-gray-900 text-lg">
                        회사명: {quote.supplier.company_name || quote.supplier.business_name || quote.supplier.name}
                      </p>
                      <p className="text-sm text-gray-600">대표자: {quote.supplier.name}</p>
                      {quote.supplier.business_registration_number && (
                        <p className="text-sm text-gray-600">
                          사업자등록번호: {quote.supplier.business_registration_number}
                        </p>
                      )}
                      {quote.supplier.business_type && (
                        <p className="text-sm text-gray-600">업태: {quote.supplier.business_type}</p>
                      )}
                      {quote.supplier.business_category && (
                        <p className="text-sm text-gray-600">업종: {quote.supplier.business_category}</p>
                      )}
                      <p className="text-sm text-gray-600">이메일: {quote.supplier.email}</p>
                      {quote.supplier.phone && (
                        <p className="text-sm text-gray-600">전화번호: {quote.supplier.phone}</p>
                      )}
                      {quote.supplier.fax && (
                        <p className="text-sm text-gray-600">팩스: {quote.supplier.fax}</p>
                      )}
                      {quote.supplier.business_address && (
                        <p className="text-sm text-gray-600">주소: {quote.supplier.business_address}</p>
                      )}
                      {quote.supplier.company_seal_image_url && (
                        <div className="mt-4 pt-4 border-t border-border">
                          <p className="text-sm text-gray-600 mb-2">회사 직인:</p>
                          <img
                            src={quote.supplier.company_seal_image_url}
                            alt="회사 직인"
                            className="w-20 h-20 object-contain"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* 수신자 정보 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                수신자 정보
              </h3>
              <Card className="bg-gray-50 border-border h-full">
                <div className="p-4 md:p-5">
                  <div className="space-y-2">
                    {quote.client_company && (
                      <p className="font-semibold text-gray-900 text-lg">회사명: {quote.client_company}</p>
                    )}
                    <p className="text-sm text-gray-600">고객명: {quote.client_name}</p>
                    {quote.client_business_number && (
                      <p className="text-sm text-gray-600">
                        사업자등록번호: {quote.client_business_number}
                      </p>
                    )}
                    {quote.client_business_type && (
                      <p className="text-sm text-gray-600">업태: {quote.client_business_type}</p>
                    )}
                    {quote.client_business_category && (
                      <p className="text-sm text-gray-600">업종: {quote.client_business_category}</p>
                    )}
                    <p className="text-sm text-gray-600">이메일: {quote.client_email}</p>
                    {quote.client_phone && (
                      <p className="text-sm text-gray-600">전화번호: {quote.client_phone}</p>
                    )}
                    {quote.client_fax && (
                      <p className="text-sm text-gray-600">팩스: {quote.client_fax}</p>
                    )}
                    {quote.client_address && (
                      <p className="text-sm text-gray-600">주소: {quote.client_address}</p>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* 5. 견적 유효기간 */}
          {quote.expiry_date && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                견적 유효기간
              </h3>
              <Card className="bg-gray-50 border-border">
                <div className="p-4 md:p-5">
                  <p className="font-semibold text-gray-900 mb-2">
                    {new Date(quote.expiry_date).toLocaleDateString('ko-KR')}까지 유효
                  </p>
                  <p className="text-sm text-gray-600">
                    해당 날짜 이후에는 견적이 자동으로 만료됩니다.
                  </p>
                </div>
              </Card>
            </div>
          )}

          {/* 6. 견적 항목 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              견적 항목
            </h3>
            <Card className="border-border bg-card">
              <div className="overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b-2 border-gray-300">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">항목</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">설명</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">수량</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">단위</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">단가</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">금액</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {quote.items.map((item, index) => {
                      // 기존 데이터 호환: name이 없으면 description을 name으로 사용
                      let itemName = item.name;
                      let itemDesc = item.description;

                      if (!itemName && itemDesc) {
                        if (itemDesc.includes(' - ')) {
                          // " - "로 구분되어 있으면 분리
                          const [name, ...descParts] = itemDesc.split(' - ');
                          itemName = name;
                          itemDesc = descParts.join(' - ');
                        } else {
                          // " - "가 없으면 description을 name으로 사용
                          itemName = itemDesc;
                          itemDesc = '';
                        }
                      }

                      return (
                        <tr key={item.id || index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-medium text-gray-900">{itemName || '-'}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-gray-600 whitespace-pre-wrap">{itemDesc || '-'}</p>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <p className="text-gray-900">{item.quantity || 1}</p>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <p className="text-gray-900">{item.unit || '개'}</p>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="text-gray-900">
                              ₩{new Intl.NumberFormat('ko-KR').format(item.unit_price || item.amount)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="font-semibold text-gray-900">
                              ₩{new Intl.NumberFormat('ko-KR').format(item.amount)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* 7. 결제 정보 */}
          {(quote.payment_condition || quote.payment_method || quote.bank_name || quote.payment_due_date) && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                결제 정보
              </h3>
              <Card className="bg-gray-50 border-border">
                <div className="p-4 md:p-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {quote.payment_condition && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">결제 조건</p>
                        <p className="font-medium text-gray-900">{quote.payment_condition}</p>
                      </div>
                    )}
                    {quote.payment_method && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">결제 방법</p>
                        <p className="font-medium text-gray-900">{quote.payment_method}</p>
                      </div>
                    )}
                    {quote.payment_due_date && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">결제 기한</p>
                        <p className="font-medium text-gray-900">
                          {new Date(quote.payment_due_date).toLocaleDateString('ko-KR')}
                        </p>
                      </div>
                    )}
                  </div>
                  {quote.bank_name && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-sm text-gray-600 mb-3">입금 계좌</p>
                      <div className="bg-white p-4 rounded-lg border border-border">
                        <div className="space-y-2">
                          <p className="font-medium text-gray-900">{quote.bank_name}</p>
                          {quote.bank_account_number && (
                            <p className="text-gray-900">{quote.bank_account_number}</p>
                          )}
                          {quote.bank_account_holder && (
                            <p className="text-sm text-gray-600">예금주: {quote.bank_account_holder}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}

          {/* 8. 견적 조건 */}
          {(quote.delivery_due_date || quote.warranty_period || quote.as_conditions || quote.special_notes || quote.disclaimer) && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                견적 조건
              </h3>
              <Card className="bg-gray-50 border-border">
                <div className="p-4 md:p-5 space-y-4">
                  {quote.delivery_due_date && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">납품/완료 기한</p>
                      <p className="font-medium text-gray-900">
                        {new Date(quote.delivery_due_date).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                  )}
                  {quote.warranty_period && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">하자보증 기간</p>
                      <p className="font-medium text-gray-900">{quote.warranty_period}</p>
                    </div>
                  )}
                  {quote.as_conditions && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">A/S 조건</p>
                      <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{quote.as_conditions}</p>
                    </div>
                  )}
                  {quote.special_notes && (
                    <div className="pt-4 border-t border-border">
                      <p className="text-sm text-gray-600 mb-1">특기사항</p>
                      <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{quote.special_notes}</p>
                    </div>
                  )}
                  {quote.disclaimer && (
                    <div className="pt-4 border-t border-border">
                      <p className="text-sm text-gray-600 mb-1">면책사항</p>
                      <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{quote.disclaimer}</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}

          {/* 9. 할인 정보 */}
          {(quote.discount_rate || quote.discount_amount || quote.promotion_code) && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                할인 정보
              </h3>
              <Card className="bg-gray-50 border-border">
                <div className="p-4 md:p-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {quote.discount_rate && quote.discount_rate > 0 && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">할인율</p>
                        <p className="font-medium text-gray-900">{quote.discount_rate}%</p>
                      </div>
                    )}
                    {quote.discount_amount && quote.discount_amount > 0 && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">할인 금액</p>
                        <p className="font-medium text-red-600">
                          -₩{new Intl.NumberFormat('ko-KR').format(quote.discount_amount)}
                        </p>
                      </div>
                    )}
                    {quote.promotion_code && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">프로모션 코드</p>
                        <p className="font-medium text-gray-900">{quote.promotion_code}</p>
                      </div>
                    )}
                    {quote.promotion_name && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">프로모션명</p>
                        <p className="font-medium text-gray-900">{quote.promotion_name}</p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* 10. 참고사항 */}
          {quote.description && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                참고사항
              </h3>
              <Card className="bg-gray-50 border-border">
                <div className="p-4 md:p-5">
                  <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{quote.description}</p>
                </div>
              </Card>
            </div>
          )}

          {/* 11. 총 합계 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">총 합계</h3>
            <Card className="bg-gray-50 border-border">
              <div className="p-4 md:p-6 space-y-4">
                <div className="flex justify-between items-center text-base">
                  <span className="text-gray-600">소계</span>
                  <span className="text-gray-900 font-semibold">₩{new Intl.NumberFormat('ko-KR').format(quote.subtotal)}</span>
                </div>
                {quote.tax > 0 && (
                  <div className="flex justify-between items-center text-base">
                    <span className="text-gray-600">부가세 (10%)</span>
                    <span className="text-gray-900 font-semibold">₩{new Intl.NumberFormat('ko-KR').format(quote.tax)}</span>
                  </div>
                )}
                {quote.discount_amount && quote.discount_amount > 0 && (
                  <div className="flex justify-between items-center text-base">
                    <span className="text-gray-600">할인</span>
                    <span className="text-red-600 font-semibold">-₩{new Intl.NumberFormat('ko-KR').format(quote.discount_amount)}</span>
                  </div>
                )}
                <Separator className="bg-border" />
                <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                  <span className="text-xl font-bold text-gray-900">총 금액</span>
                  <div className="text-right">
                    <span className="text-3xl font-bold text-gray-900">
                      ₩{new Intl.NumberFormat('ko-KR').format(quote.total)}
                    </span>
                    <p className="text-sm text-gray-600 mt-1">부가세 포함</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Footer */}
          <div className="text-center pt-6 border-t border-border">
            <div className="space-y-2 text-sm">
              <p className="text-gray-600">본 견적서는 <span className="text-gray-900 font-medium">{new Date(quote.created_at).toLocaleDateString('ko-KR')}</span>에 작성되었습니다.</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}