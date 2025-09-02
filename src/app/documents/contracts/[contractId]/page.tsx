// src/app/documents/contracts/[contractId]/page.tsx
import { notFound } from "next/navigation";

export default function ContractDetailPage({ params }: { params: { contractId: string } }) {
  const { contractId } = params;
  if (!contractId) return notFound();

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-medium">계약서 상세: {contractId}</h2>
      {/* TODO: Supabase 등으로 contractId 데이터 조회하여 렌더링 */}
    </div>
  );
}