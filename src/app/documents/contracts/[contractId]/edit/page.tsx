'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { NewContract } from '@/components/NewContract'

interface ContractData {
  id: number
  client: string
  project: string
  amount: number
  status: 'pending' | 'sent' | 'signed' | 'completed'
  createdDate: string
  signedDate?: string
  contractUrl: string
  phone: string
}

// Mock data for now
const mockContracts: ContractData[] = [
  {
    id: 1,
    client: "스타트업 A",
    project: "웹사이트 리뉴얼 프로젝트",
    amount: 3000000,
    status: "signed",
    createdDate: "2024-01-15",
    signedDate: "2024-01-16",
    contractUrl: "#",
    phone: "010-1234-5678"
  },
  {
    id: 2,
    client: "기업 B",
    project: "모바일 앱 개발",
    amount: 8000000,
    status: "sent",
    createdDate: "2024-01-14",
    contractUrl: "#",
    phone: "010-2345-6789"
  },
  {
    id: 3,
    client: "개인 C",
    project: "브랜딩 디자인 패키지",
    amount: 1500000,
    status: "completed",
    createdDate: "2024-01-13",
    signedDate: "2024-01-14",
    contractUrl: "#",
    phone: "010-3456-7890"
  },
  {
    id: 4,
    client: "소상공인 D",
    project: "온라인 쇼핑몰 구축",
    amount: 2500000,
    status: "pending",
    createdDate: "2024-01-12",
    contractUrl: "#",
    phone: "010-4567-8901"
  }
]

export default function EditContractPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const contractId = parseInt(params.contractId as string)
  
  const [contractData, setContractData] = useState<ContractData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/signin')
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user && contractId) {
      // For now, use mock data
      const contract = mockContracts.find(c => c.id === contractId)
      setContractData(contract || null)
      setLoading(false)
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

  if (!contractData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">계약서를 찾을 수 없습니다</h1>
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
      name: contractData.client,
      email: '', // Mock data doesn't have email
      phone: contractData.phone,
      company: ''
    },
    project: {
      title: contractData.project,
      description: '',
      amount: contractData.amount
    }
  }

  return (
    <NewContract 
      onNavigate={handleNavigate}
      isEdit={true}
      editContractId={contractId.toString()}
      initialData={initialData}
    />
  )
}