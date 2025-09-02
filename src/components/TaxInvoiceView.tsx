import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Receipt, Search, Filter, Download, Eye, Calendar, User, Building, CheckCircle, Clock, AlertCircle, ArrowLeft, Send } from 'lucide-react';

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

interface TaxInvoiceViewProps {
  onBack: () => void;
}

export function TaxInvoiceView({ onBack }: TaxInvoiceViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeTab, setActiveTab] = useState('all');

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
    const matchesTab = activeTab === 'all' || invoice.status === activeTab;
    return matchesSearch && matchesFilter && matchesTab;
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack} className="border-border">
            <ArrowLeft className="w-4 h-4 mr-2" />
            돌아가기
          </Button>
          <div>
            <h2 className="text-2xl font-medium text-foreground">세금계산서 관리</h2>
            <p className="text-muted-foreground">결제 완료 후 자동 발행되는 세금계산서를 관리하세요</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-muted-foreground">총 발행 금액</h3>
            <Receipt className="w-5 h-5 text-primary" />
          </div>
          <p className="text-2xl font-medium text-foreground font-mono">{formatCurrency(totalAmount)}</p>
        </Card>

        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-muted-foreground">승인 완료</h3>
            <CheckCircle className="w-5 h-5 text-primary" />
          </div>
          <p className="text-2xl font-medium text-primary font-mono">{formatCurrency(confirmedAmount)}</p>
        </Card>

        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-muted-foreground">발행 건수</h3>
            <Building className="w-5 h-5 text-primary" />
          </div>
          <p className="text-2xl font-medium text-foreground">{mockTaxInvoices.length}건</p>
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
            value="draft"
            className="flex items-center justify-center gap-2 bg-secondary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:bg-accent rounded-lg border border-border data-[state=active]:border-primary text-xs md:text-sm whitespace-nowrap py-2.5 px-4 transition-all"
          >
            <Clock className="w-4 h-4" />
            임시저장 ({statusCounts.draft})
          </TabsTrigger>
          <TabsTrigger 
            value="issued"
            className="flex items-center justify-center gap-2 bg-secondary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:bg-accent rounded-lg border border-border data-[state=active]:border-primary text-xs md:text-sm whitespace-nowrap py-2.5 px-4 transition-all"
          >
            <Receipt className="w-4 h-4" />
            발행완료 ({statusCounts.issued})
          </TabsTrigger>
          <TabsTrigger 
            value="sent"
            className="flex items-center justify-center gap-2 bg-secondary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:bg-accent rounded-lg border border-border data-[state=active]:border-primary text-xs md:text-sm whitespace-nowrap py-2.5 px-4 transition-all"
          >
            <Send className="w-4 h-4" />
            전송완료 ({statusCounts.sent})
          </TabsTrigger>
          <TabsTrigger 
            value="confirmed"
            className="flex items-center justify-center gap-2 bg-secondary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:bg-accent rounded-lg border border-border data-[state=active]:border-primary text-xs md:text-sm whitespace-nowrap py-2.5 px-4 transition-all"
          >
            <CheckCircle className="w-4 h-4" />
            승인완료 ({statusCounts.confirmed})
          </TabsTrigger>
        </TabsList>

        {/* Filters */}
        <Card className="p-4 bg-card border-border">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="고객명, 프로젝트명 또는 계산서 번호로 검색..."
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
                <SelectItem value="draft">임시저장</SelectItem>
                <SelectItem value="issued">발행완료</SelectItem>
                <SelectItem value="sent">전송완료</SelectItem>
                <SelectItem value="confirmed">승인완료</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredInvoices.map((invoice) => {
            const statusConfig = getStatusBadge(invoice.status);
            const StatusIcon = statusConfig.icon;
            
            return (
              <Card key={invoice.id} className="p-6 hover:shadow-md transition-shadow bg-card border-border">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <Receipt className="w-5 h-5 text-primary" />
                      <h3 className="font-medium text-foreground">{invoice.client}</h3>
                      <Badge className={statusConfig.className}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusConfig.label}
                      </Badge>
                    </div>
                    
                    <p className="text-muted-foreground">{invoice.project}</p>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="font-medium text-lg text-foreground font-mono">
                        {formatCurrency(invoice.totalAmount)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Receipt className="w-4 h-4" />
                        {invoice.invoiceNumber}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        발행일: {invoice.issueDate}
                      </span>
                      {invoice.confirmedDate && (
                        <span className="flex items-center gap-1 text-primary">
                          <CheckCircle className="w-4 h-4" />
                          승인일: {invoice.confirmedDate}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="border-border">
                      <Eye className="w-4 h-4 mr-1" />
                      상세
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDownload(invoice)}
                      className="border-border"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      다운로드
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
                        <Send className="w-4 h-4 mr-1" />
                        발송
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>

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

      {/* Auto Issue Info */}
      <Card className="p-6 bg-accent">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-accent-foreground mt-0.5" />
          <div>
            <h3 className="font-medium text-accent-foreground mb-2">자동 발행 안내</h3>
            <ul className="text-sm text-accent-foreground space-y-1">
              <li>• 결제 완료 시 세금계산서가 자동으로 발행됩니다</li>
              <li>• 발행된 세금계산서는 고객과 프리랜서 모두에게 카카오톡으로 발송됩니다</li>
              <li>• 국세청 홈택스와 연동하여 전자세금계산서로 처리됩니다</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
