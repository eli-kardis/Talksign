// src/app/t/[tenant]/finance/page.tsx
import { redirect } from 'next/navigation';

interface TenantFinancePageProps {
  params: {
    tenant: string;
  };
}

export default function TenantFinancePage({ params }: TenantFinancePageProps) {
  redirect(`/t/${params.tenant}/finance/payments`);
}
