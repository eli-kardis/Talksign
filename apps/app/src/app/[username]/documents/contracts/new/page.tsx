"use client"

import { use, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { NewContract } from "@/components/NewContract"
import { extractUsername, getUserPath } from "@/lib/utils"

interface QuoteData {
  quoteId: string
  title: string
  description?: string
  clientName: string
  clientEmail: string
  clientPhone?: string
  clientCompany?: string
  clientBusinessNumber?: string
  clientAddress?: string
  supplier?: any
  items: Array<{
    id: string
    name: string
    description?: string
    quantity?: number
    unit_price?: number
    amount: number
  }>
  subtotal: number
  tax: number
  total: number
}

export default function UserNewContractPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isLoading } = useAuth()
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null)

  useEffect(() => {
    if (!isLoading && !user) {
      console.log('NewContract: User not authenticated, redirecting to signin')
      window.location.href = '/auth/signin'
    }
  }, [user, isLoading])

  useEffect(() => {
    if (!isLoading && user) {
      const userUsername = extractUsername(user.email)
      if (username !== userUsername) {
        router.replace(getUserPath(userUsername, '/documents/contracts/new'))
      }
    }
  }, [user, isLoading, username, router])

  // 쿼리 파라미터에서 견적서 데이터 읽기
  useEffect(() => {
    const fromQuote = searchParams?.get('from')
    const encodedData = searchParams?.get('data')

    if (fromQuote === 'quote' && encodedData) {
      try {
        const decodedData = JSON.parse(decodeURIComponent(atob(encodedData))) as QuoteData
        setQuoteData(decodedData)
      } catch (error) {
        console.error('Failed to decode quote data:', error)
      }
    }
  }, [searchParams])

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
      amount: quoteData.total,
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
  } : undefined

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <NewContract
      onNavigate={(view) => {
        const userUsername = user?.email ? extractUsername(user.email) : username
        const map: Record<string, string> = {
          documents: getUserPath(userUsername, '/documents/contracts'),
          dashboard: getUserPath(userUsername, '/dashboard'),
          schedule: getUserPath(userUsername, '/schedule'),
          finance: getUserPath(userUsername, '/finance'),
          contracts: getUserPath(userUsername, '/documents/contracts'),
        }
        router.push(map[view] ?? getUserPath(userUsername, '/documents/contracts'))
      }}
      initialData={initialData}
      fromQuote={!!quoteData}
    />
  )
}
