// src/app/documents/contracts/new/page.tsx
"use client";

import { usePathname, useRouter } from "next/navigation";
import { NewContract } from "@/components/NewContract";

export default function NewContractPage() {
  const router = useRouter();
  const pathname = usePathname();

  const base = (() => {
    if (!pathname) return "";
    const parts = pathname.split("/").filter(Boolean);
    if (parts[0] === "t" && parts[1]) return `/t/${parts[1]}`;
    return "";
  })();

  return (
    <NewContract
      onNavigate={(view) => {
        const map: Record<string, string> = {
          documents: `${base}/documents/contracts`,
          dashboard: `${base}/dashboard`,
          schedule: `${base}/schedule`,
          finance: `${base}/finance`,
        };
        router.push(map[view] ?? `${base}/documents/contracts`);
      }}
    />
  );
}