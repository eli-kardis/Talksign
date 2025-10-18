'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { NewContract } from '@/components/NewContract'
import { AuthenticatedApiClient } from '@/lib/api-client'

interface ContractData {
  id: string
  title: string
  status: string
  client_name: string
  client_email: string
  client_phone?: string
  client_company?: string
  client_business_number?: string
  client_address?: string
  supplier?: any
  items: any[]
  subtotal: number
  tax_amount: number
  tax_rate: number
  total_amount: number
  description?: string
  project_start_date?: string
  project_end_date?: string
  terms?: string[]
  created_at: string
  signed_date?: string
  quote_id?: string
}

export default function EditContractPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const contractId = params.contractId as string
  
  const [contractData, setContractData] = useState<ContractData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/signin')
    }
  }, [user, isLoading, router])

  useEffect(() => {
    async function fetchContract() {
      if (!contractId) return;

      try {
        setLoading(true)
        const response = await AuthenticatedApiClient.get(`/api/contracts/${contractId}`)
        
        if (response.status === 404) {
          setError('계약서를 찾을 수 없습니다.')
          return
        }
        
        if (!response.ok) {
          throw new Error('계약서를 불러오는데 실패했습니다.')
        }
        
        const contract = await response.json()
        setContractData(contract)
      } catch (err) {
        console.error('Error fetching contract:', err)
        setError(err instanceof Error ? err.message : '계약서를 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    if (user && contractId) {
      fetchContract()
    }
  }, [user, contractId])

  const handleNavigate = (view: string) => {
    switch (view) {
      case 'contracts':
        router.push('/documents/contracts')
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
          <p className="text-muted-foreground">계약서를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (error || !contractData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            {error || '계약서를 찾을 수 없습니다'}
          </h1>
          <button 
            onClick={() => router.push('/documents/contracts')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            계약서 목록으로
          </button>
        </div>
      </div>
    )
  }

  // Transform contract data for NewContract component
  const initialData = {
    client: {
      name: contractData.client_name,
      email: contractData.client_email,
      phone: contractData.client_phone || '',
      company: contractData.client_company || '',
      businessNumber: contractData.client_business_number || '',
      address: contractData.client_address || ''
    },
    project: {
      title: contractData.title,
      description: contractData.description || '',
      amount: contractData.total_amount,
      startDate: contractData.project_start_date || '',
      endDate: contractData.project_end_date || ''
    },
    items: contractData.items || [],
    terms: contractData.terms || [],
    supplier: contractData.supplier
  }

  return (
    <NewContract 
      onNavigate={handleNavigate}
      isEdit={true}
      editContractId={contractId}
      initialData={initialData}
    />
  )
}