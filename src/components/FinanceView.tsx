// src/components/FinanceView.tsx
"use client";

import React, { useEffect, useState } from "react";
import { PaymentView } from "./PaymentView";
import { TaxInvoiceView } from "./TaxInvoiceView";

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
      {/* 탭에 따른 콘텐츠 렌더링 */}
      {activeTab === "payments" && (
        <PaymentView onNavigate={onNavigate} />
      )}

      {activeTab === "tax-invoices" && (
        <TaxInvoiceView />
      )}
    </div>
  );
}