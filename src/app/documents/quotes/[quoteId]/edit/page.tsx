'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { NewQuote } from '@/components/NewQuote'

interface QuoteData {
  id: string
  user_id: string
  client_name: string
  client_email: string
  client_phone?: string
  client_company?: string
  title: string
  description?: string
  items: Array<{ id: string; name: string; amount: number; }>
  subtotal: number
  tax_rate: number
  tax_amount: number
  total_amount: number
  status: "draft" | "sent" | "approved" | "rejected" | "expired"
  expires_at?: string
  approved_at?: string
  created_at: string
  updated_at: string
}

export default function EditQuotePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const quoteId = params.quoteId as string
  
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/signin')
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user && quoteId) {
      fetchQuoteData()
    }
  }, [user, quoteId])

  const fetchQuoteData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/quotes/${quoteId}`)
      
      if (!response.ok) {
        throw new Error('견적서를 불러올 수 없습니다.')
      }
      
      const data = await response.json()
      setQuoteData(data)
    } catch (err) {
      console.error('Error fetching quote:', err)
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleNavigate = (view: string) => {
    switch (view) {
      case 'quotes':
      case 'documents':
        router.push('/documents/quotes')
        break
      case 'dashboard':
        router.push('/dashboard')
        break
      default:
        break
    }
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">견적서를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">오류 발생</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button 
            onClick={() => router.back()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            돌아가기
          </button>
        </div>
      </div>
    )
  }

  if (!quoteData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">견적서를 찾을 수 없습니다</h1>
          <button 
            onClick={() => router.push('/documents/quotes')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            견적서 목록으로
          </button>
        </div>
      </div>
    )
  }

  // Transform quote data for NewQuote component
  const initialData = {
    client: {
      name: quoteData.client_name,
      email: quoteData.client_email,
      phone: quoteData.client_phone || '',
      company: quoteData.client_company || '',
      businessNumber: (quoteData as any).client_business_number || '',
      address: (quoteData as any).client_address || ''
    },
    project: {
      title: quoteData.title,
      description: quoteData.description || ''
    },
    items: quoteData.items.map(item => ({
      id: item.id,
      description: item.name,
      amount: item.amount
    })),
    taxRate: quoteData.tax_rate,
    expiresAt: quoteData.expires_at || (quoteData as any).valid_until || ''
  }

  return (
    <NewQuote 
      onNavigate={handleNavigate}
      isEdit={true}
      editQuoteId={quoteId}
      initialData={initialData}
    />
  )
}