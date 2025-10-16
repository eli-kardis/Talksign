// src/components/NavTabs.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTenant } from "@/contexts/TenantContext";
import { useSidebar } from "@/components/ui/sidebar";
import { useIsMobile } from "@/components/ui/use-mobile";
import React, { useState } from "react";
import { 
  LayoutDashboard, 
  FileText, 
  DollarSign, 
  Calendar,
  ChevronDown,
  ChevronRight,
  FileSignature,
  CreditCard,
  Receipt,
  Users
} from "lucide-react";

interface SubItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  subItems?: SubItem[];
}

export function NavTabs() {
  const pathname = usePathname();
  const { basePath } = useTenant();
  const isMobile = useIsMobile();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // SidebarProvider가 있는 경우에만 useSidebar 사용
  let setOpenMobile: ((open: boolean) => void) | null = null;
  try {
    const sidebarContext = useSidebar();
    setOpenMobile = sidebarContext.setOpenMobile;
  } catch (error) {
    // SidebarProvider가 없는 경우 (데스크톱)
    setOpenMobile = null;
  }

  // 현재 경로에서 username 추출 (예: /dhtj1234/dashboard -> dhtj1234)
  const usernameMatch = pathname?.match(/^\/([^\/]+)\/(dashboard|customers|documents|finance|schedule)/);
  const username = usernameMatch ? usernameMatch[1] : null;

  // username이 있으면 /{username} 형식으로, 없으면 basePath 사용
  const effectiveBasePath = username ? `/${username}` : basePath;

  const items: NavItem[] = [
    {
      href: `${effectiveBasePath}/dashboard`,
      label: "대시보드",
      icon: LayoutDashboard
    },
    {
      href: `${effectiveBasePath}/customers`,
      label: "고객",
      icon: Users
    },
    {
      href: `/documents`,
      label: "문서관리",
      icon: FileText,
      subItems: [
        { href: `/documents/quotes`, label: "견적서", icon: FileText },
        { href: `/documents/contracts`, label: "계약서", icon: FileSignature },
      ]
    },
    {
      href: `/finance`,
      label: "재무관리",
      icon: DollarSign,
      subItems: [
        { href: `/finance/payments`, label: "결제", icon: CreditCard },
        // { href: `/finance/tax-invoices`, label: "세금계산서", icon: Receipt }, // 프로덕션에서 임시 비활성화
      ]
    },
    {
      href: `${effectiveBasePath}/schedule`,
      label: "일정",
      icon: Calendar
    },
  ];

  // 페이지 로드시 자동 확장
  React.useEffect(() => {
    const shouldExpand = items.find(item => 
      item.subItems && pathname?.startsWith(item.href + '/')
    );
    
    if (shouldExpand && !expandedItems.includes(shouldExpand.href)) {
      setExpandedItems([shouldExpand.href]);
    }
  }, [pathname]);

  const toggleExpanded = (href: string) => {
    setExpandedItems(prev => {
      if (prev.includes(href)) {
        // 현재 항목이 확장되어 있으면 축소
        return prev.filter(item => item !== href);
      } else {
        // 현재 항목이 축소되어 있으면 확장하고 다른 모든 항목은 축소
        return [href];
      }
    });
  };

  const handleNavigation = (href: string) => {
    // 모바일에서 네비게이션 클릭시 사이드바 자동 닫기
    if (isMobile && setOpenMobile) {
      setOpenMobile(false);
    }
    window.location.href = href;
  };

  return (
    <nav className="space-y-1">
      {items.map((item) => {
        const isMainActive = pathname === item.href;
        const isChildActive = pathname?.startsWith(item.href + '/');
        const isExpanded = expandedItems.includes(item.href);
        const Icon = item.icon;
        
        return (
          <div key={item.href}>
            {/* 메인 네비게이션 아이템 */}
            <div
              className={cn(
                "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors cursor-pointer",
                "hover:bg-sidebar-accent/30 hover:text-sidebar-accent-foreground",
                isMainActive || (isChildActive && !item.subItems)
                  ? "bg-sidebar-accent text-sidebar-accent-foreground border border-sidebar-border"
                  : isChildActive
                  ? "bg-sidebar-accent/50 text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:text-sidebar-accent-foreground"
              )}
              onClick={() => {
                if (item.subItems) {
                  toggleExpanded(item.href);
                } else {
                  handleNavigation(item.href);
                }
              }}
            >
              <Icon className="w-5 h-5" />
              <span className="flex-1">{item.label}</span>
              {item.subItems && (
                <div className="ml-auto">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </div>
              )}
            </div>

            {/* 서브 네비게이션 아이템들 */}
            {item.subItems && isExpanded && (
              <div className="ml-6 mt-1 space-y-1">
                {item.subItems.map((subItem) => {
                  const isSubActive = pathname === subItem.href || pathname?.startsWith(subItem.href + '/');
                  const SubIcon = subItem.icon;
                  
                  return (
                    <Link
                      key={subItem.href}
                      href={subItem.href}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                        "hover:bg-sidebar-accent/30 hover:text-sidebar-accent-foreground",
                        isSubActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground border border-sidebar-border"
                          : "text-sidebar-foreground hover:text-sidebar-accent-foreground"
                      )}
                      onClick={() => {
                        // 모바일에서 서브 네비게이션 클릭시 사이드바 자동 닫기
                        if (isMobile && setOpenMobile) {
                          setOpenMobile(false);
                        }
                      }}
                    >
                      <SubIcon className="w-4 h-4" />
                      {subItem.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}