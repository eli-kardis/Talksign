// src/app/t/[tenant]/documents/page.tsx
import { redirect } from 'next/navigation';

interface TenantDocumentsPageProps {
  params: Promise<{
    tenant: string;
  }>;
}

export default async function TenantDocumentsPage({ params }: TenantDocumentsPageProps) {
  const { tenant } = await params;
  redirect(`/t/${tenant}/documents/quotes`);
}
