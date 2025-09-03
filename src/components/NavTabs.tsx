// src/components/NavTabs.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTenant } from "@/contexts/TenantContext";

export function NavTabs() {
  const pathname = usePathname();
  const { basePath } = useTenant();

  const items = [
    { href: `${basePath}/dashboard`, label: "대시보드" },
    { href: `${basePath}/documents`, label: "문서관리" },
    { href: `${basePath}/finance`, label: "재무관리" },
    { href: `${basePath}/schedule`, label: "일정" },
  ];

  // 현재 탭 활성화 - startsWith로 판정 (더 정확한 매칭을 위해 길이순 정렬)
  const getCurrentTab = () => {
    if (!pathname) return `${basePath}/dashboard`;
    
    // 특별 케이스: documents 관련 경로들은 모두 documents 탭으로 매핑
    if (pathname.startsWith(`${basePath}/documents`)) {
      return `${basePath}/documents`;
    }
    
    // finance 관련 경로들은 모두 finance 탭으로 매핑
    if (pathname.startsWith(`${basePath}/finance`)) {
      return `${basePath}/finance`;
    }
    
    // 가장 구체적인 경로부터 매칭 (길이순 정렬)
    const sortedItems = [...items].sort((a, b) => b.href.length - a.href.length);
    const matched = sortedItems.find((i) => pathname.startsWith(i.href));
    
    return matched?.href ?? `${basePath}/dashboard`;
  };

  const value = getCurrentTab();

  return (
    <Tabs value={value}>
      <TabsList className="grid w-full grid-cols-4 gap-2 p-0 bg-transparent">
        {items.map((i) => (
          <TabsTrigger
            key={i.href}
            asChild
            value={i.href}
            // 기본 스타일은 ui/tabs.tsx에서 처리, 여기서는 최소한만 오버라이드
          >
            <Link href={i.href}>{i.label}</Link>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}