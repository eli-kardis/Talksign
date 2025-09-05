"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar as CalendarComponent } from "./ui/calendar";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
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
  ChevronUp,
  ChevronDown,
  Filter,
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
  onEditQuote?: (quoteId: string) => void;
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

type SortField = 'client' | 'project' | 'date' | 'status' | 'amount';
type SortDirection = 'asc' | 'desc';

// 정렬 가능한 헤더 컴포넌트
function SortableHeader({ 
  children, 
  field, 
  currentSort, 
  currentDirection, 
  onSort 
}: {
  children: React.ReactNode;
  field: SortField;
  currentSort: SortField | null;
  currentDirection: SortDirection;
  onSort: (field: SortField) => void;
}) {
  const isActive = currentSort === field;
  
  return (
    <th 
      className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/30 transition-colors select-none"
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-2">
        {children}
        <div className="flex flex-col">
          <ChevronUp 
            className={`w-3 h-3 ${
              isActive && currentDirection === 'asc' 
                ? 'text-primary' 
                : 'text-muted-foreground/50'
            }`} 
          />
          <ChevronDown 
            className={`w-3 h-3 -mt-1 ${
              isActive && currentDirection === 'desc' 
                ? 'text-primary' 
                : 'text-muted-foreground/50'
            }`} 
          />
        </div>
      </div>
    </th>
  );
}

export function QuoteList({ onNewQuote, onViewQuote, onEditQuote }: QuoteListProps) {
  const { user } = useAuth();
  const [active, setActive] = useState<TabKey>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterAmountMin, setFilterAmountMin] = useState<string>('');
  const [filterAmountMax, setFilterAmountMax] = useState<string>('');
  const [filterDateStart, setFilterDateStart] = useState<Date | undefined>(undefined);
  const [filterDateEnd, setFilterDateEnd] = useState<Date | undefined>(undefined);

  // 숫자를 3자리마다 콤마를 넣어 포맷팅하는 함수
  const formatNumber = (num: string) => {
    const number = num.replace(/,/g, '');
    if (number === '') return '';
    return parseInt(number).toLocaleString('ko-KR');
  };

  // 숫자를 한글로 변환하는 함수
  const numberToKorean = (num: string) => {
    const number = parseInt(num.replace(/,/g, ''));
    if (isNaN(number) || number === 0) return '';
    
    const units = ['', '만', '억', '조'];
    const digits = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
    const tens = ['', '십', '이십', '삼십', '사십', '오십', '육십', '칠십', '팔십', '구십'];
    const hundreds = ['', '일백', '이백', '삼백', '사백', '오백', '육백', '칠백', '팔백', '구백'];
    const thousands = ['', '일천', '이천', '삼천', '사천', '오천', '육천', '칠천', '팔천', '구천'];
    
    if (number < 10000) {
      let result = '';
      const thousand = Math.floor(number / 1000);
      const hundred = Math.floor((number % 1000) / 100);
      const ten = Math.floor((number % 100) / 10);
      const one = number % 10;
      
      if (thousand > 0) result += thousands[thousand];
      if (hundred > 0) result += hundreds[hundred];
      if (ten > 0) result += tens[ten];
      if (one > 0) result += digits[one];
      
      return result || '영';
    }
    
    let result = '';
    let unitIndex = 0;
    let tempNum = number;
    
    while (tempNum > 0) {
      const chunk = tempNum % 10000;
      if (chunk > 0) {
        let chunkStr = '';
        const thousand = Math.floor(chunk / 1000);
        const hundred = Math.floor((chunk % 1000) / 100);
        const ten = Math.floor((chunk % 100) / 10);
        const one = chunk % 10;
        
        if (thousand > 0) chunkStr += thousands[thousand];
        if (hundred > 0) chunkStr += hundreds[hundred];
        if (ten > 0) chunkStr += tens[ten];
        if (one > 0) chunkStr += digits[one];
        
        result = chunkStr + units[unitIndex] + result;
      }
      tempNum = Math.floor(tempNum / 10000);
      unitIndex++;
    }
    
    return result || '영';
  };

  const handleAmountMinChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    setFilterAmountMin(formatNumber(numericValue));
  };

  const handleAmountMaxChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    setFilterAmountMax(formatNumber(numericValue));
  };

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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedAndFilteredQuotes = useMemo(() => {
    // 먼저 필터링
    let list = active === "all" ? quotes : quotes.filter((q) => q.status === active);
    
    // 검색 필터
    if (searchTerm.trim()) {
      const s = searchTerm.trim().toLowerCase();
      list = list.filter(
        (q) =>
          q.client.toLowerCase().includes(s) ||
          q.project.toLowerCase().includes(s)
      );
    }

    // 상태 필터
    if (filterStatus !== 'all') {
      list = list.filter((q) => q.status === filterStatus);
    }

    // 금액 필터
    if (filterAmountMin !== '') {
      const minAmount = parseInt(filterAmountMin.replace(/,/g, ''));
      if (!isNaN(minAmount)) {
        list = list.filter((q) => q.amount >= minAmount);
      }
    }
    if (filterAmountMax !== '') {
      const maxAmount = parseInt(filterAmountMax.replace(/,/g, ''));
      if (!isNaN(maxAmount)) {
        list = list.filter((q) => q.amount <= maxAmount);
      }
    }

    // 날짜 필터
    if (filterDateStart) {
      list = list.filter((q) => new Date(q.date) >= filterDateStart);
    }
    if (filterDateEnd) {
      list = list.filter((q) => new Date(q.date) <= filterDateEnd);
    }

    // 그다음 정렬
    if (sortField) {
      list.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (sortField) {
          case 'client':
            aValue = a.client.toLowerCase();
            bValue = b.client.toLowerCase();
            break;
          case 'project':
            aValue = a.project.toLowerCase();
            bValue = b.project.toLowerCase();
            break;
          case 'date':
            aValue = new Date(a.date);
            bValue = new Date(b.date);
            break;
          case 'status':
            const statusOrder = { draft: 0, sent: 1, approved: 2, rejected: 3, expired: 4 };
            aValue = statusOrder[a.status as keyof typeof statusOrder];
            bValue = statusOrder[b.status as keyof typeof statusOrder];
            break;
          case 'amount':
            aValue = a.amount;
            bValue = b.amount;
            break;
          default:
            return 0;
        }

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return list;
  }, [active, searchTerm, quotes, sortField, sortDirection, filterStatus, filterAmountMin, filterAmountMax, filterDateStart, filterDateEnd]);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* 상단 검색 및 버튼 */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="고객명 또는 프로젝트명으로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-input-background border-border text-sm md:text-base"
          />
        </div>
        
        <div className="flex items-center gap-2 md:gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="px-4 py-2">
                <Filter className="w-4 h-4 mr-2" />
                필터
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 bg-card border-border" align="end">
              <div className="space-y-6 p-2">
                <h4 className="font-semibold text-lg">필터 옵션</h4>
                
                <div className="space-y-3">
                  <label className="text-base font-medium">상태</label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="상태 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">모든 상태</SelectItem>
                      <SelectItem value="draft">임시저장</SelectItem>
                      <SelectItem value="sent">발송됨</SelectItem>
                      <SelectItem value="approved">승인됨</SelectItem>
                      <SelectItem value="rejected">거절됨</SelectItem>
                      <SelectItem value="expired">만료됨</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <label className="text-base font-medium">금액 범위</label>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <div className="relative">
                        <Input
                          type="text"
                          placeholder="최소 금액"
                          value={filterAmountMin}
                          onChange={(e) => handleAmountMinChange(e.target.value)}
                          className="h-11 pr-8"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">원</span>
                      </div>
                      {filterAmountMin && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {numberToKorean(filterAmountMin)}원
                        </p>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="relative">
                        <Input
                          type="text"
                          placeholder="최대 금액"
                          value={filterAmountMax}
                          onChange={(e) => handleAmountMaxChange(e.target.value)}
                          className="h-11 pr-8"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">원</span>
                      </div>
                      {filterAmountMax && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {numberToKorean(filterAmountMax)}원
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-base font-medium">날짜 범위</label>
                  <div className="flex gap-3">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full h-11 justify-start text-left font-normal">
                          <Calendar className="mr-2 h-4 w-4" />
                          {filterDateStart ? format(filterDateStart, "yyyy년 MM월 dd일", { locale: ko }) : "시작 날짜"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-card border-border" align="start" side="bottom" sideOffset={5}>
                        <CalendarComponent
                          mode="single"
                          selected={filterDateStart}
                          onSelect={setFilterDateStart}
                          locale={ko}
                          initialFocus
                          className="p-3 min-w-[320px]"
                          formatters={{
                            formatCaption: (date, options) => {
                              return format(date, "yyyy년 M월", { locale: ko });
                            },
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full h-11 justify-start text-left font-normal">
                          <Calendar className="mr-2 h-4 w-4" />
                          {filterDateEnd ? format(filterDateEnd, "yyyy년 MM월 dd일", { locale: ko }) : "종료 날짜"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-card border-border" align="start" side="bottom" sideOffset={5}>
                        <CalendarComponent
                          mode="single"
                          selected={filterDateEnd}
                          onSelect={setFilterDateEnd}
                          locale={ko}
                          initialFocus
                          className="p-3 min-w-[320px]"
                          formatters={{
                            formatCaption: (date, options) => {
                              return format(date, "yyyy년 M월", { locale: ko });
                            },
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
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

      {/* 정렬 가능한 테이블 */}
      {!loading && !error && sortedAndFilteredQuotes.length > 0 && (
        <Card className="bg-card border-border shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <SortableHeader 
                    field="client" 
                    currentSort={sortField} 
                    currentDirection={sortDirection}
                    onSort={handleSort}
                  >
                    회사명
                  </SortableHeader>
                  <SortableHeader 
                    field="project" 
                    currentSort={sortField} 
                    currentDirection={sortDirection}
                    onSort={handleSort}
                  >
                    견적서 제목
                  </SortableHeader>
                  <SortableHeader 
                    field="date" 
                    currentSort={sortField} 
                    currentDirection={sortDirection}
                    onSort={handleSort}
                  >
                    견적일자
                  </SortableHeader>
                  <SortableHeader 
                    field="status" 
                    currentSort={sortField} 
                    currentDirection={sortDirection}
                    onSort={handleSort}
                  >
                    상태
                  </SortableHeader>
                  <SortableHeader 
                    field="amount" 
                    currentSort={sortField} 
                    currentDirection={sortDirection}
                    onSort={handleSort}
                  >
                    총합계
                  </SortableHeader>
                </tr>
              </thead>
              <tbody>
                {sortedAndFilteredQuotes.map((quote) => (
                  <tr 
                    key={quote.id} 
                    className="hover:bg-muted/30 hover:shadow-sm transition-all duration-200 border-b border-border/50 cursor-pointer group" 
                    onClick={() => onViewQuote(quote.id)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium text-foreground text-sm">{quote.client}</p>
                          {quote.company && (
                            <p className="text-xs text-muted-foreground">{quote.company}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground text-sm group-hover:text-primary transition-colors">{quote.project}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <p className="text-foreground">{quote.date}</p>
                        {quote.dueDate && quote.dueDate !== quote.date && (
                          <p className="text-xs text-muted-foreground">~ {quote.dueDate}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge 
                        variant={quote.status === 'approved' ? 'default' : quote.status === 'rejected' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {quote.status === 'draft' ? '임시저장' : 
                         quote.status === 'sent' ? '발송됨' : 
                         quote.status === 'approved' ? '승인됨' : 
                         quote.status === 'rejected' ? '거절됨' : '만료됨'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono font-semibold text-foreground text-sm">
                        ₩{new Intl.NumberFormat('ko-KR').format(quote.amount)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* 빈 상태 */}
      {!loading && !error && sortedAndFilteredQuotes.length === 0 && (
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
  );
}