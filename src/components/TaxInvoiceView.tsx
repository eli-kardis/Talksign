import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Receipt, Search, Filter, Download, Eye, Calendar, User, Building, CheckCircle, Clock, AlertCircle, Send, Plus, Trash2 } from 'lucide-react';
import { Checkbox } from './ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';

interface TaxInvoice {
  id: number;
  invoiceNumber: string;
  client: string;
  project: string;
  amount: number;
  vatAmount: number;
  totalAmount: number;
  status: 'draft' | 'issued' | 'sent' | 'confirmed';
  issueDate: string;
  dueDate?: string;
  confirmedDate?: string;
  businessNumber: string;
  phone: string;
  paymentId?: number;
}

const mockTaxInvoices: TaxInvoice[] = [
  {
    id: 1,
    invoiceNumber: 'TAX-2024-001',
    client: '스타트업 A',
    project: '웹사이트 리뉴얼 프로젝트',
    amount: 3000000,
    vatAmount: 300000,
    totalAmount: 3300000,
    status: 'confirmed',
    issueDate: '2024-01-20',
    confirmedDate: '2024-01-21',
    businessNumber: '123-45-67890',
    phone: '010-1234-5678',
    paymentId: 1
  },
  {
    id: 2,
    invoiceNumber: 'TAX-2024-002',
    client: '기업 B',
    project: '모바일 앱 개발',
    amount: 8000000,
    vatAmount: 800000,
    totalAmount: 8800000,
    status: 'sent',
    issueDate: '2024-01-22',
    dueDate: '2024-02-22',
    businessNumber: '234-56-78901',
    phone: '010-2345-6789',
    paymentId: 2
  }
];

interface TaxInvoiceViewProps {}

export function TaxInvoiceView({}: TaxInvoiceViewProps = {}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedInvoices, setSelectedInvoices] = useState<number[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Selection handlers
  const handleSelectInvoice = (invoiceId: number, checked: boolean) => {
    if (checked) {
      setSelectedInvoices(prev => [...prev, invoiceId]);
    } else {
      setSelectedInvoices(prev => prev.filter(id => id !== invoiceId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedInvoices(filteredInvoices.map(invoice => invoice.id));
    } else {
      setSelectedInvoices([]);
    }
  };

  // Delete functionality
  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      for (const invoiceId of selectedInvoices) {
        const response = await fetch(`/api/tax-invoices/${invoiceId}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error(`Failed to delete tax invoice ${invoiceId}`);
        }
      }
      // Mock 데이터이므로 실제로는 삭제되지 않지만 성공 메시지 표시
      console.log(`${selectedInvoices.length}개의 세금계산서가 삭제되었습니다.`);
      setSelectedInvoices([]);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting tax invoices:', error);
      alert('세금계산서 삭제 중 오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: TaxInvoice['status']) => {
    const statusConfig = {
      draft: { label: '임시저장', className: 'bg-muted text-muted-foreground', icon: Clock },
      issued: { label: '발행완료', className: 'bg-accent text-accent-foreground', icon: Receipt },
      sent: { label: '전송완료', className: 'bg-primary/10 text-primary', icon: Send },
      confirmed: { label: '승인완료', className: 'bg-primary/20 text-primary', icon: CheckCircle }
    };
    return statusConfig[status];
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount) + '원';
  };

  const filteredInvoices = mockTaxInvoices.filter(invoice => {
    const matchesSearch = invoice.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || invoice.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const statusCounts = {
    all: mockTaxInvoices.length,
    draft: mockTaxInvoices.filter(i => i.status === 'draft').length,
    issued: mockTaxInvoices.filter(i => i.status === 'issued').length,
    sent: mockTaxInvoices.filter(i => i.status === 'sent').length,
    confirmed: mockTaxInvoices.filter(i => i.status === 'confirmed').length
  };

  const totalAmount = mockTaxInvoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
  const confirmedAmount = mockTaxInvoices.filter(i => i.status === 'confirmed').reduce((sum, invoice) => sum + invoice.totalAmount, 0);

  const handleAutoIssue = (invoice: TaxInvoice) => {
    alert(`${invoice.client}님의 세금계산서가 자동 발행되었습니다.`);
  };

  const handleSendInvoice = (invoice: TaxInvoice) => {
    alert(`${invoice.client}님께 세금계산서가 카카오톡으로 발송되었습니다.`);
  };

  const handleDownload = (invoice: TaxInvoice) => {
    alert(`세금계산서 ${invoice.invoiceNumber}을 다운로드합니다.`);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* 상단 검색 및 버튼 */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="고객명, 프로젝트명 또는 계산서 번호로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-input-background border-border text-sm md:text-base"
          />
        </div>
        
        <div className="flex items-center gap-2 md:gap-3">
          {selectedInvoices.length > 0 && (
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              className="px-4 py-2"
              disabled={isDeleting}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {isDeleting ? "삭제 중..." : `${selectedInvoices.length}개 삭제`}
            </Button>
          )}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="px-4 py-2">
                <Filter className="w-4 h-4 mr-2" />
                필터
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-card border-border" align="end">
              <div className="space-y-4 p-2">
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
                      <SelectItem value="issued">발행완료</SelectItem>
                      <SelectItem value="sent">전송완료</SelectItem>
                      <SelectItem value="confirmed">승인완료</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          <Button
            onClick={() => {/* TODO: 새 세금계산서 생성 로직 */}}
            className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-primary-foreground"
          >
            <Plus className="w-4 h-4 mr-2" />
            새 세금계산서
          </Button>
        </div>
      </div>

      {/* 세금계산서 목록 테이블 */}
      {filteredInvoices.length > 0 && (
        <Card className="bg-card border-border shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left p-4 font-medium text-muted-foreground w-12">
                    <Checkbox
                      checked={selectedInvoices.length === filteredInvoices.length && filteredInvoices.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                  <th className="text-left p-4 font-medium text-muted-foreground">고객 정보</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">계산서 번호</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">프로젝트</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">금액</th>
                  <th className="text-center p-4 font-medium text-muted-foreground">상태</th>
                  <th className="text-center p-4 font-medium text-muted-foreground">발행일</th>
                  <th className="text-center p-4 font-medium text-muted-foreground">관리</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => {
                  const statusConfig = getStatusBadge(invoice.status);
                  const StatusIcon = statusConfig.icon;
                  
                  return (
                    <tr key={invoice.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="p-4 w-12">
                        <Checkbox
                          checked={selectedInvoices.includes(invoice.id)}
                          onCheckedChange={(checked) => handleSelectInvoice(invoice.id, checked as boolean)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="font-medium text-foreground">{invoice.client}</div>
                          <div className="text-sm text-muted-foreground">
                            사업자번호: {invoice.businessNumber}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-foreground">{invoice.invoiceNumber}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-foreground">{invoice.project}</div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="space-y-1">
                          <div className="font-medium text-foreground font-mono">
                            {formatCurrency(invoice.totalAmount)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            (VAT: {formatCurrency(invoice.vatAmount)})
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <Badge className={statusConfig.className}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig.label}
                        </Badge>
                      </td>
                      <td className="p-4 text-center">
                        <div className="space-y-1">
                          <div className="text-sm text-muted-foreground">{invoice.issueDate}</div>
                          {invoice.confirmedDate && (
                            <div className="text-xs text-primary">
                              승인: {invoice.confirmedDate}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="outline" size="sm" className="border-border">
                            <Eye className="w-4 h-4" />
                          </Button>
                          
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDownload(invoice)}
                            className="border-border"
                          >
                            <Download className="w-4 h-4" />
                          </Button>

                          {invoice.status === 'draft' && (
                            <Button 
                              size="sm" 
                              onClick={() => handleAutoIssue(invoice)}
                              className="bg-primary hover:bg-primary/90 text-primary-foreground"
                            >
                              자동 발행
                            </Button>
                          )}

                          {invoice.status === 'issued' && (
                            <Button 
                              size="sm"
                              onClick={() => handleSendInvoice(invoice)}
                              className="bg-primary hover:bg-primary/90 text-primary-foreground"
                            >
                              <Send className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {filteredInvoices.length === 0 && (
        <Card className="p-12 text-center bg-card border-border">
          <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">세금계산서가 없습니다</h3>
          <p className="text-muted-foreground mb-4">결제가 완료되면 자동으로 세금계산서가 발행됩니다</p>
          <Button variant="outline" className="border-border">
            결제 관리로 이동
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
                세금계산서 삭제
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground px-2">
                선택한 <span className="font-medium text-foreground">{selectedInvoices.length}개</span>의 세금계산서를 삭제합니다.
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
