// src/app/t/[tenant]/layout.tsx
import { TenantProvider } from "@/contexts/TenantContext";

interface TenantLayoutProps {
  children: React.ReactNode;
  params: {
    tenant: string;
  };
}

export default function TenantLayout({ children, params }: TenantLayoutProps) {
  return (
    <TenantProvider tenant={params.tenant}>
      {children}
    </TenantProvider>
  );
}
