'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, FileText, Building, User, Mail, Phone, Calendar } from 'lucide-react'

interface QuoteData {
  id: string
  title: string
  description: string | null
  client_name: string
  client_email: string
  client_phone: string
  client_company: string | null
  supplier_name: string
  supplier_email: string
  supplier_phone: string
  supplier_company: string
  items: Array<{
    id: string
    name: string
    description: string
    quantity: number
    unit_price: number
    amount: number
  }>
  total_amount: number
  status: string
  created_at: string
  valid_until: string | null
}

export default function PublicQuotePage() {
  const params = useParams()
  const token = params.token as string

  const [quote, setQuote] = useState<QuoteData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchQuote()
  }, [token])

  const fetchQuote = async () => {
    try {
      const response = await fetch(`/api/public/quotes/${token}`)

      if (!response.ok) {
        if (response.status === 404) {
          setError('견적서를 찾을 수 없거나 만료되었습니다.')
        } else {
          setError('견적서를 불러오는데 실패했습니다.')
        }
        setLoading(false)
        return
      }

      const data = await response.json()
      setQuote(data)
    } catch (err) {
      setError('견적서를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!quote) return

    if (!confirm('이 견적서를 승인하시겠습니까?')) return

    setProcessing(true)
    try {
      const response = await fetch(`/api/public/quotes/${token}/approve`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('승인 처리에 실패했습니다.')
      }

      alert('견적서가 승인되었습니다!')
      fetchQuote() // 상태 업데이트
    } catch (err) {
      alert(err instanceof Error ? err.message : '승인 처리에 실패했습니다.')
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!quote) return

    if (!confirm('이 견적서를 거절하시겠습니까?')) return

    setProcessing(true)
    try {
      const response = await fetch(`/api/public/quotes/${token}/reject`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('거절 처리에 실패했습니다.')
      }

      alert('견적서가 거절되었습니다.')
      fetchQuote() // 상태 업데이트
    } catch (err) {
      alert(err instanceof Error ? err.message : '거절 처리에 실패했습니다.')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">견적서를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (error || !quote) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full p-8 text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">오류</h1>
          <p className="text-gray-600">{error || '견적서를 찾을 수 없습니다.'}</p>
        </Card>
      </div>
    )
  }

  const isAlreadyResponded = quote.status === 'accepted' || quote.status === 'rejected'

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{quote.title}</h1>
              <p className="text-sm text-gray-500">견적서</p>
            </div>
          </div>

          {quote.status === 'accepted' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-green-800 font-medium">이미 승인된 견적서입니다</span>
            </div>
          )}

          {quote.status === 'rejected' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <span className="text-red-800 font-medium">거절된 견적서입니다</span>
            </div>
          )}
        </div>

        {/* 공급자 정보 */}
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Building className="h-5 w-5" />
            공급자 정보
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-500">회사명</label>
              <p className="font-medium">{quote.supplier_company}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">담당자</label>
              <p className="font-medium">{quote.supplier_name}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">이메일</label>
              <p className="font-medium">{quote.supplier_email}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">연락처</label>
              <p className="font-medium">{quote.supplier_phone}</p>
            </div>
          </div>
        </Card>

        {/* 수신자 정보 */}
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <User className="h-5 w-5" />
            수신자 정보
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-500">회사명</label>
              <p className="font-medium">{quote.client_company || '-'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">담당자</label>
              <p className="font-medium">{quote.client_name}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">이메일</label>
              <p className="font-medium">{quote.client_email}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">연락처</label>
              <p className="font-medium">{quote.client_phone}</p>
            </div>
          </div>
        </Card>

        {/* 견적 항목 */}
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">견적 항목</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">항목</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">설명</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">수량</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">단가</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">금액</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {quote.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 text-sm">{item.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.description}</td>
                    <td className="px-4 py-3 text-sm text-right">{item.quantity.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-right">{item.unit_price.toLocaleString()}원</td>
                    <td className="px-4 py-3 text-sm text-right font-medium">{item.amount.toLocaleString()}원</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={4} className="px-4 py-3 text-right font-semibold">총 금액</td>
                  <td className="px-4 py-3 text-right text-lg font-bold text-blue-600">
                    {quote.total_amount.toLocaleString()}원
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>

        {/* 설명 */}
        {quote.description && (
          <Card className="p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">상세 설명</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{quote.description}</p>
          </Card>
        )}

        {/* 승인/거절 버튼 */}
        {!isAlreadyResponded && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">견적서 검토</h2>
            <p className="text-gray-600 mb-6">
              위 견적서 내용을 확인하셨나요? 승인 또는 거절을 선택해주세요.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleApprove}
                disabled={processing}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                size="lg"
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                {processing ? '처리 중...' : '승인'}
              </Button>
              <Button
                onClick={handleReject}
                disabled={processing}
                variant="destructive"
                className="flex-1"
                size="lg"
              >
                <XCircle className="h-5 w-5 mr-2" />
                {processing ? '처리 중...' : '거절'}
              </Button>
            </div>
          </Card>
        )}

        {/* 푸터 */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>이 견적서는 TalkSign을 통해 발송되었습니다.</p>
          <p className="mt-1">생성일: {new Date(quote.created_at).toLocaleDateString('ko-KR')}</p>
          {quote.valid_until && (
            <p className="mt-1">유효기한: {new Date(quote.valid_until).toLocaleDateString('ko-KR')}</p>
          )}
        </div>
      </div>
    </div>
  )
}
