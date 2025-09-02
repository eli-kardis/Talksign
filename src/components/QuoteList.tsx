"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ImageWithFallback } from "./ui/ImageWithFallback";
import { useAuth } from "@/contexts/AuthContext";
import {
  FileText,
  Search,
  MessageSquare,
  Eye,
  Edit,
  Plus,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

// Database Quote 타입 (API에서 받는 데이터)
interface DatabaseQuote {
  id: string;
  user_id: string;
  client_name: string;
  client_email: string;
  client_phone?: string;
  client_company?: string;
  title: string;
  description?: string;
  items: Array<{ id: string; name: string; amount: number; }>;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
  status: "draft" | "sent" | "approved" | "rejected" | "expired";
  expires_at?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

// UI 표시용 Quote 타입
interface Quote {
  id: string;
  client: string;
  project: string;
  amount: number;
  status: "draft" | "sent" | "approved" | "rejected" | "expired";
  date: string;
  dueDate?: string;
  phone?: string;
  clientLogo?: string;
  company?: string;
}

interface QuoteListProps {
  onNewQuote: () => void;
  onViewQuote: (quoteId: string) => void;
}

// 데이터베이스 Quote를 UI Quote로 변환하는 함수
const transformQuote = (dbQuote: DatabaseQuote): Quote => ({
  id: dbQuote.id,
  client: dbQuote.client_name,
  project: dbQuote.title,
  amount: dbQuote.total_amount,
  status: dbQuote.status,
  date: new Date(dbQuote.created_at).toLocaleDateString('ko-KR'),
  dueDate: dbQuote.expires_at ? new Date(dbQuote.expires_at).toLocaleDateString('ko-KR') : undefined,
  phone: dbQuote.client_phone || undefined,
  company: dbQuote.client_company || undefined,
  clientLogo: undefined, // 빈 문자열 대신 undefined 사용
});

type TabKey = "all" | "draft" | "sent" | "approved" | "rejected" | "expired";

export function QuoteList({ onNewQuote, onViewQuote }: QuoteListProps) {
  const { user } = useAuth();
  const [active, setActive] = useState<TabKey>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 견적서 데이터 로드
  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/quotes');
        
        if (!response.ok) {
          throw new Error('Failed to fetch quotes');
        }

        const dbQuotes: DatabaseQuote[] = await response.json();
        const transformedQuotes = dbQuotes.map(transformQuote);
        setQuotes(transformedQuotes);
      } catch (err) {
        console.error('Error fetching quotes:', err);
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuotes();
  }, []);

  // ✅ 타입 안전한 카운트 계산
  const counts = useMemo(() => {
    const c: Record<TabKey, number> = {
      all: quotes.length,
      draft: 0,
      sent: 0,
      approved: 0,
      rejected: 0,
      expired: 0,
    };
    for (const q of quotes) c[q.status] += 1;
    return c;
  }, [quotes]);

  const filteredQuotes = useMemo(() => {
    const list =
      active === "all" ? quotes : quotes.filter((q) => q.status === active);
    if (!searchTerm.trim()) return list;
    const s = searchTerm.trim().toLowerCase();
    return list.filter(
      (q) =>
        q.client.toLowerCase().includes(s) ||
        q.project.toLowerCase().includes(s)
    );
  }, [active, searchTerm, quotes]);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* 상단 필터/검색/버튼 */}
      <div className="flex flex-col gap-3 md:gap-4 md:flex-row md:items-center md:justify-between">
        <div className="w-full md:w-auto">
          <Tabs value={active} onValueChange={(v) => setActive(v as TabKey)}>
            <TabsList className="grid w-full grid-cols-2 md:inline-flex md:w-auto gap-2 p-0 bg-transparent">
              <TabsTrigger value="all">전체 ({counts.all})</TabsTrigger>
              <TabsTrigger value="draft">임시저장 ({counts.draft})</TabsTrigger>
              <TabsTrigger value="sent" className="flex items-center justify-center gap-2">
                <MessageSquare className="w-4 h-4" />
                발송됨 ({counts.sent})
              </TabsTrigger>
              <TabsTrigger value="approved" className="flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" />
                승인됨 ({counts.approved})
              </TabsTrigger>
              <TabsTrigger value="rejected" className="flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4" />
                거절됨 ({counts.rejected})
              </TabsTrigger>
              <TabsTrigger value="expired">만료됨 ({counts.expired})</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="고객명 또는 프로젝트명으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-input-background border-border text-sm md:text-base"
            />
          </div>
          <Button
            onClick={onNewQuote}
            className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-primary-foreground"
          >
            <Plus className="w-4 h-4 mr-2" />
            새 견적서
          </Button>
        </div>
      </div>

      {/* 로딩 상태 */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">견적서를 불러오는 중...</span>
        </div>
      )}

      {/* 에러 상태 */}
      {error && (
        <Card className="p-6 text-center bg-card border-border border-destructive/50">
          <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-2" />
          <h3 className="text-lg font-medium text-foreground mb-2">오류가 발생했습니다</h3>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="border-border"
          >
            다시 시도
          </Button>
        </Card>
      )}

      {/* 리스트 */}
      {!loading && !error && (
        <div className="grid grid-cols-1 gap-3 md:gap-4">
          {filteredQuotes.map((q) => (
          <Card
            key={q.id}
            // ✅ 토큰 기반 유틸로 교체(빌드 안정성)
            className="p-4 md:p-5 bg-card border-border hover:border-primary/40 transition-colors"
          >
            <div className="flex items-start gap-3 md:gap-4">
              <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden border border-border bg-muted">
                <ImageWithFallback
                  src={q.clientLogo || undefined}
                  alt={`${q.client} 로고`}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base md:text-lg font-medium text-foreground truncate">
                    {q.client}
                  </h3>
                  <Badge variant="outline" className="border-border text-muted-foreground">
                    {q.project}
                  </Badge>
                </div>

                <div className="mt-1 md:mt-1.5 text-xs md:text-sm text-muted-foreground flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {q.date} {q.dueDate && `~ ${q.dueDate}`}
                  </span>
                  {q.phone && (
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {q.phone}
                    </span>
                  )}
                  <span className="font-mono text-primary">
                    ₩{new Intl.NumberFormat('ko-KR').format(q.amount)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="secondary" onClick={() => onViewQuote(q.id)}>
                  <Eye className="w-4 h-4 mr-1.5" />
                  보기
                </Button>
                <Button variant="outline">
                  <Edit className="w-4 h-4 mr-1.5" />
                  수정
                </Button>
              </div>
            </div>
          </Card>
        ))}

          {filteredQuotes.length === 0 && (
            <Card className="p-8 md:p-12 text-center bg-card border-border">
              <FileText className="w-10 h-10 md:w-12 md:h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-base md:text-lg font-medium text-foreground mb-2">견적서가 없습니다</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-4">새로운 견적서를 작성해보세요</p>
              <Button
                onClick={onNewQuote}
                className="bg-primary hover:bg-primary-hover text-primary-foreground"
              >
                <Plus className="w-4 h-4 mr-2" />
                새 견적서 작성
              </Button>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}