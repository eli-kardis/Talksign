// src/app/documents/quotes/page.tsx
"use client";

import { usePathname, useRouter } from "next/navigation";
import { DocumentsView } from "@/components/DocumentsView";

export default function QuotesPage() {
  const router = useRouter();
  const pathname = usePathname();

  // /t/[tenant] 접두어 자동 보존
  const base = (() => {
    if (!pathname) return "";
    const parts = pathname.split("/").filter(Boolean);
    if (parts[0] === "t" && parts[1]) return `/t/${parts[1]}`;
    return "";
  })();

  return (
    <DocumentsView
      initialTab="quotes"
      onNavigate={(view) => {
        const map: Record<string, string> = {
          documents: `${base}/documents/quotes`,
          "new-quote": `${base}/documents/quotes/new`,
          "new-contract": `${base}/documents/contracts/new`,
          dashboard: `${base}/dashboard`,
          schedule: `${base}/schedule`,
          finance: `${base}/finance`,
        };
        router.push(map[view] ?? `${base}/documents/quotes`);
      }}
    />
  );
}