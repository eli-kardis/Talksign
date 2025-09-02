import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { CreditCard, Clock, CheckCircle, AlertCircle, Search, Filter, MessageSquare, Eye, Calendar, User, Download, RefreshCw } from 'lucide-react';

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

const mockPayments: Payment[] = [
  {
    id: 1,
    client: "스타트업 A",
    project: "웹사이트 리뉴얼 프로젝트",
    amount: 3000000,
    status: "paid",
    createdDate: "2024-01-15",
    dueDate: "2024-01-25",
    paidDate: "2024-01-20",
    paymentMethod: "카드결제",
    invoiceUrl: "#",
    phone: "010-1234-5678"
  },
  {
    id: 2,
    client: "기업 B",
    project: "모바일 앱 개발",
    amount: 8000000,
    status: "sent",
    createdDate: "2024-01-14",
    dueDate: "2024-01-24",
    phone: "010-2345-6789"
  },
  {
    id: 3,
    client: "개인 C",
    project: "브랜딩 디자인 패키지",
    amount: 1500000,
    status: "overdue",
    createdDate: "2024-01-10",
    dueDate: "2024-01-20",
    phone: "010-3456-7890"
  },
  {
    id: 4,
    client: "소상공인 D",
    project: "온라인 쇼핑몰 구축",
    amount: 2500000,
    status: "pending",
    createdDate: "2024-01-12",
    dueDate: "2024-01-22",
    phone: "010-4567-8901"
  },
  {
    id: 5,
    client: "스타트업 E",
    project: "마케팅 컨설팅 (정기)",
    amount: 500000,
    status: "paid",
    createdDate: "2024-01-01",
    dueDate: "2024-01-31",
    paidDate: "2024-01-05",
    paymentMethod: "계좌이체",
    invoiceUrl: "#",
    phone: "010-5678-9012",
    isRecurring: true,
    nextPaymentDate: "2024-02-28"
  }
];

export function PaymentView({ onNavigate }: PaymentViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeTab, setActiveTab] = useState('all');

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
    const matchesTab = activeTab === 'all' || payment.status === activeTab;
    return matchesSearch && matchesFilter && matchesTab;
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-medium text-foreground">결제 관리</h2>
          <p className="text-muted-foreground">결제 현황을 확인하고 리마인드를 관리하세요</p>
        </div>
      </div>

      {/* Payment Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-muted-foreground">총 결제 금액</h3>
            <CreditCard className="w-5 h-5 text-primary" />
          </div>
          <p className="text-2xl font-medium text-foreground font-mono">{formatCurrency(totalAmount)}</p>
        </Card>

        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-muted-foreground">완료된 결제</h3>
            <CheckCircle className="w-5 h-5 text-primary" />
          </div>
          <p className="text-2xl font-medium text-primary font-mono">{formatCurrency(paidAmount)}</p>
          <Progress value={(paidAmount / totalAmount) * 100} className="mt-2" />
        </Card>

        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-muted-foreground">대기중 결제</h3>
            <Clock className="w-5 h-5 text-secondary-foreground" />
          </div>
          <p className="text-2xl font-medium text-secondary-foreground font-mono">{formatCurrency(pendingAmount)}</p>
        </Card>
      </div>

      {/* Status Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5 bg-transparent gap-2 p-0">
          <TabsTrigger 
            value="all" 
            className="flex items-center justify-center gap-2 bg-secondary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:bg-accent rounded-lg border border-border data-[state=active]:border-primary text-xs md:text-sm whitespace-nowrap py-2.5 px-4 transition-all"
          >
            전체 ({statusCounts.all})
          </TabsTrigger>
          <TabsTrigger 
            value="pending" 
            className="flex items-center justify-center gap-2 bg-secondary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:bg-accent rounded-lg border border-border data-[state=active]:border-primary text-xs md:text-sm whitespace-nowrap py-2.5 px-4 transition-all"
          >
            <Clock className="w-4 h-4" />
            준비중 ({statusCounts.pending})
          </TabsTrigger>
          <TabsTrigger 
            value="sent" 
            className="flex items-center justify-center gap-2 bg-secondary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:bg-accent rounded-lg border border-border data-[state=active]:border-primary text-xs md:text-sm whitespace-nowrap py-2.5 px-4 transition-all"
          >
            <CreditCard className="w-4 h-4" />
            대기중 ({statusCounts.sent})
          </TabsTrigger>
          <TabsTrigger 
            value="paid" 
            className="flex items-center justify-center gap-2 bg-secondary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:bg-accent rounded-lg border border-border data-[state=active]:border-primary text-xs md:text-sm whitespace-nowrap py-2.5 px-4 transition-all"
          >
            <CheckCircle className="w-4 h-4" />
            완료 ({statusCounts.paid})
          </TabsTrigger>
          <TabsTrigger 
            value="overdue" 
            className="flex items-center justify-center gap-2 bg-secondary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:bg-accent rounded-lg border border-border data-[state=active]:border-primary text-xs md:text-sm whitespace-nowrap py-2.5 px-4 transition-all"
          >
            <AlertCircle className="w-4 h-4" />
            연체 ({statusCounts.overdue})
          </TabsTrigger>
        </TabsList>

        {/* Filters */}
        <Card className="p-4 bg-card border-border">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="고객명 또는 프로젝트명으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-input-background border-border"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-48 bg-input-background border-border">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="상태 필터" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 상태</SelectItem>
                <SelectItem value="pending">준비중</SelectItem>
                <SelectItem value="sent">대기중</SelectItem>
                <SelectItem value="paid">완료</SelectItem>
                <SelectItem value="overdue">연체</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredPayments.map((payment) => {
            const statusConfig = getStatusBadge(payment.status);
            const StatusIcon = statusConfig.icon;
            const daysUntilDue = getDaysUntilDue(payment.dueDate);
            
            return (
              <Card key={payment.id} className="p-6 hover:shadow-md transition-shadow bg-card border-border">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-primary" />
                      <h3 className="font-medium text-foreground">{payment.client}</h3>
                      <Badge className={statusConfig.className}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusConfig.label}
                      </Badge>
                      {payment.isRecurring && (
                        <Badge className="bg-accent text-accent-foreground">
                          <RefreshCw className="w-3 h-3 mr-1" />
                          정기결제
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-muted-foreground">{payment.project}</p>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="font-medium text-lg text-foreground font-mono">
                        {formatCurrency(payment.amount)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        마감일: {payment.dueDate}
                      </span>
                      {payment.status === 'sent' && daysUntilDue >= 0 && (
                        <span className={`flex items-center gap-1 ${daysUntilDue <= 3 ? 'text-destructive' : 'text-muted-foreground'}`}>
                          {daysUntilDue}일 남음
                        </span>
                      )}
                      {payment.paidDate && (
                        <span className="flex items-center gap-1 text-primary">
                          <CheckCircle className="w-4 h-4" />
                          결제일: {payment.paidDate}
                        </span>
                      )}
                      {payment.paymentMethod && (
                        <span>결제수단: {payment.paymentMethod}</span>
                      )}
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {payment.phone}
                      </span>
                      {payment.nextPaymentDate && (
                        <span className="text-accent-foreground">
                          다음 결제: {payment.nextPaymentDate}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="border-border">
                      <Eye className="w-4 h-4 mr-1" />
                      상세
                    </Button>
                    
                    {payment.status === 'pending' && (
                      <Button 
                        size="sm" 
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                        onClick={() => sendPaymentLink(payment)}
                      >
                        <MessageSquare className="w-4 h-4 mr-1" />
                        결제링크 발송
                      </Button>
                    )}

                    {(payment.status === 'sent' || payment.status === 'overdue') && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => sendPaymentReminder(payment)}
                        className="border-border"
                      >
                        <AlertCircle className="w-4 h-4 mr-1" />
                        리마인드
                      </Button>
                    )}

                    {payment.status === 'paid' && payment.invoiceUrl && (
                      <Button variant="outline" size="sm" className="border-border">
                        <Download className="w-4 h-4 mr-1" />
                        영수증
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>

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
    </div>
  );
}
