'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { NewQuote } from '@/components/NewQuote'
import { AuthenticatedApiClient } from '@/lib/api-client'

interface QuoteItem {
  name: string
  description?: string
  quantity: number
  unit_price: number
  amount: number
}

interface QuoteData {
  id: string
  user_id: string
  client_name: string
  client_email: string
  client_phone?: string
  client_company?: string
  client_business_number?: string
  title: string
  items: QuoteItem[]
  subtotal: number
  tax: number
  total: number
  status: "draft" | "sent" | "approved" | "rejected" | "expired"
  expiry_date?: string
  notes?: string
  created_at: string
  updated_at: string
  supplier_info?: any
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
      const response = await AuthenticatedApiClient.get(`/api/quotes/${quoteId}`)

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
      businessNumber: quoteData.client_business_number || ''
    },
    project: {
      title: quoteData.title,
      notes: quoteData.notes || ''
    },
    items: quoteData.items.map((item, index) => {
      // Backward compatibility: handle legacy data where name doesn't exist
      let itemName = item.name;
      let itemDesc = item.description;

      if (!itemName && itemDesc) {
        if (itemDesc.includes(' - ')) {
          // Split if " - " separator exists
          const [name, ...descParts] = itemDesc.split(' - ');
          itemName = name;
          itemDesc = descParts.join(' - ');
        } else {
          // Use description as name if no separator
          itemName = itemDesc;
          itemDesc = '';
        }
      }

      return {
        id: `${index + 1}`,
        name: itemName || '',
        description: itemDesc || '',
        quantity: item.quantity || 1,
        unitPrice: item.unit_price || 0,
        amount: item.amount || 0
      };
    }),
    expiryDate: quoteData.expiry_date || '',
    supplier: quoteData.supplier_info || null
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