// src/app/t/[tenant]/documents/page.tsx
import { redirect } from 'next/navigation';

interface TenantDocumentsPageProps {
  params: {
    tenant: string;
  };
}

export default function TenantDocumentsPage({ params }: TenantDocumentsPageProps) {
  redirect(`/t/${params.tenant}/documents/quotes`);
}
