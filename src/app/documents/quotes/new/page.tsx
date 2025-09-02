// src/app/documents/quotes/new/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { NewQuote } from "@/components/NewQuote";
import { useTenant } from "@/contexts/TenantContext";

export default function NewQuotePage() {
  const router = useRouter();
  const { basePath } = useTenant();

  return (
    <NewQuote
      onNavigate={(view) => {
        const map: Record<string, string> = {
          documents: `${basePath}/documents/quotes`,
          dashboard: `${basePath}/dashboard`,
          schedule: `${basePath}/schedule`,
          finance: `${basePath}/finance/payments`,
        };
        router.push(map[view] ?? `${basePath}/documents/quotes`);
      }}
    />
  );
}