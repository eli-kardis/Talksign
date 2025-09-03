// src/components/DocumentsView.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { QuoteList } from "./QuoteList";
import { ContractView } from "./ContractView";
import { FileText, FileCheck } from "lucide-react";
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
      {/* 상단 서브탭 */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-2 bg-transparent gap-2 p-0">
          {/* 견적서 탭 → /documents/quotes */}
          <TabsTrigger
            asChild
            value="quotes"
            className="flex items-center justify-center gap-2 bg-secondary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:bg-accent rounded-lg border border-border data-[state=active]:border-primary text-xs md:text-sm whitespace-nowrap py-2.5 px-4 transition-all"
          >
            <Link href={`${basePath}/documents/quotes`}>
              <FileText className="w-4 h-4" />
              <span className="ml-1">견적서</span>
            </Link>
          </TabsTrigger>

          {/* 계약서 탭 → /documents/contracts */}
          <TabsTrigger
            asChild
            value="contracts"
            className="flex items-center justify-center gap-2 bg-secondary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:bg-accent rounded-lg border border-border data-[state=active]:border-primary text-xs md:text-sm whitespace-nowrap py-2.5 px-4 transition-all"
          >
            <Link href={`${basePath}/documents/contracts`}>
              <FileCheck className="w-4 h-4" />
              <span className="ml-1">계약서</span>
            </Link>
          </TabsTrigger>
        </TabsList>

        {/* 탭 콘텐츠 (클라이언트 전환 시 깜빡임 방지용) */}
        <TabsContent value="quotes" className="mt-6">
          <QuoteList
            onNewQuote={() => onNavigate("new-quote")}
            onViewQuote={(quoteId) => {
              // Navigate to the quote detail page with the specific quote ID
              window.location.href = `${basePath}/documents/quotes/${quoteId}`;
            }}
          />
        </TabsContent>

        <TabsContent value="contracts" className="mt-6">
          <ContractView onNewContract={() => onNavigate("new-contract")} />
        </TabsContent>
      </Tabs>
    </div>
  );
}