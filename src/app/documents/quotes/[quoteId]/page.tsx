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
          <Button>
            <Edit className="w-4 h-4 mr-2" />
            수정
          </Button>
        </div>
      </div>

      {/* Quote Document */}
      <Card className="max-w-4xl mx-auto bg-card border-border shadow-lg">
        <div className="p-6 md:p-8 space-y-6 md:space-y-8">
          
          {/* 1. 견적서 제목 */}
          <div className="text-center border-b border-border pb-6">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">{quote.title}</h2>
            <p className="text-sm text-muted-foreground">견적서 번호: {quote.id.slice(0, 8).toUpperCase()}</p>
          </div>

          {/* 2. 견적일자 */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-muted/30 px-4 py-2 rounded-lg">
              <Calendar className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">견적일자</p>
                <p className="font-semibold text-foreground">{new Date(quote.created_at).toLocaleDateString('ko-KR')}</p>
              </div>
            </div>
          </div>

          <Separator className="bg-border" />

          {/* 3. 공급자 정보 */}
          {quote.supplier && (
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                공급자 정보
              </h3>
              <Card className="bg-muted/20 border-border">
                <div className="p-4 md:p-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-3">
                      <div>
                        <p className="font-semibold text-foreground text-lg">
                          {quote.supplier.company_name || quote.supplier.business_name || quote.supplier.name}
                        </p>
                        <p className="text-sm text-muted-foreground">대표자: {quote.supplier.name}</p>
                        {quote.supplier.business_registration_number && (
                          <p className="text-sm text-muted-foreground">
                            사업자등록번호: {quote.supplier.business_registration_number}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm text-foreground">{quote.supplier.email}</span>
                      </div>
                      {quote.supplier.phone && (
                        <div className="flex items-center gap-3">
                          <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm text-foreground">{quote.supplier.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* 4. 수신자 정보 */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              수신자 정보
            </h3>
            <Card className="bg-muted/30 border-border">
              <div className="p-4 md:p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-3">
                    <div>
                      <p className="font-semibold text-foreground text-lg">{quote.client_name}</p>
                      {quote.client_company && (
                        <p className="text-sm text-muted-foreground mt-1">{quote.client_company}</p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm text-foreground">{quote.client_email}</span>
                    </div>
                    {quote.client_phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm text-foreground">{quote.client_phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* 5. 견적 유효기간 */}
          {quote.expires_at && (
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                견적 유효기간
              </h3>
              <Card className="bg-primary/5 border-primary/20">
                <div className="p-4 md:p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Clock className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        {new Date(quote.expires_at).toLocaleDateString('ko-KR')}까지 유효
                      </p>
                      <p className="text-sm text-muted-foreground">
                        해당 날짜 이후에는 견적이 자동으로 만료됩니다.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* 6. 견적 항목 */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              견적 항목
            </h3>
            <Card className="border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px]">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 md:px-6 py-4 text-left text-sm font-semibold text-foreground">항목명</th>
                      <th className="px-4 md:px-6 py-4 text-right text-sm font-semibold text-foreground">금액</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {quote.items.map((item, index) => (
                      <tr key={item.id || index} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 md:px-6 py-4">
                          <div>
                            <p className="font-medium text-foreground">{item.name}</p>
                            {item.description && (
                              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{item.description}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4 text-right">
                          <span className="font-mono text-lg font-medium text-foreground">
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
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-primary" />
                참고사항
              </h3>
              <Card className="bg-muted/20 border-border">
                <div className="p-4 md:p-5">
                  <p className="text-foreground whitespace-pre-wrap leading-relaxed">{quote.description}</p>
                </div>
              </Card>
            </div>
          )}

          {/* 8. 총 합계 */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">총 합계</h3>
            <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
              <div className="p-4 md:p-6 space-y-4">
                <div className="flex justify-between items-center text-base">
                  <span className="text-muted-foreground">소계</span>
                  <span className="font-mono text-foreground font-semibold">₩{new Intl.NumberFormat('ko-KR').format(quote.subtotal)}</span>
                </div>
                {quote.tax_amount > 0 && (
                  <div className="flex justify-between items-center text-base">
                    <span className="text-muted-foreground">부가세 ({(quote.tax_rate * 100).toFixed(0)}%)</span>
                    <span className="font-mono text-foreground font-semibold">₩{new Intl.NumberFormat('ko-KR').format(quote.tax_amount)}</span>
                  </div>
                )}
                <Separator className="bg-border" />
                <div className="flex justify-between items-center bg-primary/10 p-4 rounded-lg">
                  <span className="text-xl font-bold text-foreground">총 금액</span>
                  <div className="text-right">
                    <span className="font-mono text-3xl font-bold text-primary">
                      ₩{new Intl.NumberFormat('ko-KR').format(quote.total_amount)}
                    </span>
                    <p className="text-sm text-muted-foreground mt-1">부가세 포함</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Footer */}
          <div className="text-center pt-6 border-t border-border">
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <span className="text-xs font-medium">LinkFlow Quote System</span>
                <div className="w-2 h-2 rounded-full bg-primary"></div>
              </div>
              <p>본 견적서는 <span className="text-foreground font-medium">{new Date(quote.created_at).toLocaleDateString('ko-KR')}</span>에 작성되었습니다.</p>
              {quote.expires_at && (
                <p>견적서 승인은 <span className="text-foreground font-medium">{new Date(quote.expires_at).toLocaleDateString('ko-KR')}</span>까지 가능합니다.</p>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}