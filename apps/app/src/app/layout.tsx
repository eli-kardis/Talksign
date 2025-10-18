// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { TenantProvider } from "@/contexts/TenantContext";
import { QueryProvider } from "@/lib/react-query/QueryProvider";
import ClientLayout from "@/components/ClientLayout";
import ErrorBoundary from "@/components/ErrorBoundary";

export const metadata: Metadata = {
  title: "TalkSign - 견적·계약·결제",
  description:
    "견적서 작성부터 전자계약, 결제까지 한 번에 처리하고 카카오톡으로 자동 리마인드까지",
  keywords: ["프리랜서", "견적서", "전자계약", "결제", "카카오톡", "알림톡"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className="
          antialiased 
          bg-background 
          text-foreground
          min-h-screen
          font-sans
          selection:bg-primary/20
          selection:text-foreground
        "
        style={{
          // 방어 로직: CSS 변수가 로드되지 않았을 때 기본 색상
          backgroundColor: 'var(--background, #ffffff)',
          color: 'var(--foreground, #111111)',
        }}
      >
        <ErrorBoundary>
          <QueryProvider>
            <ThemeProvider>
              <AuthProvider>
                <TenantProvider tenant={null}>
                  <ClientLayout>
                    {children}
                  </ClientLayout>
                </TenantProvider>
              </AuthProvider>
            </ThemeProvider>
          </QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}