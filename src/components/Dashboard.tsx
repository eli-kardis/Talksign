import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './ui/ImageWithFallback';
import { FileText, CreditCard, CheckCircle, Clock, TrendingUp, Users, Calendar, CalendarClock, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { ScheduleDetailPopup } from './ScheduleDetailPopup';

interface ScheduleItem {
  id: number;
  title: string;
  date: string;
  time: string;
  type: 'task' | 'meeting' | 'deadline' | 'presentation' | 'launch';
  priority: 'low' | 'medium' | 'high';
  description?: string;
}

interface DashboardStats {
  totalQuotes: number;
  activeContracts: number;
  completedPayments: number;
  monthlyRevenue: number;
}

interface ApiResponse<T> {
  data: T[];
  status?: number;
  error?: string;
}

interface Quote {
  id: string;
  status: string;
  amount?: number;
}

interface Contract {
  id: string;
  status: string;
}

interface Payment {
  id: string;
  amount: number;
  status: string;
  created_at?: string;
}

interface WorkflowStep {
  step: string;
  count: number;
  color: string;
}

interface DashboardProps {
  onNavigate: (view: string) => void;
  schedules: ScheduleItem[];
  schedulesLoading?: boolean;
}

export function Dashboard({ onNavigate, schedules, schedulesLoading = false }: DashboardProps) {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalQuotes: 0,
    activeContracts: 0,
    completedPayments: 0,
    monthlyRevenue: 0
  });
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleItem | null>(null);
  const [isSchedulePopupOpen, setIsSchedulePopupOpen] = useState(false);

  // 실제 데이터 가져오기 + 주기적 업데이트
  useEffect(() => {
    let mounted = true;
    let intervalId: NodeJS.Timeout;
    
    const timeoutId = setTimeout(() => {
      if (mounted) {
        console.warn('Dashboard data loading timeout, setting default values');
        setLoading(false);
      }
    }, 10000); // 10초 타임아웃

    const loadData = async () => {
      try {
        await fetchDashboardData();
      } catch (error) {
        console.error('Dashboard data loading failed:', error);
      } finally {
        clearTimeout(timeoutId);
      }
    };

    // 초기 데이터 로드
    loadData();

    // 5분마다 데이터 새로고침 (더 실시간 업데이트)
    intervalId = setInterval(() => {
      if (mounted) {
        fetchDashboardData().catch(error => {
          console.error('Dashboard periodic update failed:', error);
        });
      }
    }, 5 * 60 * 1000); // 5분

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // 현재 사용자 확인
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      console.log('Dashboard user check:', user?.id);

      if (userError) {
        console.error('User authentication error:', userError);
        setLoading(false);
        return;
      }

      if (!user) {
        console.log('No authenticated user found');
        // 로그인되지 않은 상태라면 기본값으로 표시
        setStats({
          totalQuotes: 0,
          activeContracts: 0,
          completedPayments: 0,
          monthlyRevenue: 0
        });
        setWorkflowSteps([
          { step: "견적서 발송", count: 0, color: "bg-accent text-accent-foreground" },
          { step: "계약 대기", count: 0, color: "bg-accent text-accent-foreground" },
          { step: "서명 대기", count: 0, color: "bg-accent text-accent-foreground" },
          { step: "결제 대기", count: 0, color: "bg-accent text-accent-foreground" },
          { step: "완료", count: 0, color: "bg-accent text-accent-foreground" }
        ]);
        setLoading(false);
        return;
      }

      // 현재 월 시작/끝 날짜
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      // 병렬로 데이터 가져오기 (성능 향상) with timeout
      const dataPromises = [
        supabase.from('quotes').select('*').eq('user_id', user.id),
        supabase.from('contracts').select('*').eq('user_id', user.id),
        supabase.from('payments').select('*').eq('user_id', user.id)
      ];

      // 5초 타임아웃으로 데이터 가져오기
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database query timeout')), 5000)
      );

      const [quotesResult, contractsResult, paymentsResult] = await Promise.allSettled(
        dataPromises.map(promise => Promise.race([promise, timeoutPromise]))
      );

      // 결과 처리
      const quotes = quotesResult.status === 'fulfilled' ? (quotesResult.value as ApiResponse<Quote>)?.data || [] : [];
      const contracts = contractsResult.status === 'fulfilled' ? (contractsResult.value as ApiResponse<Contract>)?.data || [] : [];
      const payments = paymentsResult.status === 'fulfilled' ? (paymentsResult.value as ApiResponse<Payment>)?.data || [] : [];

      // 에러 로깅 (하지만 계속 진행)
      if (quotesResult.status === 'rejected') {
        console.warn('Failed to fetch quotes:', quotesResult.reason);
      }
      if (contractsResult.status === 'rejected') {
        console.warn('Failed to fetch contracts:', contractsResult.reason);
      }
      if (paymentsResult.status === 'rejected') {
        console.warn('Failed to fetch payments:', paymentsResult.reason);
      }

      // 통계 계산
      const totalQuotes = quotes.length;
      const activeContracts = contracts.filter((c: Contract) => c.status === 'sent' || c.status === 'signed').length;
      const completedPayments = payments.filter((p: Payment) => p.status === 'completed').length;
      
      // 이번 달 매출 계산
      const monthlyRevenue = payments
        .filter((p: Payment) => 
          p.created_at &&
          p.status === 'completed' && 
          new Date(p.created_at) >= startOfMonth && 
          new Date(p.created_at) <= endOfMonth
        )
        .reduce((sum: number, p: Payment) => sum + (p.amount || 0), 0);

      setStats({
        totalQuotes,
        activeContracts,
        completedPayments,
        monthlyRevenue
      });

      // 워크플로우 단계별 계산
      const sentQuotes = quotes.filter((q: any) => q.status === 'sent').length;
      const pendingContracts = contracts.filter((c: any) => c.status === 'draft').length;
      const awaitingSignature = contracts.filter((c: any) => c.status === 'sent').length;
      const pendingPayments = payments.filter((p: any) => p.status === 'pending').length;
      const completedTasks = contracts.filter((c: any) => c.status === 'completed').length;

      setWorkflowSteps([
        { step: "견적서 발송", count: sentQuotes, color: "bg-accent text-accent-foreground" },
        { step: "계약 대기", count: pendingContracts, color: "bg-accent text-accent-foreground" },
        { step: "서명 대기", count: awaitingSignature, color: "bg-accent text-accent-foreground" },
        { step: "결제 대기", count: pendingPayments, color: "bg-accent text-accent-foreground" },
        { step: "완료", count: completedTasks, color: "bg-accent text-accent-foreground" }
      ]);

    } catch (error) {
      console.error('대시보드 데이터 로딩 실패:', error);
      
      // 오류 발생시 기본 데이터 설정
      setStats({
        totalQuotes: 0,
        activeContracts: 0,
        completedPayments: 0,
        monthlyRevenue: 0
      });
      setWorkflowSteps([
        { step: "견적서 발송", count: 0, color: "bg-accent text-accent-foreground" },
        { step: "계약 대기", count: 0, color: "bg-accent text-accent-foreground" },
        { step: "서명 대기", count: 0, color: "bg-accent text-accent-foreground" },
        { step: "결제 대기", count: 0, color: "bg-accent text-accent-foreground" },
        { step: "완료", count: 0, color: "bg-accent text-accent-foreground" }
      ]);
    } finally {
      setLoading(false);
    }
  };
  
  const getStatusBadge = (status: string) => {
    const variants = {
      "승인됨": "bg-primary/20 text-primary",
      "대기중": "bg-secondary text-secondary-foreground",
      "계약 진행중": "bg-accent text-accent-foreground"
    };
    return variants[status as keyof typeof variants] || "bg-muted text-muted-foreground";
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount) + '원';
  };

  const getScheduleIcon = (type: string) => {
    switch (type) {
      case 'deadline':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      case 'meeting':
        return <Users className="w-4 h-4 text-primary" />;
      case 'presentation':
        return <FileText className="w-4 h-4 text-accent-foreground" />;
      case 'launch':
        return <TrendingUp className="w-4 h-4 text-primary" />;
      case 'task':
        return <CheckCircle className="w-4 h-4 text-muted-foreground" />;
      default:
        return <Calendar className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-destructive/20 text-destructive';
      case 'medium':
        return 'bg-accent text-accent-foreground';
      case 'low':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return '오늘';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return '내일';
    } else {
      return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
    }
  };

  const handleScheduleClick = (schedule: ScheduleItem) => {
    setSelectedSchedule(schedule);
    setIsSchedulePopupOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-4 md:space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-4 md:p-6 bg-card border-border">
              <div className="flex items-center justify-between">
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-muted rounded animate-pulse"></div>
                  <div className="h-8 bg-muted rounded animate-pulse"></div>
                </div>
                <div className="w-8 h-8 bg-muted rounded animate-pulse"></div>
              </div>
            </Card>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* 워크플로우 스켈레톤 */}
          <Card className="p-4 md:p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="h-5 bg-muted rounded animate-pulse w-32"></div>
              <div className="h-8 bg-muted rounded animate-pulse w-16"></div>
            </div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-muted rounded-full animate-pulse"></div>
                    <div className="h-4 bg-muted rounded animate-pulse w-20"></div>
                  </div>
                  <div className="h-6 bg-muted rounded animate-pulse w-12"></div>
                </div>
              ))}
            </div>
          </Card>

          {/* 일정 스켈레톤 */}
          <Card className="p-4 md:p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-muted rounded animate-pulse"></div>
                <div className="h-5 bg-muted rounded animate-pulse w-24"></div>
              </div>
              <div className="h-8 bg-muted rounded animate-pulse w-16"></div>
            </div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-4 h-4 bg-muted rounded animate-pulse"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded animate-pulse w-24"></div>
                      <div className="h-3 bg-muted rounded animate-pulse w-16"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
        
        <div className="text-center text-muted-foreground flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin"></div>
          데이터를 불러오는 중...
        </div>
      </div>
    );
  }

  return (
    <div className="h-full max-h-[calc(100vh-120px)] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <div className="space-y-4 md:space-y-6 p-1">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card className="p-4 md:p-6 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-muted-foreground">총 견적서</p>
              <p className="text-xl md:text-2xl font-medium text-foreground">{stats.totalQuotes}</p>
            </div>
            <FileText className="w-6 h-6 md:w-8 md:h-8 text-primary" />
          </div>
        </Card>

        <Card className="p-4 md:p-6 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-muted-foreground">진행중 계약</p>
              <p className="text-xl md:text-2xl font-medium text-foreground">{stats.activeContracts}</p>
            </div>
            <Clock className="w-6 h-6 md:w-8 md:h-8 text-secondary-foreground" />
          </div>
        </Card>

        <Card className="p-4 md:p-6 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-muted-foreground">완료된 결제</p>
              <p className="text-xl md:text-2xl font-medium text-foreground">{stats.completedPayments}</p>
            </div>
            <CheckCircle className="w-6 h-6 md:w-8 md:h-8 text-primary" />
          </div>
        </Card>

        <Card className="p-4 md:p-6 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-muted-foreground">이번 달 매출</p>
              <p className="text-lg md:text-2xl font-medium text-foreground break-all">{formatCurrency(stats.monthlyRevenue)}</p>
            </div>
            <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-primary" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Workflow Status */}
        <Card className="p-4 md:p-6 bg-card border-border h-fit max-h-[400px]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-foreground">현재 진행 상황</h3>
            <Button variant="outline" size="sm" className="border-border text-xs md:text-sm hover:bg-accent hover:text-accent-foreground transition-colors" onClick={() => router.push('/documents/quotes')}>전체보기</Button>
          </div>
          
          <div className="space-y-2 max-h-[300px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {workflowSteps.map((item, index) => {
              const totalItems = workflowSteps.reduce((sum, step) => sum + step.count, 0);
              const percentage = totalItems > 0 ? (item.count / totalItems) * 100 : 0;
              
              return (
                <div key={index} className="p-2 md:p-3 bg-secondary rounded-lg border border-border">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="text-sm text-foreground">{item.step}</span>
                    </div>
                    <Badge className={`text-xs ${item.color}`}>
                      {item.count}건
                    </Badge>
                  </div>
                  {totalItems > 0 && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span>진행률</span>
                        <span>{percentage.toFixed(1)}%</span>
                      </div>
                      <Progress value={percentage} className="h-1.5" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Schedule Management */}
        <Card className="p-4 md:p-6 bg-card border-border h-fit max-h-[400px]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CalendarClock className="w-5 h-5 text-primary" />
              <h3 className="font-medium text-foreground">일정 관리</h3>
            </div>
            <Button variant="outline" size="sm" className="border-border text-xs md:text-sm hover:bg-accent hover:text-accent-foreground transition-colors" onClick={() => router.push('/schedule')}>전체보기</Button>
          </div>
          
          <div className="max-h-[300px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {schedulesLoading ? (
              // 로딩 상태
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-2 md:p-3 bg-secondary rounded-lg border border-border">
                    <div className="flex items-start gap-2 md:gap-3 flex-1">
                      <div className="w-4 h-4 bg-muted rounded animate-pulse"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded animate-pulse w-3/4"></div>
                        <div className="h-3 bg-muted rounded animate-pulse w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : schedules.length === 0 ? (
              // 빈 상태
              <div className="text-center py-6 text-muted-foreground">
                <Calendar className="w-6 h-6 mx-auto mb-2 opacity-50" />
                <p className="text-sm">예정된 일정이 없습니다</p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onNavigate('schedule')}
                  className="mt-2 text-primary hover:text-primary/80"
                >
                  일정 추가하기
                </Button>
              </div>
            ) : (
              // 일정 목록
              <div className="space-y-2">
                {schedules.slice(0, 4).map((schedule) => (
                  <div 
                    key={schedule.id} 
                    className="flex items-center justify-between p-2 md:p-3 bg-secondary rounded-lg border border-border cursor-pointer hover:bg-secondary/80 transition-colors"
                    onClick={() => handleScheduleClick(schedule)}
                  >
                    <div className="flex items-start gap-2 md:gap-3 flex-1 min-w-0">
                      {getScheduleIcon(schedule.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm text-foreground truncate font-medium">
                            {schedule.title}
                          </p>
                          <Badge className={`text-xs whitespace-nowrap ${getPriorityBadge(schedule.priority)}`}>
                            {schedule.priority === 'high' ? '긴급' : schedule.priority === 'medium' ? '보통' : '낮음'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{formatDate(schedule.date)}</span>
                          <span>•</span>
                          <span>{schedule.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
        </div>
        
        {/* 일정 상세 팝업 */}
        <ScheduleDetailPopup
          schedule={selectedSchedule}
          isOpen={isSchedulePopupOpen}
          onClose={() => {
            setIsSchedulePopupOpen(false);
            setSelectedSchedule(null);
          }}
        />
      </div>
    </div>
  );
}