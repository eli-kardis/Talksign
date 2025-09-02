// src/app/t/[tenant]/finance/page.tsx
import { redirect } from 'next/navigation';

interface TenantFinancePageProps {
  params: Promise<{
    tenant: string;
  }>;
}

export default async function TenantFinancePage({ params }: TenantFinancePageProps) {
  const { tenant } = await params;
  redirect(`/t/${tenant}/finance/payments`);
}
