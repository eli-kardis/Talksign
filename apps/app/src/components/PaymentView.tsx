import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { CreditCard, Clock, CheckCircle, AlertCircle, Search, Filter, MessageSquare, Eye, Calendar, User, Download, RefreshCw, Plus, Trash2 } from 'lucide-react';
import { Checkbox } from './ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';

interface Payment {
  id: number;
  client: string;
  project: string;
  amount: number;
  status: 'pending' | 'sent' | 'paid' | 'overdue';
  createdDate: string;
  dueDate: string;
  paidDate?: string;
  paymentMethod?: string;
  invoiceUrl?: string;
  phone: string;
  isRecurring?: boolean;
  nextPaymentDate?: string;
}

interface PaymentViewProps {
  onNavigate: (view: string) => void;
}

// TODO: Replace with API call to fetch payments from Supabase
const mockPayments: Payment[] = [];

export function PaymentView({ onNavigate }: PaymentViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedPayments, setSelectedPayments] = useState<number[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Selection handlers
  const handleSelectPayment = (paymentId: number, checked: boolean) => {
    if (checked) {
      setSelectedPayments(prev => [...prev, paymentId]);
    } else {
      setSelectedPayments(prev => prev.filter(id => id !== paymentId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPayments(filteredPayments.map(payment => payment.id));
    } else {
      setSelectedPayments([]);
    }
  };

  // Delete functionality
  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      for (const paymentId of selectedPayments) {
        const response = await fetch(`/api/payments/${paymentId}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error(`Failed to delete payment ${paymentId}`);
        }
      }
      // Mock 데이터이므로 실제로는 삭제되지 않지만 성공 메시지 표시
      console.log(`${selectedPayments.length}개의 결제 요청이 삭제되었습니다.`);
      setSelectedPayments([]);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting payments:', error);
      alert('결제 요청 삭제 중 오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: Payment['status']) => {
    const statusConfig = {
      pending: { label: '결제 준비중', className: 'bg-muted text-muted-foreground', icon: Clock },
      sent: { label: '결제 대기', className: 'bg-accent text-accent-foreground', icon: CreditCard },
      paid: { label: '결제 완료', className: 'bg-primary/20 text-primary', icon: CheckCircle },
      overdue: { label: '연체', className: 'bg-destructive/20 text-destructive', icon: AlertCircle }
    };
    return statusConfig[status];
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount) + '원';
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredPayments = mockPayments.filter(payment => {
    const matchesSearch = payment.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.project.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || payment.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const statusCounts = {
    all: mockPayments.length,
    pending: mockPayments.filter(p => p.status === 'pending').length,
    sent: mockPayments.filter(p => p.status === 'sent').length,
    paid: mockPayments.filter(p => p.status === 'paid').length,
    overdue: mockPayments.filter(p => p.status === 'overdue').length
  };

  const totalAmount = mockPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const paidAmount = mockPayments.filter(p => p.status === 'paid').reduce((sum, payment) => sum + payment.amount, 0);
  const pendingAmount = mockPayments.filter(p => p.status === 'sent' || p.status === 'pending').reduce((sum, payment) => sum + payment.amount, 0);

  const sendPaymentReminder = (payment: Payment) => {
    alert(`${payment.client}님께 결제 리마인드 알림톡이 발송되었습니다.`);
  };

  const sendPaymentLink = (payment: Payment) => {
    alert(`${payment.client}님께 카카오톡으로 결제 링크가 발송되었습니다!`);
  };

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
          {selectedPayments.length > 0 && (
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              className="px-4 py-2"
              disabled={isDeleting}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {isDeleting ? "삭제 중..." : `${selectedPayments.length}개 삭제`}
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
                      <SelectItem value="pending">결제 준비중</SelectItem>
                      <SelectItem value="sent">결제 대기</SelectItem>
                      <SelectItem value="paid">결제 완료</SelectItem>
                      <SelectItem value="overdue">연체</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          <Button
            onClick={() => {/* TODO: 새 결제 생성 로직 */}}
            className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-primary-foreground"
          >
            <Plus className="w-4 h-4 mr-2" />
            새 결제 요청
          </Button>
        </div>
      </div>

      {/* 결제 목록 테이블 */}
      {filteredPayments.length > 0 && (
        <Card className="bg-card border-border shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left p-4 font-medium text-muted-foreground w-12">
                    <Checkbox
                      checked={selectedPayments.length === filteredPayments.length && filteredPayments.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                  <th className="text-left p-4 font-medium text-muted-foreground">고객 정보</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">프로젝트</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">금액</th>
                  <th className="text-center p-4 font-medium text-muted-foreground">상태</th>
                  <th className="text-center p-4 font-medium text-muted-foreground">마감일</th>
                  <th className="text-center p-4 font-medium text-muted-foreground">관리</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => {
                  const statusConfig = getStatusBadge(payment.status);
                  const StatusIcon = statusConfig.icon;
                  const daysUntilDue = getDaysUntilDue(payment.dueDate);
                  
                  return (
                    <tr key={payment.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="p-4 w-12">
                        <Checkbox
                          checked={selectedPayments.includes(payment.id)}
                          onCheckedChange={(checked) => handleSelectPayment(payment.id, checked as boolean)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="font-medium text-foreground">{payment.client}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {payment.phone}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="font-medium text-foreground">{payment.project}</div>
                          {payment.isRecurring && (
                            <Badge className="bg-accent text-accent-foreground text-xs">
                              <RefreshCw className="w-3 h-3 mr-1" />
                              정기결제
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="font-medium text-foreground font-mono">
                          {formatCurrency(payment.amount)}
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
                          <div className="text-sm text-muted-foreground">{payment.dueDate}</div>
                          {payment.status === 'sent' && daysUntilDue >= 0 && (
                            <div className={`text-xs ${daysUntilDue <= 3 ? 'text-destructive' : 'text-muted-foreground'}`}>
                              {daysUntilDue}일 남음
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="outline" size="sm" className="border-border">
                            <Eye className="w-4 h-4" />
                          </Button>
                          
                          {payment.status === 'pending' && (
                            <Button 
                              size="sm" 
                              className="bg-primary hover:bg-primary/90 text-primary-foreground"
                              onClick={() => sendPaymentLink(payment)}
                            >
                              <MessageSquare className="w-4 h-4" />
                            </Button>
                          )}

                          {(payment.status === 'sent' || payment.status === 'overdue') && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => sendPaymentReminder(payment)}
                              className="border-border"
                            >
                              <AlertCircle className="w-4 h-4" />
                            </Button>
                          )}

                          {payment.status === 'paid' && payment.invoiceUrl && (
                            <Button variant="outline" size="sm" className="border-border">
                              <Download className="w-4 h-4" />
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

      {filteredPayments.length === 0 && (
        <Card className="p-12 text-center bg-card border-border">
          <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">결제 정보가 없습니다</h3>
          <p className="text-muted-foreground mb-4">서명된 계약서에서 결제를 요청할 수 있습니다</p>
          <Button variant="outline" className="border-border" onClick={() => onNavigate('documents')}>
            계약서 관리로 이동
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
                결제 요청 삭제
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground px-2">
                선택한 <span className="font-medium text-foreground">{selectedPayments.length}개</span>의 결제 요청을 삭제합니다.
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
