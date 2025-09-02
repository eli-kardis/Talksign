// src/app/documents/contracts/page.tsx
"use client";

import { usePathname, useRouter } from "next/navigation";
import { DocumentsView } from "@/components/DocumentsView";

export default function ContractsPage() {
  const router = useRouter();
  const pathname = usePathname();

  const base = (() => {
    if (!pathname) return "";
    const parts = pathname.split("/").filter(Boolean);
    if (parts[0] === "t" && parts[1]) return `/t/${parts[1]}`;
    return "";
  })();

  return (
    <DocumentsView
      initialTab="contracts"
      onNavigate={(view) => {
        const map: Record<string, string> = {
          documents: `${base}/documents/contracts`,
          "new-quote": `${base}/documents/quotes/new`,
          "new-contract": `${base}/documents/contracts/new`,
          dashboard: `${base}/dashboard`,
          schedule: `${base}/schedule`,
          finance: `${base}/finance`,
        };
        router.push(map[view] ?? `${base}/documents/contracts`);
      }}
    />
  );
}