// src/app/documents/quotes/[quoteId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { notFound, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Download, 
  Share2, 
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
  amount: number;
}

interface SupplierInfo {
  name: string;
  email: string;
  phone?: string;
  business_name?: string;
  business_registration_number?: string;
  company_name?: string;
  business_address?: string;
}

interface Quote {
  id: string;
  user_id: string;
  client_name: string;
  client_email: string;
  client_phone?: string;
  client_company?: string;
  client_business_number?: string;
  client_address?: string;
  title: string;
  description?: string;
  items: QuoteItem[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
  status: "draft" | "sent" | "approved" | "rejected" | "expired";
  expires_at?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
  supplier?: SupplierInfo;
}

export default function QuoteDetailPage({ params }: { params: Promise<{ quoteId: string }> }) {
  const router = useRouter();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quoteId, setQuoteId] = useState<string | null>(null);

  useEffect(() => {
    const unwrapParams = async () => {
      const resolvedParams = await params;
      setQuoteId(resolvedParams.quoteId);
    };

    unwrapParams();
  }, [params]);

  useEffect(() => {
    const fetchQuote = async () => {
      if (!quoteId) return;

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/quotes/${quoteId}`);
        
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
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">견적서를 불러오는 중...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 text-center bg-card border-border border-destructive/50">
        <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-2" />
        <h3 className="text-lg font-medium text-foreground mb-2">오류가 발생했습니다</h3>
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
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

  const handleCreateContract = async () => {
    try {
      // 견적서 데이터를 기반으로 계약서 생성
      const contractData = {
        quote_id: quote.id,
        title: `${quote.title} - 계약서`,
        client_name: quote.client_name,
        client_email: quote.client_email,
        client_phone: quote.client_phone,
        client_company: quote.client_company,
        client_business_number: quote.client_business_number,
        client_address: quote.client_address,
        supplier_info: quote.supplier,
        items: quote.items,
        subtotal: quote.subtotal,
        tax_amount: quote.tax_amount,
        tax_rate: quote.tax_rate,
        total_amount: quote.total_amount,
        description: quote.description,
        terms: [
          "프로젝트 수행 기간은 계약서 체결 후 협의하여 결정합니다.",
          "계약금 50% 선입금, 완료 후 50% 잔금 지급",
          "프로젝트 요구사항 변경 시 추가 비용이 발생할 수 있습니다.",
          "저작권은 완전한 대금 지급 후 발주처로 이전됩니다.",
          "계약 위반 시 위약금이 부과될 수 있습니다."
        ],
        status: 'draft'
      };

      const response = await fetch('/api/contracts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contractData),
      });

      if (response.ok) {
        const contract = await response.json();
        // 새로 생성된 계약서 편집 페이지로 이동
        router.push(`/documents/contracts/${contract.id}/edit`);
      } else {
        throw new Error('계약서 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('Contract creation error:', error);
      alert('계약서 생성 중 오류가 발생했습니다.');
    }
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
            <h1 className="text-2xl font-bold text-foreground">{quote.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
              <span className="text-sm text-muted-foreground">
                {new Date(quote.created_at).toLocaleDateString('ko-KR')}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Share2 className="w-4 h-4 mr-2" />
            공유
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
          <Button onClick={() => router.push(`/documents/quotes/${quoteId}/edit`)}>
            <Edit className="w-4 h-4 mr-2" />
            수정
          </Button>
        </div>
      </div>

      {/* Quote Document */}
      <Card className="max-w-4xl mx-auto bg-white border-gray-300 shadow-lg">
        <div className="p-6 md:p-8 space-y-6 md:space-y-8 text-black">
          
          {/* 1. 견적서 제목과 견적일자 */}
          <div className="border-b border-gray-300 pb-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h2 className="text-3xl md:text-4xl font-bold text-black mb-2">{quote.title}</h2>
                <p className="text-sm text-gray-600">견적서 번호: {quote.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 justify-end">
                  <span className="text-sm font-medium text-gray-600">견적일자:</span>
                  <span className="font-semibold text-black">
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
                <h3 className="text-lg font-semibold text-black mb-4">
                  공급자 정보
                </h3>
                <Card className="bg-gray-50 border-gray-300 h-full">
                  <div className="p-4 md:p-5">
                    <div className="space-y-2">
                      <p className="font-semibold text-black text-lg">
                        회사명: {quote.supplier.company_name || quote.supplier.business_name || quote.supplier.name}
                      </p>
                      <p className="text-sm text-gray-700">대표자: {quote.supplier.name}</p>
                      {quote.supplier.business_registration_number && (
                        <p className="text-sm text-gray-700">
                          사업자등록번호: {quote.supplier.business_registration_number}
                        </p>
                      )}
                      <p className="text-sm text-gray-700">이메일: {quote.supplier.email}</p>
                      {quote.supplier.phone && (
                        <p className="text-sm text-gray-700">전화번호: {quote.supplier.phone}</p>
                      )}
                      {quote.supplier.business_address && (
                        <p className="text-sm text-gray-700">주소: {quote.supplier.business_address}</p>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* 수신자 정보 */}
            <div>
              <h3 className="text-lg font-semibold text-black mb-4">
                수신자 정보
              </h3>
              <Card className="bg-gray-50 border-gray-300 h-full">
                <div className="p-4 md:p-5">
                  <div className="space-y-2">
                    {quote.client_company && (
                      <p className="font-semibold text-black text-lg">회사명: {quote.client_company}</p>
                    )}
                    <p className="text-sm text-gray-700">고객명: {quote.client_name}</p>
                    {quote.client_business_number && (
                      <p className="text-sm text-gray-700">
                        사업자등록번호: {quote.client_business_number}
                      </p>
                    )}
                    <p className="text-sm text-gray-700">이메일: {quote.client_email}</p>
                    {quote.client_phone && (
                      <p className="text-sm text-gray-700">전화번호: {quote.client_phone}</p>
                    )}
                    {quote.client_address && (
                      <p className="text-sm text-gray-700">주소: {quote.client_address}</p>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* 5. 견적 유효기간 */}
          {quote.expires_at && (
            <div>
              <h3 className="text-lg font-semibold text-black mb-4">
                견적 유효기간
              </h3>
              <Card className="bg-gray-50 border-gray-300">
                <div className="p-4 md:p-5">
                  <p className="font-semibold text-black mb-2">
                    {new Date(quote.expires_at).toLocaleDateString('ko-KR')}까지 유효
                  </p>
                  <p className="text-sm text-gray-700">
                    해당 날짜 이후에는 견적이 자동으로 만료됩니다.
                  </p>
                </div>
              </Card>
            </div>
          )}

          {/* 6. 견적 항목 */}
          <div>
            <h3 className="text-lg font-semibold text-black mb-4">
              견적 항목
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
                    {quote.items.map((item, index) => (
                      <tr key={item.id || index} className="hover:bg-gray-50 transition-colors border-b border-gray-200">
                        <td className="px-4 py-3">
                          <p className="font-medium text-black text-sm">{item.name}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-700">{item.description || '-'}</p>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <p className="text-sm text-black">{item.quantity || 1}</p>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <p className="text-sm text-black">개</p>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-sm text-black">
                            ₩{new Intl.NumberFormat('ko-KR').format(item.unit_price || item.amount)}
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

          {/* 7. 참고사항 */}
          {quote.description && (
            <div>
              <h3 className="text-lg font-semibold text-black mb-4">
                참고사항
              </h3>
              <Card className="bg-gray-50 border-gray-300">
                <div className="p-4 md:p-5">
                  <p className="text-black whitespace-pre-wrap leading-relaxed">{quote.description}</p>
                </div>
              </Card>
            </div>
          )}

          {/* 8. 총 합계 */}
          <div>
            <h3 className="text-lg font-semibold text-black mb-4">총 합계</h3>
            <Card className="bg-gray-50 border-gray-300">
              <div className="p-4 md:p-6 space-y-4">
                <div className="flex justify-between items-center text-base">
                  <span className="text-gray-700">소계</span>
                  <span className="text-black font-semibold">₩{new Intl.NumberFormat('ko-KR').format(quote.subtotal)}</span>
                </div>
                {quote.tax_amount > 0 && (
                  <div className="flex justify-between items-center text-base">
                    <span className="text-gray-700">부가세 ({(quote.tax_rate * 100).toFixed(0)}%)</span>
                    <span className="text-black font-semibold">₩{new Intl.NumberFormat('ko-KR').format(quote.tax_amount)}</span>
                  </div>
                )}
                <Separator className="bg-gray-300" />
                <div className="flex justify-between items-center bg-gray-100 p-4 rounded-lg">
                  <span className="text-xl font-bold text-black">총 금액</span>
                  <div className="text-right">
                    <span className="text-3xl font-bold text-black">
                      ₩{new Intl.NumberFormat('ko-KR').format(quote.total_amount)}
                    </span>
                    <p className="text-sm text-gray-700 mt-1">부가세 포함</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Footer */}
          <div className="text-center pt-6 border-t border-border">
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-black"></div>
                <span className="text-xs font-medium text-black">LinkFlow Quote System</span>
                <div className="w-2 h-2 rounded-full bg-black"></div>
              </div>
              <p className="text-gray-700">본 견적서는 <span className="text-black font-medium">{new Date(quote.created_at).toLocaleDateString('ko-KR')}</span>에 작성되었습니다.</p>
              {quote.expires_at && (
                <p className="text-gray-700">견적서 승인은 <span className="text-black font-medium">{new Date(quote.expires_at).toLocaleDateString('ko-KR')}</span>까지 가능합니다.</p>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}