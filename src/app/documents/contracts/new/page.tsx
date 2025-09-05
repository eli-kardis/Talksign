// src/app/documents/contracts/new/page.tsx
"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { NewContract } from "@/components/NewContract";

interface QuoteData {
  quoteId: string;
  title: string;
  description?: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  clientCompany?: string;
  clientBusinessNumber?: string;
  clientAddress?: string;
  supplier?: any;
  items: Array<{
    id: string;
    name: string;
    description?: string;
    quantity?: number;
    unit_price?: number;
    amount: number;
  }>;
  subtotal: number;
  taxAmount: number;
  taxRate: number;
  totalAmount: number;
}

export default function NewContractPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);

  const base = (() => {
    if (!pathname) return "";
    const parts = pathname.split("/").filter(Boolean);
    if (parts[0] === "t" && parts[1]) return `/t/${parts[1]}`;
    return "";
  })();

  // 쿼리 파라미터에서 견적서 데이터 읽기
  useEffect(() => {
    const fromQuote = searchParams?.get('from');
    const encodedData = searchParams?.get('data');
    
    if (fromQuote === 'quote' && encodedData) {
      try {
        const decodedData = JSON.parse(atob(encodedData)) as QuoteData;
        setQuoteData(decodedData);
      } catch (error) {
        console.error('Failed to decode quote data:', error);
      }
    }
  }, [searchParams]);

  // 견적서 데이터를 NewContract 컴포넌트에 맞는 형식으로 변환
  const initialData = quoteData ? {
    client: {
      name: quoteData.clientName,
      email: quoteData.clientEmail,
      phone: quoteData.clientPhone || '',
      company: quoteData.clientCompany || '',
      businessNumber: quoteData.clientBusinessNumber || '',
      address: quoteData.clientAddress || ''
    },
    project: {
      title: `${quoteData.title} - 계약서`,
      description: quoteData.description || '',
      amount: quoteData.totalAmount,
      startDate: '',
      endDate: ''
    },
    items: quoteData.items,
    terms: [
      "프로젝트 수행 기간은 계약서 체결 후 협의하여 결정합니다.",
      "계약금 50% 선입금, 완료 후 50% 잔금 지급",
      "프로젝트 요구사항 변경 시 추가 비용이 발생할 수 있습니다.",
      "저작권은 완전한 대금 지급 후 발주처로 이전됩니다.",
      "계약 위반 시 위약금이 부과될 수 있습니다."
    ],
    supplier: quoteData.supplier,
    quoteId: quoteData.quoteId
  } : undefined;

  return (
    <NewContract
      onNavigate={(view) => {
        const map: Record<string, string> = {
          documents: `${base}/documents/contracts`,
          dashboard: `${base}/dashboard`,
          schedule: `${base}/schedule`,
          finance: `${base}/finance`,
          contracts: `${base}/documents/contracts`,
        };
        router.push(map[view] ?? `${base}/documents/contracts`);
      }}
      initialData={initialData}
      fromQuote={!!quoteData}
    />
  );
}