import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar as CalendarComponent } from './ui/calendar';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { PenTool, FileText, Clock, CheckCircle, AlertCircle, Search, MessageSquare, Eye, Edit, Calendar, User, Plus, ChevronUp, ChevronDown, Filter, Trash2 } from 'lucide-react';
import { Checkbox } from './ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';

interface Contract {
  id: string;
  client: string;
  project: string;
  amount: number;
  status: 'draft' | 'sent' | 'completed';
  createdDate: string;
  signedDate?: string;
  contractUrl: string;
  phone: string;
}

const mockContracts: Contract[] = [
  {
    id: "90cfcedd-b86d-4f13-96c0-bce2d9072665",
    client: "스타트업 A",
    project: "웹사이트 리뉴얼 프로젝트",
    amount: 3000000,
    status: "completed",
    createdDate: "2024-01-15",
    signedDate: "2024-01-16",
    contractUrl: "#",
    phone: "010-1234-5678"
  },
  {
    id: "7b4e3f2a-c5d6-4e8f-9a1b-2c3d4e5f6789",
    client: "기업 B",
    project: "모바일 앱 개발",
    amount: 8000000,
    status: "sent",
    createdDate: "2024-01-14",
    contractUrl: "#",
    phone: "010-2345-6789"
  },
  {
    id: "a1b2c3d4-e5f6-4789-abc1-23456789abcd",
    client: "개인 C",
    project: "브랜딩 디자인 패키지",
    amount: 1500000,
    status: "completed",
    createdDate: "2024-01-13",
    signedDate: "2024-01-14",
    contractUrl: "#",
    phone: "010-3456-7890"
  },
  {
    id: "f9e8d7c6-b5a4-4321-9876-543210fedcba",
    client: "소상공인 D",
    project: "온라인 쇼핑몰 구축",
    amount: 2500000,
    status: "draft",
    createdDate: "2024-01-12",
    contractUrl: "#",
    phone: "010-4567-8901"
  }
];

interface ContractViewProps {
  onNewContract: () => void;
  onEditContract?: (contractId: string) => void;
  onViewContract?: (contractId: string) => void;
}

type TabKey = "all" | "draft" | "sent" | "completed";

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

export function ContractView({ onNewContract, onEditContract, onViewContract }: ContractViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedContracts, setSelectedContracts] = useState<string[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load contracts from API
  useEffect(() => {
    const loadContracts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/contracts');
        
        if (!response.ok) {
          throw new Error('Failed to fetch contracts');
        }
        
        const data = await response.json();
        setContracts(data);
      } catch (err) {
        console.error('Error loading contracts:', err);
        setError(err instanceof Error ? err.message : 'Failed to load contracts');
        // Fallback to mock data if API fails
        setContracts(mockContracts);
      } finally {
        setLoading(false);
      }
    };

    loadContracts();
  }, []);

  // Selection handlers
  const handleSelectContract = (contractId: string, checked: boolean) => {
    if (checked) {
      setSelectedContracts(prev => [...prev, contractId]);
    } else {
      setSelectedContracts(prev => prev.filter(id => id !== contractId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedContracts(sortedAndFilteredContracts.map(contract => contract.id));
    } else {
      setSelectedContracts([]);
    }
  };

  // Delete functionality
  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      for (const contractId of selectedContracts) {
        const response = await fetch(`/api/contracts/${contractId}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error(`Failed to delete contract ${contractId}`);
        }
      }
      setContracts(prev => prev.filter(contract => !selectedContracts.includes(contract.id)));
      setSelectedContracts([]);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting contracts:', error);
      alert('계약서 삭제 중 오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };
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

  const getStatusBadge = (status: Contract['status']) => {
    const statusConfig = {
      draft: { label: '임시저장', className: 'bg-muted text-muted-foreground', icon: FileText },
      sent: { label: '발송됨', className: 'bg-accent text-accent-foreground', icon: PenTool },
      completed: { label: '계약완료', className: 'bg-primary text-primary-foreground', icon: CheckCircle }
    };
    // Default fallback for unknown status
    return statusConfig[status] || { label: '알 수 없음', className: 'bg-muted text-muted-foreground', icon: AlertCircle };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount) + '원';
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedAndFilteredContracts = React.useMemo(() => {
    // 먼저 필터링
    let list = activeTab === 'all' ? contracts : contracts.filter(c => c.status === activeTab);
    
    // 검색 필터
    if (searchTerm.trim()) {
      const s = searchTerm.trim().toLowerCase();
      list = list.filter(
        contract =>
          contract.client.toLowerCase().includes(s) ||
          contract.project.toLowerCase().includes(s)
      );
    }

    // 상태 필터
    if (filterStatus !== 'all') {
      list = list.filter((c) => c.status === filterStatus);
    }

    // 금액 필터
    if (filterAmountMin !== '') {
      const minAmount = parseInt(filterAmountMin.replace(/,/g, ''));
      if (!isNaN(minAmount)) {
        list = list.filter((c) => c.amount >= minAmount);
      }
    }
    if (filterAmountMax !== '') {
      const maxAmount = parseInt(filterAmountMax.replace(/,/g, ''));
      if (!isNaN(maxAmount)) {
        list = list.filter((c) => c.amount <= maxAmount);
      }
    }

    // 날짜 필터
    if (filterDateStart) {
      list = list.filter((c) => new Date(c.createdDate) >= filterDateStart);
    }
    if (filterDateEnd) {
      list = list.filter((c) => new Date(c.createdDate) <= filterDateEnd);
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
            aValue = new Date(a.createdDate);
            bValue = new Date(b.createdDate);
            break;
          case 'status':
            const statusOrder = { pending: 0, sent: 1, signed: 2, completed: 3 };
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
  }, [activeTab, searchTerm, contracts, sortField, sortDirection, filterStatus, filterAmountMin, filterAmountMax, filterDateStart, filterDateEnd]);

  const statusCounts = {
    all: contracts.length,
    draft: contracts.filter(c => c.status === 'draft').length,
    sent: contracts.filter(c => c.status === 'sent').length,
    completed: contracts.filter(c => c.status === 'completed').length
  };

  const sendContractReminder = (contract: Contract) => {
    alert(`${contract.client}님께 계약서 서명 리마인드 알림톡이 발송되었습니다.`);
  };

  const sendToKakao = (contract: Contract) => {
    alert(`${contract.client}님께 카카오톡으로 계약서가 발송되었습니다!`);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-4 md:space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">계약서를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  // Show error state with fallback to mock data
  if (error && contracts.length === 0) {
    return (
      <div className="space-y-4 md:space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-destructive">오류가 발생했습니다: {error}</div>
        </div>
      </div>
    );
  }

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
          {selectedContracts.length > 0 && (
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              className="px-4 py-2"
              disabled={isDeleting}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {isDeleting ? "삭제 중..." : `${selectedContracts.length}개 삭제`}
            </Button>
          )}
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
                      <SelectItem value="completed">계약완료</SelectItem>
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
            onClick={onNewContract}
            className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-primary-foreground"
          >
            <Plus className="w-4 h-4 mr-2" />
            새 계약서
          </Button>
        </div>
      </div>

      {/* 정렬 가능한 테이블 */}
      {sortedAndFilteredContracts.length > 0 && (
        <Card className="bg-card border-border shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-12">
                    <Checkbox
                      checked={selectedContracts.length === sortedAndFilteredContracts.length && sortedAndFilteredContracts.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
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
                    계약서 제목
                  </SortableHeader>
                  <SortableHeader 
                    field="date" 
                    currentSort={sortField} 
                    currentDirection={sortDirection}
                    onSort={handleSort}
                  >
                    계약일자
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
                {sortedAndFilteredContracts.map((contract) => {
                  const statusConfig = getStatusBadge(contract.status);
                  const StatusIcon = statusConfig?.icon || AlertCircle;
                  
                  return (
                    <tr 
                      key={contract.id} 
                      className="hover:bg-muted/30 hover:shadow-sm transition-all duration-200 border-b border-border/50 group"
                    >
                      <td className="px-4 py-3 w-12">
                        <Checkbox
                          checked={selectedContracts.includes(contract.id)}
                          onCheckedChange={(checked) => handleSelectContract(contract.id, checked as boolean)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                      <td className="px-4 py-3 cursor-pointer" onClick={() => onViewContract?.(contract.id)}>
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="font-medium text-foreground text-sm">{contract.client}</p>
                            <p className="text-xs text-muted-foreground">{contract.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 cursor-pointer" onClick={() => onViewContract?.(contract.id)}>
                        <p className="font-medium text-foreground text-sm group-hover:text-primary transition-colors">{contract.project}</p>
                      </td>
                      <td className="px-4 py-3 cursor-pointer" onClick={() => onViewContract?.(contract.id)}>
                        <div className="text-sm">
                          <p className="text-foreground">작성: {contract.createdDate}</p>
                          {contract.signedDate && (
                            <p className="text-xs text-muted-foreground">서명: {contract.signedDate}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 cursor-pointer" onClick={() => onViewContract?.(contract.id)}>
                        <Badge className={statusConfig.className}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 cursor-pointer" onClick={() => onViewContract?.(contract.id)}>
                        <span className="font-mono font-semibold text-foreground text-sm">
                          {formatCurrency(contract.amount)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* 빈 상태 */}
      {sortedAndFilteredContracts.length === 0 && (
        <Card className="p-12 text-center">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">계약서가 없습니다</h3>
          <p className="text-muted-foreground mb-4">승인된 견적서에서 계약서를 작성할 수 있습니다</p>
          <Button variant="outline">
            견적서 관리로 이동
          </Button>
        </Card>
      )}

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <div className="text-center py-6">
            <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10 mb-4">
              <Trash2 className="w-6 h-6 text-destructive" />
            </div>
            <DialogHeader className="space-y-2">
              <DialogTitle className="text-lg font-semibold text-foreground">
                계약서 삭제
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground px-2">
                선택한 <span className="font-medium text-foreground">{selectedContracts.length}개</span>의 계약서를 삭제합니다.
                <br />
                삭제된 데이터는 복구할 수 없습니다.
              </DialogDescription>
            </DialogHeader>
          </div>
          <DialogFooter className="flex-row gap-3 pt-0">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
              className="flex-1"
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="flex-1"
            >
              {isDeleting ? "삭제 중..." : "삭제"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}