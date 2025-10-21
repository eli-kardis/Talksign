'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckCircle, XCircle, FileText, Building, User, Upload, Pen } from 'lucide-react'
import SignatureCanvas from 'react-signature-canvas'

interface ContractData {
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
  project_start_date: string | null
  project_end_date: string | null
  project_description: string | null
  items: Array<{
    id: string
    description: string
    quantity: number
    unit_price: number
    amount: number
  }>
  total_amount: number
  status: string
  created_at: string
}

export default function PublicContractPage() {
  const params = useParams()
  const token = params.token as string

  const [contract, setContract] = useState<ContractData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  // 서명 관련
  const [signatureMethod, setSignatureMethod] = useState<'draw' | 'upload'>('draw')
  const [signatureImage, setSignatureImage] = useState<string | null>(null)
  const signatureRef = useRef<SignatureCanvas>(null)

  useEffect(() => {
    fetchContract()
  }, [token])

  const fetchContract = async () => {
    try {
      const response = await fetch(`/api/public/contracts/${token}`)

      if (!response.ok) {
        if (response.status === 404) {
          setError('계약서를 찾을 수 없거나 만료되었습니다.')
        } else {
          setError('계약서를 불러오는데 실패했습니다.')
        }
        setLoading(false)
        return
      }

      const data = await response.json()
      setContract(data)
    } catch (err) {
      setError('계약서를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 이미지 파일인지 확인
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드할 수 있습니다.')
      return
    }

    // 파일 크기 제한 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB 이하여야 합니다.')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setSignatureImage(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const clearSignature = () => {
    if (signatureMethod === 'draw') {
      signatureRef.current?.clear()
    } else {
      setSignatureImage(null)
    }
  }

  const getSignatureData = (): string | null => {
    if (signatureMethod === 'draw') {
      if (signatureRef.current?.isEmpty()) {
        return null
      }
      return signatureRef.current?.toDataURL() || null
    } else {
      return signatureImage
    }
  }

  const handleApprove = async () => {
    if (!contract) return

    const signatureData = getSignatureData()
    if (!signatureData) {
      alert('서명을 입력해주세요.')
      return
    }

    if (!confirm('서명 후 계약서를 승인하시겠습니까?')) return

    setProcessing(true)
    try {
      const response = await fetch(`/api/public/contracts/${token}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          signature_data: signatureData,
        }),
      })

      if (!response.ok) {
        throw new Error('승인 처리에 실패했습니다.')
      }

      alert('계약서가 승인되었습니다!')
      fetchContract() // 상태 업데이트
    } catch (err) {
      alert(err instanceof Error ? err.message : '승인 처리에 실패했습니다.')
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!contract) return

    if (!confirm('이 계약서를 거절하시겠습니까?')) return

    setProcessing(true)
    try {
      const response = await fetch(`/api/public/contracts/${token}/reject`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('거절 처리에 실패했습니다.')
      }

      alert('계약서가 거절되었습니다.')
      fetchContract() // 상태 업데이트
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
          <p className="mt-4 text-gray-600">계약서를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (error || !contract) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full p-8 text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">오류</h1>
          <p className="text-gray-600">{error || '계약서를 찾을 수 없습니다.'}</p>
        </Card>
      </div>
    )
  }

  const isAlreadyResponded = contract.status === 'signed' || contract.status === 'cancelled'

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{contract.title}</h1>
              <p className="text-sm text-gray-500">계약서</p>
            </div>
          </div>

          {contract.status === 'signed' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-green-800 font-medium">이미 서명된 계약서입니다</span>
            </div>
          )}

          {contract.status === 'cancelled' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <span className="text-red-800 font-medium">거절된 계약서입니다</span>
            </div>
          )}
        </div>

        {/* 공급자/수신자 정보 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Building className="h-5 w-5" />
              공급자 (갑)
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-500">회사명</label>
                <p className="font-medium">{contract.supplier_company}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">담당자</label>
                <p className="font-medium">{contract.supplier_name}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="h-5 w-5" />
              수신자 (을)
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-500">회사명</label>
                <p className="font-medium">{contract.client_company || '-'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">담당자</label>
                <p className="font-medium">{contract.client_name}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* 프로젝트 정보 */}
        {contract.project_description && (
          <Card className="p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">프로젝트 정보</h2>
            {(contract.project_start_date || contract.project_end_date) && (
              <div className="grid grid-cols-2 gap-4 mb-4">
                {contract.project_start_date && (
                  <div>
                    <label className="text-sm text-gray-500">시작일</label>
                    <p className="font-medium">{new Date(contract.project_start_date).toLocaleDateString('ko-KR')}</p>
                  </div>
                )}
                {contract.project_end_date && (
                  <div>
                    <label className="text-sm text-gray-500">종료일</label>
                    <p className="font-medium">{new Date(contract.project_end_date).toLocaleDateString('ko-KR')}</p>
                  </div>
                )}
              </div>
            )}
            <div>
              <label className="text-sm text-gray-500">상세 설명</label>
              <p className="whitespace-pre-wrap mt-1">{contract.project_description}</p>
            </div>
          </Card>
        )}

        {/* 계약 항목 */}
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">계약 항목</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">항목</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">수량</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">단가</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">금액</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {contract.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 text-sm">{item.description}</td>
                    <td className="px-4 py-3 text-sm text-right">{item.quantity.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-right">{item.unit_price.toLocaleString()}원</td>
                    <td className="px-4 py-3 text-sm text-right font-medium">{item.amount.toLocaleString()}원</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-right font-semibold">총 계약 금액</td>
                  <td className="px-4 py-3 text-right text-lg font-bold text-blue-600">
                    {contract.total_amount.toLocaleString()}원
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>

        {/* 서명 및 승인/거절 */}
        {!isAlreadyResponded && (
          <Card className="p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">계약서 서명</h2>

            {/* 서명 방식 선택 */}
            <div className="mb-6">
              <Label className="mb-3 block">서명 방식</Label>
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant={signatureMethod === 'draw' ? 'default' : 'outline'}
                  onClick={() => setSignatureMethod('draw')}
                  className="flex-1"
                >
                  <Pen className="h-4 w-4 mr-2" />
                  직접 그리기
                </Button>
                <Button
                  type="button"
                  variant={signatureMethod === 'upload' ? 'default' : 'outline'}
                  onClick={() => setSignatureMethod('upload')}
                  className="flex-1"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  도장 이미지 업로드
                </Button>
              </div>
            </div>

            {/* 서명 입력 영역 */}
            <div className="mb-6">
              {signatureMethod === 'draw' ? (
                <div>
                  <Label className="mb-2 block">서명을 입력하세요</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-white">
                    <SignatureCanvas
                      ref={signatureRef}
                      canvasProps={{
                        className: 'w-full h-40 border border-gray-200 rounded',
                      }}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearSignature}
                    className="mt-2"
                  >
                    지우기
                  </Button>
                </div>
              ) : (
                <div>
                  <Label htmlFor="signature-upload" className="mb-2 block">
                    도장 이미지를 업로드하세요
                  </Label>
                  <Input
                    id="signature-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="mb-4"
                  />
                  {signatureImage && (
                    <div className="border-2 border-gray-300 rounded-lg p-4 bg-white">
                      <img
                        src={signatureImage}
                        alt="서명 미리보기"
                        className="max-h-40 mx-auto"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={clearSignature}
                        className="mt-2"
                      >
                        제거
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 승인/거절 버튼 */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleApprove}
                disabled={processing}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                size="lg"
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                {processing ? '처리 중...' : '서명 후 승인'}
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
          <p>이 계약서는 TalkSign을 통해 발송되었습니다.</p>
          <p className="mt-1">생성일: {new Date(contract.created_at).toLocaleDateString('ko-KR')}</p>
        </div>
      </div>
    </div>
  )
}
