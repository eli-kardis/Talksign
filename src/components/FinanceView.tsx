// src/components/FinanceView.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { PaymentView } from "./PaymentView";
import { TaxInvoiceView } from "./TaxInvoiceView";
import { CreditCard, Receipt } from "lucide-react";

type FinTab = "payments" | "tax-invoices";

interface FinanceViewProps {
  onNavigate: (view: string) => void;
  /** 기본 활성 탭 (경로 분리 시 초기값 지정). 기본값: "payments" */
  initialTab?: FinTab;
  /** 탭 전환시 상위(라우터 등)로 알려주기 위한 콜백 */
  onTabChange?: (tab: FinTab) => void;
}

export function FinanceView({
  onNavigate,
  initialTab = "payments",
  onTabChange,
}: FinanceViewProps) {
  const [activeTab, setActiveTab] = useState<FinTab>(initialTab);

  // 외부에서 initialTab이 바뀔 때 내부 상태 동기화
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const handleTabChange = (value: string) => {
    const next = value as FinTab;
    setActiveTab(next);
    onTabChange?.(next);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Sub Navigation */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-2 bg-transparent gap-2 p-0">
          <TabsTrigger
            value="payments"
            className="flex items-center justify-center gap-2 bg-secondary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:bg-accent rounded-lg border border-border data-[state=active]:border-primary text-xs md:text-sm whitespace-nowrap py-2.5 px-4 transition-all"
          >
            <CreditCard className="w-4 h-4" />
            결제 관리
          </TabsTrigger>

          <TabsTrigger
            value="tax-invoices"
            className="flex items-center justify-center gap-2 bg-secondary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:bg-accent rounded-lg border border-border data-[state=active]:border-primary text-xs md:text-sm whitespace-nowrap py-2.5 px-4 transition-all"
          >
            <Receipt className="w-4 h-4" />
            세금계산서
          </TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="mt-6">
          <PaymentView onNavigate={onNavigate} />
        </TabsContent>

        <TabsContent value="tax-invoices" className="mt-6">
          {/* onBack은 상위에서 라우팅 브릿지로 "/finance/payments" 등으로 매핑하세요 */}
          <TaxInvoiceView onBack={() => onNavigate("payments")} />
        </TabsContent>
      </Tabs>
    </div>
  );
}