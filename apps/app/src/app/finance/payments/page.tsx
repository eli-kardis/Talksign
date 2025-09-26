// src/app/finance/payments/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { FinanceView } from "@/components/FinanceView";

export default function FinancePaymentsPage() {
  const router = useRouter();
  return (
    <FinanceView
      initialTab="payments"
      onTabChange={(tab) => {
        if (tab === "tax-invoices") router.push("/finance/tax-invoices");
      }}
      onNavigate={(view) => {
        const map: Record<string, string> = {
          finance: "/finance/payments",
          documents: "/quotes",
          dashboard: "/dashboard",
          schedule: "/?v=schedule",
        };
        router.push(map[view] ?? "/finance/payments");
      }}
    />
  );
}