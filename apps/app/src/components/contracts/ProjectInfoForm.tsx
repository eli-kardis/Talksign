import React from 'react'
import { Card } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'

interface ProjectInfoFormProps {
  projectInfo: {
    startDate: string
    endDate: string
    description: string
  }
  onProjectInfoChange: (info: any) => void
  fieldTooltips?: {[key: string]: string}
  hideFieldTooltip?: (field: string) => void
  startDateRef?: React.RefObject<HTMLInputElement | null>
  endDateRef?: React.RefObject<HTMLInputElement | null>
  hideWrapper?: boolean
}

export function ProjectInfoForm({
  projectInfo,
  onProjectInfoChange,
  fieldTooltips = {},
  hideFieldTooltip,
  startDateRef,
  endDateRef,
  hideWrapper = false,
}: ProjectInfoFormProps) {
  const formContent = (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate" className="text-foreground">프로젝트 시작일 *</Label>
          <div className="relative">
            <Input
              ref={startDateRef}
              id="startDate"
              type="date"
              value={projectInfo.startDate}
              onChange={(e) => {
                onProjectInfoChange({...projectInfo, startDate: e.target.value})
                if (e.target.value && fieldTooltips.startDate && hideFieldTooltip) {
                  hideFieldTooltip('startDate')
                }
              }}
              className="bg-input-background border-border"
            />
            {fieldTooltips.startDate && (
              <div className="absolute z-50 px-2 py-1 text-xs text-white bg-red-500 rounded shadow-lg -top-8 left-0 whitespace-nowrap pointer-events-none">
                {fieldTooltips.startDate}
              </div>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate" className="text-foreground">프로젝트 완료일 *</Label>
          <div className="relative">
            <Input
              ref={endDateRef}
              id="endDate"
              type="date"
              value={projectInfo.endDate}
              onChange={(e) => {
                onProjectInfoChange({...projectInfo, endDate: e.target.value})
                if (e.target.value && fieldTooltips.endDate && hideFieldTooltip) {
                  hideFieldTooltip('endDate')
                }
              }}
              className="bg-input-background border-border"
            />
            {fieldTooltips.endDate && (
              <div className="absolute z-50 px-2 py-1 text-xs text-white bg-red-500 rounded shadow-lg -top-8 left-0 whitespace-nowrap pointer-events-none">
                {fieldTooltips.endDate}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="projectDescription" className="text-foreground">프로젝트 상세 설명</Label>
        <Textarea
          id="projectDescription"
          value={projectInfo.description}
          onChange={(e) => onProjectInfoChange({...projectInfo, description: e.target.value})}
          placeholder="프로젝트에 대한 상세한 설명을 입력하세요"
          rows={4}
          className="bg-input-background border-border"
        />
      </div>
    </div>
  )

  if (hideWrapper) {
    return formContent
  }

  return (
    <Card className="p-4 md:p-6 bg-card border-border">
      <h3 className="font-medium mb-4 text-foreground">프로젝트 정보</h3>
      {formContent}
    </Card>
  )
}
