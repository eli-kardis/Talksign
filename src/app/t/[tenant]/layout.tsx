// src/app/t/[tenant]/layout.tsx
import { TenantProvider } from "@/contexts/TenantContext";

interface TenantLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    tenant: string;
  }>;
}

export default async function TenantLayout({ children, params }: TenantLayoutProps) {
  const { tenant } = await params;
  return (
    <TenantProvider tenant={tenant}>
      {children}
    </TenantProvider>
  );
}
