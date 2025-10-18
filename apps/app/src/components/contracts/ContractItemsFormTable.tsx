import React from 'react'
import { Card } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Button } from '../ui/button'
import { Plus, X } from 'lucide-react'

export interface ContractItem {
  id: string
  name: string
  description: string
  quantity: number
  unit_price: number
  amount: number
  unit: string
}

interface ContractItemsFormTableProps {
  items: ContractItem[]
  onItemsChange: (items: ContractItem[]) => void
}

export function ContractItemsFormTable({
  items,
  onItemsChange,
}: ContractItemsFormTableProps) {
  const addItem = () => {
    const newItem: ContractItem = {
      id: Date.now().toString(),
      name: '',
      description: '',
      quantity: 1,
      unit_price: 0,
      amount: 0,
      unit: '개',
    }
    onItemsChange([...items, newItem])
  }

  const removeItem = (id: string) => {
    onItemsChange(items.filter((item) => item.id !== id))
  }

  const updateItem = (id: string, field: keyof ContractItem, value: any) => {
    onItemsChange(
      items.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value }

          // 수량 또는 단가가 변경되면 금액 자동 계산
          if (field === 'quantity' || field === 'unit_price') {
            updated.amount = updated.quantity * updated.unit_price
          }

          return updated
        }
        return item
      })
    )
  }

  const total = items.reduce((sum, item) => sum + item.amount, 0)
  const vat = total * 0.1
  const totalWithVat = total + vat

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount)
  }

  return (
    <Card className="p-4 md:p-6 bg-card border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-foreground">계약 내역</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addItem}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          항목 추가
        </Button>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-2 text-sm font-medium text-muted-foreground">
                항목명
              </th>
              <th className="text-left p-2 text-sm font-medium text-muted-foreground">
                설명
              </th>
              <th className="text-left p-2 text-sm font-medium text-muted-foreground w-20">
                수량
              </th>
              <th className="text-left p-2 text-sm font-medium text-muted-foreground w-24">
                단위
              </th>
              <th className="text-left p-2 text-sm font-medium text-muted-foreground w-32">
                단가
              </th>
              <th className="text-left p-2 text-sm font-medium text-muted-foreground w-32">
                금액
              </th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-border/50">
                <td className="p-2">
                  <Input
                    value={item.name}
                    onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                    placeholder="항목명"
                    className="bg-input-background border-border"
                  />
                </td>
                <td className="p-2">
                  <Textarea
                    value={item.description}
                    onChange={(e) =>
                      updateItem(item.id, 'description', e.target.value)
                    }
                    placeholder="상세 설명"
                    rows={2}
                    className="bg-input-background border-border"
                  />
                </td>
                <td className="p-2">
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(item.id, 'quantity', Number(e.target.value))
                    }
                    min="1"
                    className="bg-input-background border-border"
                  />
                </td>
                <td className="p-2">
                  <Input
                    value={item.unit}
                    onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                    placeholder="개"
                    className="bg-input-background border-border"
                  />
                </td>
                <td className="p-2">
                  <Input
                    type="number"
                    value={item.unit_price}
                    onChange={(e) =>
                      updateItem(item.id, 'unit_price', Number(e.target.value))
                    }
                    min="0"
                    className="bg-input-background border-border"
                  />
                </td>
                <td className="p-2">
                  <div className="text-sm font-medium text-foreground">
                    {formatCurrency(item.amount)}
                  </div>
                </td>
                <td className="p-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(item.id)}
                    className="p-1 hover:bg-destructive/10"
                  >
                    <X className="w-4 h-4 text-destructive" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {items.map((item, index) => (
          <Card key={item.id} className="p-4 bg-muted/30 border-border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-foreground">
                항목 {index + 1}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeItem(item.id)}
                className="p-1 hover:bg-destructive/10"
              >
                <X className="w-4 h-4 text-destructive" />
              </Button>
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">항목명</Label>
                <Input
                  value={item.name}
                  onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                  placeholder="항목명"
                  className="bg-input-background border-border"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">설명</Label>
                <Textarea
                  value={item.description}
                  onChange={(e) =>
                    updateItem(item.id, 'description', e.target.value)
                  }
                  placeholder="상세 설명"
                  rows={2}
                  className="bg-input-background border-border"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">수량</Label>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(item.id, 'quantity', Number(e.target.value))
                    }
                    min="1"
                    className="bg-input-background border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">단위</Label>
                  <Input
                    value={item.unit}
                    onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                    placeholder="개"
                    className="bg-input-background border-border"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">단가</Label>
                <Input
                  type="number"
                  value={item.unit_price}
                  onChange={(e) =>
                    updateItem(item.id, 'unit_price', Number(e.target.value))
                  }
                  min="0"
                  className="bg-input-background border-border"
                />
              </div>

              <div className="pt-2 border-t border-border">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">금액</span>
                  <span className="text-sm font-medium text-foreground">
                    {formatCurrency(item.amount)}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 p-4 bg-muted/30 rounded-lg space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">소계</span>
          <span className="text-foreground font-medium">
            {formatCurrency(total)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">부가세 (10%)</span>
          <span className="text-foreground font-medium">
            {formatCurrency(vat)}
          </span>
        </div>
        <div className="flex justify-between text-base pt-2 border-t border-border">
          <span className="text-foreground font-medium">총 계약 금액</span>
          <span className="text-primary font-bold">
            {formatCurrency(totalWithVat)}
          </span>
        </div>
      </div>
    </Card>
  )
}
