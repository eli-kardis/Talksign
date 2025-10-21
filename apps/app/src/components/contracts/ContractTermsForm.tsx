import React from 'react'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'
import { Plus, X } from 'lucide-react'

interface ContractTermsFormProps {
  contractTerms: string[]
  onAddTerm: () => void
  onUpdateTerm: (index: number, value: string) => void
  onRemoveTerm: (index: number) => void
  hideWrapper?: boolean
}

export function ContractTermsForm({
  contractTerms,
  onAddTerm,
  onUpdateTerm,
  onRemoveTerm,
  hideWrapper = false,
}: ContractTermsFormProps) {
  const formContent = (
    <>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
        <h3 className="font-medium text-foreground">계약 조건</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAddTerm}
          className="border-border w-fit"
        >
          <Plus className="w-4 h-4 mr-2" />
          조건 추가
        </Button>
      </div>

      <div className="space-y-3">
        {contractTerms.map((term, index) => (
          <div key={index} className="flex items-start gap-2">
            <span className="text-sm text-muted-foreground mt-2 min-w-[20px]">{index + 1}.</span>
            <div className="flex-1">
              <Textarea
                value={term}
                onChange={(e) => onUpdateTerm(index, e.target.value)}
                placeholder="계약 조건을 입력하세요"
                rows={2}
                className="bg-input-background border-border"
              />
            </div>
            {contractTerms.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onRemoveTerm(index)}
                className="text-destructive hover:text-destructive mt-1"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
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
