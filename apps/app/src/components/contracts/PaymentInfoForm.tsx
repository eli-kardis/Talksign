import React from 'react'
import { Card } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { BankCombobox } from '../BankCombobox'

interface PaymentInfoFormProps {
  paymentInfo: {
    paymentCondition: string
    paymentMethod: string
    paymentDueDate: string
    bankName: string
    bankAccountNumber: string
    bankAccountHolder: string
  }
  installmentInfo: {
    depositRatio: number
    depositAmount: number
    depositDueDate: string
    interimRatio: number
    interimAmount: number
    interimDueDate: string
    finalRatio: number
    finalAmount: number
    finalDueDate: string
  }
  installmentInputMode: 'ratio' | 'amount'
  totalAmount: number
  onPaymentInfoChange: (info: any) => void
  onInstallmentInfoChange: (info: any) => void
  onInstallmentInputModeChange: (mode: 'ratio' | 'amount') => void
  formatCurrency: (amount: number) => string
  hideWrapper?: boolean
}

export function PaymentInfoForm({
  paymentInfo,
  installmentInfo,
  installmentInputMode,
  totalAmount,
  onPaymentInfoChange,
  onInstallmentInfoChange,
  onInstallmentInputModeChange,
  formatCurrency,
  hideWrapper = false,
}: PaymentInfoFormProps) {
  const formContent = (
    <>
      <h3 className="font-medium mb-4 text-foreground">결제 정보 (선택사항)</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="paymentCondition" className="text-foreground">결제 조건</Label>
          <select
            id="paymentCondition"
            value={paymentInfo.paymentCondition}
            onChange={(e) => onPaymentInfoChange({ ...paymentInfo, paymentCondition: e.target.value })}
            className="w-full h-10 px-3 rounded-md border border-border bg-input-background"
          >
            <option value="">선택하세요</option>
            <option value="선불">선불</option>
            <option value="후불">후불</option>
            <option value="분할">분할</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="paymentMethod" className="text-foreground">결제 방법</Label>
          <select
            id="paymentMethod"
            value={paymentInfo.paymentMethod}
            onChange={(e) => onPaymentInfoChange({ ...paymentInfo, paymentMethod: e.target.value })}
            className="w-full h-10 px-3 rounded-md border border-border bg-input-background"
          >
            <option value="">선택하세요</option>
            <option value="계좌이체">계좌이체</option>
            <option value="카드">카드</option>
            <option value="현금">현금</option>
          </select>
        </div>
        {paymentInfo.paymentCondition !== '분할' && (
          <div className="space-y-2">
            <Label htmlFor="paymentDueDate" className="text-foreground">결제 기한</Label>
            <Input
              type="date"
              id="paymentDueDate"
              value={paymentInfo.paymentDueDate}
              onChange={(e) => onPaymentInfoChange({ ...paymentInfo, paymentDueDate: e.target.value })}
              className="bg-input-background border-border"
            />
          </div>
        )}
      </div>

      {/* 분할 결제 상세 정보 */}
      {paymentInfo.paymentCondition === '분할' && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-foreground">분할 결제 상세</h4>
            <div className="flex items-center gap-2 text-sm">
              <button
                type="button"
                onClick={() => onInstallmentInputModeChange('ratio')}
                className={`px-3 py-1 rounded ${
                  installmentInputMode === 'ratio'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                비율 (%)
              </button>
              <button
                type="button"
                onClick={() => onInstallmentInputModeChange('amount')}
                className={`px-3 py-1 rounded ${
                  installmentInputMode === 'amount'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                금액 (원)
              </button>
            </div>
          </div>
          <div className="mb-3 p-3 bg-muted rounded-md">
            <p className="text-sm text-muted-foreground">
              총 계약 금액: <span className="font-semibold text-foreground">{formatCurrency(totalAmount)}</span>
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* 선금 */}
            <div className="space-y-2">
              <Label htmlFor="depositInput" className="text-foreground">
                선금 {installmentInputMode === 'ratio' ? '(%)' : '(원)'}
              </Label>
              <Input
                type="text"
                id="depositInput"
                value={
                  installmentInputMode === 'ratio'
                    ? installmentInfo.depositRatio
                    : new Intl.NumberFormat('ko-KR').format(installmentInfo.depositAmount)
                }
                onChange={(e) => {
                  const rawValue = e.target.value.replace(/,/g, '')
                  const numValue = Number(rawValue)
                  if (isNaN(numValue)) return

                  if (installmentInputMode === 'ratio') {
                    const value = Math.max(0, Math.min(100, numValue))
                    const depositAmt = Math.floor(totalAmount * value / 100)
                    const remainingRatio = 100 - value - installmentInfo.interimRatio
                    const finalRatio = Math.max(0, remainingRatio)
                    const finalAmt = Math.floor(totalAmount * finalRatio / 100)
                    onInstallmentInfoChange({
                      ...installmentInfo,
                      depositRatio: value,
                      depositAmount: depositAmt,
                      finalRatio: finalRatio,
                      finalAmount: finalAmt
                    })
                  } else {
                    const amount = Math.max(0, Math.min(totalAmount, numValue))
                    const ratio = totalAmount > 0 ? Math.round((amount / totalAmount) * 100) : 0
                    const finalAmt = Math.max(0, totalAmount - amount - installmentInfo.interimAmount)
                    const finalRatio = totalAmount > 0 ? Math.round((finalAmt / totalAmount) * 100) : 0
                    onInstallmentInfoChange({
                      ...installmentInfo,
                      depositAmount: amount,
                      depositRatio: ratio,
                      finalAmount: finalAmt,
                      finalRatio: finalRatio
                    })
                  }
                }}
                className="bg-input-background border-border"
              />
              <p className="text-xs text-muted-foreground">
                {installmentInputMode === 'ratio'
                  ? `금액: ${new Intl.NumberFormat('ko-KR').format(installmentInfo.depositAmount)}원`
                  : `비율: ${installmentInfo.depositRatio}%`}
              </p>
            </div>
            {/* 중도금 */}
            <div className="space-y-2">
              <Label htmlFor="interimInput" className="text-foreground">
                중도금 {installmentInputMode === 'ratio' ? '(%)' : '(원)'}
              </Label>
              <Input
                type="text"
                id="interimInput"
                value={
                  installmentInputMode === 'ratio'
                    ? installmentInfo.interimRatio
                    : new Intl.NumberFormat('ko-KR').format(installmentInfo.interimAmount)
                }
                onChange={(e) => {
                  const rawValue = e.target.value.replace(/,/g, '')
                  const numValue = Number(rawValue)
                  if (isNaN(numValue)) return

                  if (installmentInputMode === 'ratio') {
                    const value = Math.max(0, Math.min(100, numValue))
                    const interimAmt = Math.floor(totalAmount * value / 100)
                    const remainingRatio = 100 - installmentInfo.depositRatio - value
                    const finalRatio = Math.max(0, remainingRatio)
                    const finalAmt = Math.floor(totalAmount * finalRatio / 100)
                    onInstallmentInfoChange({
                      ...installmentInfo,
                      interimRatio: value,
                      interimAmount: interimAmt,
                      finalRatio: finalRatio,
                      finalAmount: finalAmt
                    })
                  } else {
                    const amount = Math.max(0, Math.min(totalAmount, numValue))
                    const ratio = totalAmount > 0 ? Math.round((amount / totalAmount) * 100) : 0
                    const finalAmt = Math.max(0, totalAmount - installmentInfo.depositAmount - amount)
                    const finalRatio = totalAmount > 0 ? Math.round((finalAmt / totalAmount) * 100) : 0
                    onInstallmentInfoChange({
                      ...installmentInfo,
                      interimAmount: amount,
                      interimRatio: ratio,
                      finalAmount: finalAmt,
                      finalRatio: finalRatio
                    })
                  }
                }}
                className="bg-input-background border-border"
              />
              <p className="text-xs text-muted-foreground">
                {installmentInputMode === 'ratio'
                  ? `금액: ${new Intl.NumberFormat('ko-KR').format(installmentInfo.interimAmount)}원`
                  : `비율: ${installmentInfo.interimRatio}%`}
              </p>
            </div>
            {/* 잔금 */}
            <div className="space-y-2">
              <Label htmlFor="finalInput" className="text-foreground">
                잔금 {installmentInputMode === 'ratio' ? '(%)' : '(원)'}
              </Label>
              <Input
                type="text"
                id="finalInput"
                value={
                  installmentInputMode === 'ratio'
                    ? installmentInfo.finalRatio
                    : new Intl.NumberFormat('ko-KR').format(installmentInfo.finalAmount)
                }
                onChange={(e) => {
                  const rawValue = e.target.value.replace(/,/g, '')
                  const numValue = Number(rawValue)
                  if (isNaN(numValue)) return

                  if (installmentInputMode === 'ratio') {
                    const value = Math.max(0, Math.min(100, numValue))
                    const amount = Math.floor(totalAmount * value / 100)
                    onInstallmentInfoChange({ ...installmentInfo, finalRatio: value, finalAmount: amount })
                  } else {
                    const amount = Math.max(0, Math.min(totalAmount, numValue))
                    const ratio = totalAmount > 0 ? Math.round((amount / totalAmount) * 100) : 0
                    onInstallmentInfoChange({ ...installmentInfo, finalAmount: amount, finalRatio: ratio })
                  }
                }}
                className={`bg-input-background border-border ${
                  (() => {
                    const totalRatio = installmentInfo.depositRatio + installmentInfo.interimRatio + installmentInfo.finalRatio
                    const totalAmountCalc = installmentInfo.depositAmount + installmentInfo.interimAmount + installmentInfo.finalAmount
                    const isInvalidRatio = installmentInputMode === 'ratio' && totalRatio !== 100
                    const isInvalidAmount = installmentInputMode === 'amount' && totalAmountCalc !== totalAmount
                    return (isInvalidRatio || isInvalidAmount) ? 'border-red-500' : ''
                  })()
                }`}
              />
              <p className="text-xs text-muted-foreground">
                {installmentInputMode === 'ratio'
                  ? `금액: ${new Intl.NumberFormat('ko-KR').format(installmentInfo.finalAmount)}원`
                  : `비율: ${installmentInfo.finalRatio}%`}
              </p>
              {(() => {
                if (installmentInputMode === 'ratio') {
                  const expectedRatio = 100 - installmentInfo.depositRatio - installmentInfo.interimRatio
                  if (installmentInfo.finalRatio !== expectedRatio) {
                    return (
                      <p className="text-xs text-red-600 dark:text-red-400">
                        올바른 비율: {expectedRatio}%
                      </p>
                    )
                  }
                } else {
                  const expectedAmount = totalAmount - installmentInfo.depositAmount - installmentInfo.interimAmount
                  if (installmentInfo.finalAmount !== expectedAmount) {
                    return (
                      <p className="text-xs text-red-600 dark:text-red-400">
                        올바른 금액: {new Intl.NumberFormat('ko-KR').format(expectedAmount)}원
                      </p>
                    )
                  }
                }
                return null
              })()}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="depositDueDate" className="text-foreground">선금 지급일</Label>
              <Input
                type="date"
                id="depositDueDate"
                value={installmentInfo.depositDueDate}
                onChange={(e) => onInstallmentInfoChange({ ...installmentInfo, depositDueDate: e.target.value })}
                className={`bg-input-background border-border ${
                  (() => {
                    if (!installmentInfo.depositDueDate) return ''
                    if (installmentInfo.interimDueDate && installmentInfo.depositDueDate > installmentInfo.interimDueDate) return 'border-red-500'
                    if (installmentInfo.finalDueDate && installmentInfo.depositDueDate > installmentInfo.finalDueDate) return 'border-red-500'
                    return ''
                  })()
                }`}
              />
              {(() => {
                if (!installmentInfo.depositDueDate) return null
                if (installmentInfo.interimDueDate && installmentInfo.depositDueDate > installmentInfo.interimDueDate) {
                  return <p className="text-xs text-red-600 dark:text-red-400">선금 지급일은 중도금 지급일보다 빠르거나 같아야 합니다</p>
                }
                if (installmentInfo.finalDueDate && installmentInfo.depositDueDate > installmentInfo.finalDueDate) {
                  return <p className="text-xs text-red-600 dark:text-red-400">선금 지급일은 잔금 지급일보다 빠르거나 같아야 합니다</p>
                }
                return null
              })()}
            </div>
            <div className="space-y-2">
              <Label htmlFor="interimDueDate" className="text-foreground">중도금 지급일</Label>
              <Input
                type="date"
                id="interimDueDate"
                value={installmentInfo.interimDueDate}
                onChange={(e) => onInstallmentInfoChange({ ...installmentInfo, interimDueDate: e.target.value })}
                className={`bg-input-background border-border ${
                  (() => {
                    if (!installmentInfo.interimDueDate) return ''
                    if (installmentInfo.depositDueDate && installmentInfo.interimDueDate < installmentInfo.depositDueDate) return 'border-red-500'
                    if (installmentInfo.finalDueDate && installmentInfo.interimDueDate > installmentInfo.finalDueDate) return 'border-red-500'
                    return ''
                  })()
                }`}
              />
              {(() => {
                if (!installmentInfo.interimDueDate) return null
                if (installmentInfo.depositDueDate && installmentInfo.interimDueDate < installmentInfo.depositDueDate) {
                  return <p className="text-xs text-red-600 dark:text-red-400">중도금 지급일은 선금 지급일보다 늦거나 같아야 합니다</p>
                }
                if (installmentInfo.finalDueDate && installmentInfo.interimDueDate > installmentInfo.finalDueDate) {
                  return <p className="text-xs text-red-600 dark:text-red-400">중도금 지급일은 잔금 지급일보다 빠르거나 같아야 합니다</p>
                }
                return null
              })()}
            </div>
            <div className="space-y-2">
              <Label htmlFor="finalDueDate" className="text-foreground">잔금 지급일</Label>
              <Input
                type="date"
                id="finalDueDate"
                value={installmentInfo.finalDueDate}
                onChange={(e) => onInstallmentInfoChange({ ...installmentInfo, finalDueDate: e.target.value })}
                className={`bg-input-background border-border ${
                  (() => {
                    if (!installmentInfo.finalDueDate) return ''
                    if (installmentInfo.depositDueDate && installmentInfo.finalDueDate < installmentInfo.depositDueDate) return 'border-red-500'
                    if (installmentInfo.interimDueDate && installmentInfo.finalDueDate < installmentInfo.interimDueDate) return 'border-red-500'
                    return ''
                  })()
                }`}
              />
              {(() => {
                if (!installmentInfo.finalDueDate) return null
                if (installmentInfo.depositDueDate && installmentInfo.finalDueDate < installmentInfo.depositDueDate) {
                  return <p className="text-xs text-red-600 dark:text-red-400">잔금 지급일은 선금 지급일보다 늦거나 같아야 합니다</p>
                }
                if (installmentInfo.interimDueDate && installmentInfo.finalDueDate < installmentInfo.interimDueDate) {
                  return <p className="text-xs text-red-600 dark:text-red-400">잔금 지급일은 중도금 지급일보다 늦거나 같아야 합니다</p>
                }
                return null
              })()}
            </div>
          </div>
        </div>
      )}

      {paymentInfo.paymentMethod === '계좌이체' && (
        <div className="mt-4 pt-4 border-t border-border">
          <h4 className="font-medium mb-3 text-foreground">입금 계좌 정보</h4>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="space-y-2 md:col-span-4">
              <Label htmlFor="bankName" className="text-foreground">은행명 *</Label>
              <BankCombobox
                value={paymentInfo.bankName}
                onChange={(value) => onPaymentInfoChange({ ...paymentInfo, bankName: value })}
                placeholder="은행을 선택하세요"
              />
            </div>
            <div className="space-y-2 md:col-span-5">
              <Label htmlFor="bankAccountNumber" className="text-foreground">계좌번호 *</Label>
              <Input
                id="bankAccountNumber"
                value={paymentInfo.bankAccountNumber}
                onChange={(e) => onPaymentInfoChange({ ...paymentInfo, bankAccountNumber: e.target.value })}
                placeholder="계좌번호 입력"
                className="bg-input-background border-border"
              />
            </div>
            <div className="space-y-2 md:col-span-3">
              <Label htmlFor="bankAccountHolder" className="text-foreground">예금주 *</Label>
              <Input
                id="bankAccountHolder"
                value={paymentInfo.bankAccountHolder}
                onChange={(e) => onPaymentInfoChange({ ...paymentInfo, bankAccountHolder: e.target.value })}
                placeholder="예금주명 입력"
                className="bg-input-background border-border"
              />
            </div>
          </div>
        </div>
      )}
    </>
  )

  if (hideWrapper) {
    return formContent
  }

  return (
    <Card className="p-4 md:p-6 bg-card border-border">
      {formContent}
    </Card>
  )
}
