// src/components/DocumentsView.tsx
"use client";

import React, { useEffect, useState } from "react";
import { QuoteList } from "./QuoteList";
import { ContractView } from "./ContractView";
import { useTenant } from "@/contexts/TenantContext";

type DocTab = "quotes" | "contracts";

interface DocumentsViewProps {
  onNavigate: (view: string) => void;
  /** 기본 활성 탭 – 기본값: "quotes" */
  initialTab?: DocTab;
  /** 탭 전환을 상위에 알려줄 때 사용(선택) */
  onTabChange?: (tab: DocTab) => void;
}

export function DocumentsView({
  onNavigate,
  initialTab = "quotes",
  onTabChange,
}: DocumentsViewProps) {
  const { basePath } = useTenant();

  const [activeTab, setActiveTab] = useState<DocTab>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const handleTabChange = (value: string) => {
    const next = value as DocTab;
    setActiveTab(next);
    onTabChange?.(next);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* 탭에 따른 콘텐츠 렌더링 */}
      {activeTab === "quotes" && (
        <QuoteList
          onNewQuote={() => onNavigate("new-quote")}
          onViewQuote={(quoteId) => {
            // Navigate to the quote detail page with the specific quote ID
            window.location.href = `${basePath}/documents/quotes/${quoteId}`;
          }}
          onEditQuote={(quoteId) => {
            // Navigate to the quote edit page
            window.location.href = `${basePath}/documents/quotes/${quoteId}/edit`;
          }}
        />
      )}

      {activeTab === "contracts" && (
        <ContractView 
          onNewContract={() => onNavigate("new-contract")}
          onEditContract={(contractId) => {
            // Navigate to the contract edit page
            window.location.href = `${basePath}/documents/contracts/${contractId}/edit`;
          }}
          onViewContract={(contractId) => {
            // Navigate to the contract detail page
            window.location.href = `${basePath}/documents/contracts/${contractId}`;
          }}
        />
      )}
    </div>
  );
}