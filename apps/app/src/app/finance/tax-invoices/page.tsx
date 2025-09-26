// src/app/finance/tax-invoices/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { FinanceView } from "@/components/FinanceView";

export default function FinanceTaxInvoicesPage() {
  const router = useRouter();
  return (
    <FinanceView
      initialTab="tax-invoices"
      onTabChange={(tab) => {
        if (tab === "payments") router.push("/finance/payments");
      }}
      onNavigate={(view) => {
        const map: Record<string, string> = {
          finance: "/finance/tax-invoices",
          documents: "/quotes",
          dashboard: "/dashboard",
          schedule: "/?v=schedule",
        };
        router.push(map[view] ?? "/finance/tax-invoices");
      }}
    />
  );
}