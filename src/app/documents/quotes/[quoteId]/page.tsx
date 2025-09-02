// src/app/documents/quotes/[quoteId]/page.tsx
import { notFound } from "next/navigation";

export default async function QuoteDetailPage({ params }: { params: Promise<{ quoteId: string }> }) {
  const { quoteId } = await params;
  if (!quoteId) return notFound();

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-medium">견적서 상세: {quoteId}</h2>
      {/* TODO: Supabase 등으로 quoteId 데이터 조회하여 렌더링 */}
    </div>
  );
}