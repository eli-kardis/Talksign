'use client'

import React, { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card } from './ui/card'
import { Label } from './ui/label'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from './ui/table'
import { Plus, Trash2, GripVertical, Calculator, Calendar } from 'lucide-react'
import { formatNumber } from '@/lib/formatters'

interface ContractItem {
  id: number
  name: string
  description: string
  unitPrice: number
  quantity: number
  unit: string
  amount: number
}

interface ContractItemsTableProps {
  items: ContractItem[]
  onItemsChange: (items: ContractItem[]) => void
  startDate: string
  dueDate: string
  onStartDateChange: (date: string) => void
  onDueDateChange: (date: string) => void
}

export function ContractItemsTable({ 
  items, 
  onItemsChange, 
  startDate, 
  dueDate, 
  onStartDateChange, 
  onDueDateChange 
}: ContractItemsTableProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  
  // 날짜 텍스트 클릭 시 달력 열기
  const handleStartDateTextClick = () => {
    const dateInput = document.getElementById('startDate') as HTMLInputElement
    if (dateInput) {
      dateInput.showPicker?.()
    }
  }

  const handleDueDateTextClick = () => {
    const dateInput = document.getElementById('dueDate') as HTMLInputElement
    if (dateInput) {
      dateInput.showPicker?.()
    }
  }

  const addItem = () => {
    const newId = (items.length ? Math.max(...items.map((i) => i.id)) : 0) + 1
    const newItems = [...items, { 
      id: newId, 
      name: '', 
      description: '', 
      unitPrice: 0, 
      quantity: 1, 
      unit: '개', 
      amount: 0 
    }]
    onItemsChange(newItems)
  }

  const removeItem = (id: number) => {
    if (items.length > 1) {
      const newItems = items.filter((item) => item.id !== id)
      onItemsChange(newItems)
    }
  }

  const updateItem = (id: number, field: keyof ContractItem, value: string | number) => {
    const newItems = items.map((item) => {
      if (item.id !== id) return item
      
      let processedValue = value
      
      // 숫자 필드의 경우 앞의 0 제거
      if (field === 'quantity' || field === 'unitPrice') {
        if (typeof value === 'string') {
          processedValue = formatNumber(value)
        }
      }
      
      const next = { ...item, [field]: processedValue } as ContractItem
      if (field === 'quantity' || field === 'unitPrice') {
        next.amount = (Number(next.quantity) || 0) * (Number(next.unitPrice) || 0)
      }
      return next
    })
    onItemsChange(newItems)
  }

  // 드래그 앤 드롭 기능
  const moveItem = (dragIndex: number, hoverIndex: number) => {
    const dragItem = items[dragIndex]
    const newItems = [...items]
    newItems.splice(dragIndex, 1)
    newItems.splice(hoverIndex, 0, dragItem)
    onItemsChange(newItems)
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString())
    e.dataTransfer.effectAllowed = 'move'
    setDraggedIndex(index)
    
    // 부모 행 요소를 드래그 이미지로 설정
    const handleElement = e.currentTarget as HTMLElement
    const rowElement = handleElement.closest('tr') as HTMLTableRowElement
    
    if (rowElement) {
      e.dataTransfer.setDragImage(rowElement, e.nativeEvent.offsetX, e.nativeEvent.offsetY)
    }
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    // 테이블 영역을 완전히 벗어날 때만 dragOverIndex 초기화
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverIndex(null)
    }
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'))
    if (dragIndex !== dropIndex) {
      moveItem(dragIndex, dropIndex)
    }
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0)
  const vatAmount = Math.floor(totalAmount * 0.1)
  const finalAmount = totalAmount + vatAmount

  const formatCurrency = (amount: number) => new Intl.NumberFormat('ko-KR').format(amount)

  // 각 항목의 이동 상태 계산
  const getItemTransform = (index: number) => {
    if (draggedIndex === null || dragOverIndex === null) return 'translateY(0px)'
    
    // 드래그 중인 항목은 원래 자리에서 투명하게
    if (index === draggedIndex) return 'translateY(0px)'
    
    // 드래그 오버 위치에 따른 다른 항목들의 이동
    if (draggedIndex < dragOverIndex) {
      // 아래로 드래그하는 경우: 드래그된 항목과 드래그오버 항목 사이의 항목들을 위로 이동
      if (index > draggedIndex && index <= dragOverIndex) {
        return 'translateY(-60px)' // 한 행만큼 위로
      }
    } else {
      // 위로 드래그하는 경우: 드래그오버 항목과 드래그된 항목 사이의 항목들을 아래로 이동  
      if (index >= dragOverIndex && index < draggedIndex) {
        return 'translateY(60px)' // 한 행만큼 아래로
      }
    }
    
    return 'translateY(0px)'
  }

  return (
    <Card className="p-6 bg-card border-border">
      <div className="mb-4">
        <h3 className="font-medium text-foreground">계약 항목</h3>
      </div>

      {/* 총액 요약 */}
      <div className="mb-6 p-4 bg-muted/20 rounded-lg">
        <div className="flex items-center gap-2 mb-3">
          <Calculator className="w-5 h-5 text-primary" />
          <h4 className="font-medium text-foreground">계약 요약</h4>
        </div>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="text-muted-foreground mb-1">소계</div>
            <div className="font-mono font-medium text-foreground">{formatCurrency(totalAmount)}원</div>
          </div>
          <div className="text-center">
            <div className="text-muted-foreground mb-1">부가세 (10%)</div>
            <div className="font-mono font-medium text-foreground">{formatCurrency(vatAmount)}원</div>
          </div>
          <div className="text-center">
            <div className="text-muted-foreground mb-1">총 금액</div>
            <div className="font-mono font-bold text-primary text-lg">{formatCurrency(finalAmount)}원</div>
          </div>
        </div>
      </div>

      {/* 계약 기간 */}
      <div className="mb-6 p-5 bg-card rounded-lg border border-border">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-primary" />
          <h4 className="font-medium text-foreground">계약 기간</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startDate" className="text-foreground text-sm mb-2 block">
              시작일
            </Label>
            {/* 숨겨진 실제 날짜 입력 */}
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="sr-only"
            />
            {/* 커스텀 날짜 표시 버튼 */}
            <div 
              className="flex items-center justify-between p-3 bg-input-background border border-border rounded-md cursor-pointer hover:bg-input-background/80 transition-colors h-11"
              onClick={handleStartDateTextClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleStartDateTextClick()
                }
              }}
            >
              <span className="text-foreground">
                {startDate 
                  ? new Date(startDate).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: '2-digit', 
                      day: '2-digit'
                    })
                  : '날짜를 선택하세요'
                }
              </span>
              <Calendar className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
          <div>
            <Label htmlFor="dueDate" className="text-foreground text-sm mb-2 block">
              완료일
            </Label>
            {/* 숨겨진 실제 날짜 입력 */}
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => onDueDateChange(e.target.value)}
              className="sr-only"
              min={startDate || new Date().toISOString().split('T')[0]}
            />
            {/* 커스텀 날짜 표시 버튼 */}
            <div 
              className="flex items-center justify-between p-3 bg-input-background border border-border rounded-md cursor-pointer hover:bg-input-background/80 transition-colors h-11"
              onClick={handleDueDateTextClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleDueDateTextClick()
                }
              }}
            >
              <span className="text-foreground">
                {dueDate 
                  ? new Date(dueDate).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: '2-digit', 
                      day: '2-digit'
                    })
                  : '날짜를 선택하세요'
                }
              </span>
              <Calendar className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        </div>
        {startDate && dueDate && (
          <div className="mt-4 p-3 bg-primary/5 rounded-md border border-primary/20">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="text-primary font-medium">
                {new Date(startDate).toLocaleDateString('ko-KR')} ~ {new Date(dueDate).toLocaleDateString('ko-KR')} 
                ({Math.ceil((new Date(dueDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))}일간)
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 테이블 */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8"></TableHead>
            <TableHead className="min-w-[120px]">항목명</TableHead>
            <TableHead className="min-w-[200px]">설명</TableHead>
            <TableHead className="w-[100px] text-right">단가</TableHead>
            <TableHead className="w-[80px] text-center">수량</TableHead>
            <TableHead className="w-[80px] text-center">단위</TableHead>
            <TableHead className="w-[120px] text-right">금액</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody onDragLeave={handleDragLeave}>
          {items.map((item, index) => (
            <TableRow
              key={item.id}
              className={`transition-all duration-300 ease-out ${
                draggedIndex === index 
                  ? 'opacity-50 bg-muted/50 scale-[0.98] shadow-lg z-10 relative' 
                  : dragOverIndex === index
                  ? 'bg-primary/10 border-primary/30'
                  : 'hover:bg-muted/30'
              }`}
              style={{
                transform: getItemTransform(index)
              }}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
            >
              <TableCell>
                <div 
                  className="flex justify-center p-2 cursor-grab active:cursor-grabbing hover:bg-muted/50 rounded"
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragEnd={handleDragEnd}
                >
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                </div>
              </TableCell>
              <TableCell>
                <Input
                  placeholder="항목명"
                  value={item.name}
                  onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                  className="bg-input-background/50 border border-border/50 p-2 h-9 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary hover:bg-input-background transition-colors"
                />
              </TableCell>
              <TableCell>
                <Input
                  placeholder="상세 설명"
                  value={item.description}
                  onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                  className="bg-input-background/50 border border-border/50 p-2 h-9 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary hover:bg-input-background transition-colors"
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={item.unitPrice === 0 ? '' : item.unitPrice}
                  onChange={(e) => {
                    const value = e.target.value === '' ? 0 : Math.max(0, parseInt(e.target.value) || 0)
                    updateItem(item.id, 'unitPrice', value)
                  }}
                  onWheel={(e) => e.currentTarget.blur()}
                  className="bg-input-background/50 border border-border/50 p-2 h-9 text-right focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary hover:bg-input-background transition-colors"
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  min="0"
                  placeholder="1"
                  value={item.quantity === 0 ? '' : item.quantity}
                  onChange={(e) => {
                    const value = e.target.value === '' ? 1 : Math.max(1, parseInt(e.target.value) || 1)
                    updateItem(item.id, 'quantity', value)
                  }}
                  onWheel={(e) => e.currentTarget.blur()}
                  className="bg-input-background/50 border border-border/50 p-2 h-9 text-center focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary hover:bg-input-background transition-colors"
                />
              </TableCell>
              <TableCell>
                <Input
                  placeholder="개"
                  value={item.unit}
                  onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                  className="bg-input-background/50 border border-border/50 p-2 h-9 text-center focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary hover:bg-input-background transition-colors"
                />
              </TableCell>
              <TableCell>
                <div className="text-right font-mono font-medium text-foreground">
                  {formatCurrency(item.amount)}원
                </div>
              </TableCell>
              <TableCell>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeItem(item.id)}
                  disabled={items.length === 1}
                  className="h-9 w-9 p-0 border-border/50 bg-input-background/30 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {/* 항목 추가 버튼을 테이블 아래에 배치 */}
      <div className="mt-4 flex justify-end">
        <Button type="button" variant="outline" onClick={addItem} className="border-border">
          <Plus className="w-4 h-4 mr-2" />
          항목 추가
        </Button>
      </div>
      
      {items.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          항목을 추가하여 계약서를 작성하세요.
        </div>
      )}
    </Card>
  )
}