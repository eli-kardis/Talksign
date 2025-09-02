import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { PenTool, FileText, Clock, CheckCircle, AlertCircle, Search, MessageSquare, Eye, Edit, Calendar, User, Plus } from 'lucide-react';

interface Contract {
  id: number;
  client: string;
  project: string;
  amount: number;
  status: 'pending' | 'sent' | 'signed' | 'completed';
  createdDate: string;
  signedDate?: string;
  contractUrl: string;
  phone: string;
}

const mockContracts: Contract[] = [
  {
    id: 1,
    client: "스타트업 A",
    project: "웹사이트 리뉴얼 프로젝트",
    amount: 3000000,
    status: "signed",
    createdDate: "2024-01-15",
    signedDate: "2024-01-16",
    contractUrl: "#",
    phone: "010-1234-5678"
  },
  {
    id: 2,
    client: "기업 B",
    project: "모바일 앱 개발",
    amount: 8000000,
    status: "sent",
    createdDate: "2024-01-14",
    contractUrl: "#",
    phone: "010-2345-6789"
  },
  {
    id: 3,
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
    id: 4,
    client: "소상공인 D",
    project: "온라인 쇼핑몰 구축",
    amount: 2500000,
    status: "pending",
    createdDate: "2024-01-12",
    contractUrl: "#",
    phone: "010-4567-8901"
  }
];

interface ContractViewProps {
  onNewContract: () => void;
}

export function ContractView({ onNewContract }: ContractViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus] = useState('all');
  const [activeTab, setActiveTab] = useState('all');

  const getStatusBadge = (status: Contract['status']) => {
    const statusConfig = {
      pending: { label: '작성중', className: 'bg-muted text-muted-foreground', icon: Clock },
      sent: { label: '서명대기', className: 'bg-accent text-accent-foreground', icon: PenTool },
      signed: { label: '서명완료', className: 'bg-primary/20 text-primary', icon: CheckCircle },
      completed: { label: '계약완료', className: 'bg-primary text-primary-foreground', icon: CheckCircle }
    };
    return statusConfig[status];
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount) + '원';
  };

  const filteredContracts = mockContracts.filter(contract => {
    const matchesSearch = contract.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.project.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || contract.status === filterStatus;
    const matchesTab = activeTab === 'all' || contract.status === activeTab;
    return matchesSearch && matchesFilter && matchesTab;
  });

  const statusCounts = {
    all: mockContracts.length,
    pending: mockContracts.filter(c => c.status === 'pending').length,
    sent: mockContracts.filter(c => c.status === 'sent').length,
    signed: mockContracts.filter(c => c.status === 'signed').length,
    completed: mockContracts.filter(c => c.status === 'completed').length
  };

  const sendContractReminder = (contract: Contract) => {
    alert(`${contract.client}님께 계약서 서명 리마인드 알림톡이 발송되었습니다.`);
  };

  const sendToKakao = (contract: Contract) => {
    alert(`${contract.client}님께 카카오톡으로 계약서가 발송되었습니다!`);
  };

  return (
    <div className="space-y-4 md:space-y-6">
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
            작성중 ({statusCounts.pending})
          </TabsTrigger>
          <TabsTrigger 
            value="sent" 
            className="flex items-center justify-center gap-2 bg-secondary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:bg-accent rounded-lg border border-border data-[state=active]:border-primary text-xs md:text-sm whitespace-nowrap py-2.5 px-4 transition-all"
          >
            <PenTool className="w-4 h-4" />
            서명대기 ({statusCounts.sent})
          </TabsTrigger>
          <TabsTrigger 
            value="signed" 
            className="flex items-center justify-center gap-2 bg-secondary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:bg-accent rounded-lg border border-border data-[state=active]:border-primary text-xs md:text-sm whitespace-nowrap py-2.5 px-4 transition-all"
          >
            <CheckCircle className="w-4 h-4" />
            서명완료 ({statusCounts.signed})
          </TabsTrigger>
          <TabsTrigger 
            value="completed" 
            className="flex items-center justify-center gap-2 bg-secondary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:bg-accent rounded-lg border border-border data-[state=active]:border-primary text-xs md:text-sm whitespace-nowrap py-2.5 px-4 transition-all"
          >
            완료 ({statusCounts.completed})
          </TabsTrigger>
        </TabsList>

        {/* Filters */}
        <Card className="p-3 md:p-4 bg-card border-border">
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="고객명 또는 프로젝트명으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-input-background border-border text-sm md:text-base"
                />
              </div>
            </div>
            <Button onClick={onNewContract} className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5">
              <Plus className="w-4 h-4 mr-2" />
              새 계약서
            </Button>
          </div>
        </Card>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredContracts.map((contract) => {
            const statusConfig = getStatusBadge(contract.status);
            const StatusIcon = statusConfig.icon;
            
            return (
              <Card key={contract.id} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-primary" />
                      <h3 className="font-medium text-foreground">{contract.client}</h3>
                      <Badge className={statusConfig.className}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusConfig.label}
                      </Badge>
                    </div>
                    
                    <p className="text-muted-foreground">{contract.project}</p>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="font-medium text-lg text-foreground">
                        {formatCurrency(contract.amount)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        작성일: {contract.createdDate}
                      </span>
                      {contract.signedDate && (
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          서명일: {contract.signedDate}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {contract.phone}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      보기
                    </Button>
                    
                    {contract.status === 'pending' && (
                      <>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-1" />
                          수정
                        </Button>
                        <Button 
                          size="sm" 
                          className="bg-primary hover:bg-primary/90 text-primary-foreground"
                          onClick={() => sendToKakao(contract)}
                        >
                          <MessageSquare className="w-4 h-4 mr-1" />
                          카톡발송
                        </Button>
                      </>
                    )}

                    {contract.status === 'sent' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => sendContractReminder(contract)}
                      >
                        <AlertCircle className="w-4 h-4 mr-1" />
                        리마인드
                      </Button>
                    )}

                    {contract.status === 'signed' && (
                      <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
                        결제 요청
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>

      {filteredContracts.length === 0 && (
        <Card className="p-12 text-center">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">계약서가 없습니다</h3>
          <p className="text-muted-foreground mb-4">승인된 견적서에서 계약서를 작성할 수 있습니다</p>
          <Button variant="outline">
            견적서 관리로 이동
          </Button>
        </Card>
      )}
    </div>
  );
}
