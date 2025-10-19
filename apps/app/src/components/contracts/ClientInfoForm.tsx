import React from 'react'
import { Card } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Button } from '../ui/button'
import { User, Edit3 } from 'lucide-react'
import { formatPhoneNumber, formatBusinessNumber } from '@/lib/formatters'

interface ClientInfoFormProps {
  clientInfo: {
    name: string
    email: string
    phone: string
    fax?: string
    company: string
    businessNumber: string
    businessType?: string
    businessCategory?: string
    address: string
  }
  isEditing: boolean
  onClientInfoChange: (info: any) => void
  onEditToggle: () => void
  onSelectFromCustomers?: () => void
  hideWrapper?: boolean // Option to render without Card wrapper
}

export function ClientInfoForm({
  clientInfo,
  isEditing,
  onClientInfoChange,
  onEditToggle,
  onSelectFromCustomers,
  hideWrapper = false,
}: ClientInfoFormProps) {
  const formContent = (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="clientCompany" className="text-foreground">
            회사명{clientInfo.businessNumber ? ' *' : ''}
          </Label>
          <Input
            id="clientCompany"
            value={clientInfo.company}
            onChange={(e) =>
              onClientInfoChange({ ...clientInfo, company: e.target.value })
            }
            placeholder={isEditing ? '(주)회사명' : ''}
            className={
              isEditing
                ? 'bg-input-background border-border'
                : 'bg-muted text-muted-foreground'
            }
            disabled={!isEditing}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="clientBusinessNumber" className="text-foreground">
            사업자등록번호
          </Label>
          <Input
            id="clientBusinessNumber"
            value={clientInfo.businessNumber}
            onChange={(e) =>
              onClientInfoChange({
                ...clientInfo,
                businessNumber: formatBusinessNumber(e.target.value),
              })
            }
            placeholder={isEditing ? '123-12-12345' : ''}
            className={
              isEditing
                ? 'bg-input-background border-border'
                : 'bg-muted text-muted-foreground'
            }
            disabled={!isEditing}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="clientName" className="text-foreground">
            대표자명 *
          </Label>
          <Input
            id="clientName"
            value={clientInfo.name}
            onChange={(e) =>
              onClientInfoChange({ ...clientInfo, name: e.target.value })
            }
            placeholder="홍길동"
            className={
              isEditing
                ? 'bg-input-background border-border'
                : 'bg-muted text-muted-foreground'
            }
            disabled={!isEditing}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="clientEmail" className="text-foreground">
            이메일 *
          </Label>
          <Input
            id="clientEmail"
            type="email"
            value={clientInfo.email}
            onChange={(e) =>
              onClientInfoChange({ ...clientInfo, email: e.target.value })
            }
            placeholder="client@example.com"
            className={
              isEditing
                ? 'bg-input-background border-border'
                : 'bg-muted text-muted-foreground'
            }
            disabled={!isEditing}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="clientPhone" className="text-foreground">
            연락처 *
          </Label>
          <Input
            id="clientPhone"
            value={clientInfo.phone}
            onChange={(e) =>
              onClientInfoChange({
                ...clientInfo,
                phone: formatPhoneNumber(e.target.value),
              })
            }
            placeholder="010-1234-5678"
            className={
              isEditing
                ? 'bg-input-background border-border'
                : 'bg-muted text-muted-foreground'
            }
            disabled={!isEditing}
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="clientAddress" className="text-foreground">
            주소
          </Label>
          <Input
            id="clientAddress"
            value={clientInfo.address}
            onChange={(e) =>
              onClientInfoChange({ ...clientInfo, address: e.target.value })
            }
            placeholder={isEditing ? '서울시 강남구...' : ''}
            className={
              isEditing
                ? 'bg-input-background border-border'
                : 'bg-muted text-muted-foreground'
            }
            disabled={!isEditing}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="clientFax" className="text-foreground">
            팩스
          </Label>
          <Input
            id="clientFax"
            value={clientInfo.fax || ''}
            onChange={(e) =>
              onClientInfoChange({
                ...clientInfo,
                fax: e.target.value,
              })
            }
            placeholder={isEditing ? '02-1234-5678' : ''}
            className={
              isEditing
                ? 'bg-input-background border-border'
                : 'bg-muted text-muted-foreground'
            }
            disabled={!isEditing}
          />
        </div>

        {clientInfo.businessNumber && (
          <>
            <div className="space-y-2">
              <Label htmlFor="clientBusinessType" className="text-foreground">
                업태
              </Label>
              <Input
                id="clientBusinessType"
                value={clientInfo.businessType || ''}
                onChange={(e) =>
                  onClientInfoChange({
                    ...clientInfo,
                    businessType: e.target.value,
                  })
                }
                placeholder={isEditing ? '예: 서비스업' : ''}
                className={
                  isEditing
                    ? 'bg-input-background border-border'
                    : 'bg-muted text-muted-foreground'
                }
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientBusinessCategory" className="text-foreground">
                업종
              </Label>
              <Input
                id="clientBusinessCategory"
                value={clientInfo.businessCategory || ''}
                onChange={(e) =>
                  onClientInfoChange({
                    ...clientInfo,
                    businessCategory: e.target.value,
                  })
                }
                placeholder={isEditing ? '예: 소프트웨어 개발' : ''}
                className={
                  isEditing
                    ? 'bg-input-background border-border'
                    : 'bg-muted text-muted-foreground'
                }
                disabled={!isEditing}
              />
            </div>
          </>
        )}
      </div>
  )

  if (hideWrapper) {
    return formContent
  }

  return (
    <Card className="p-4 md:p-6 bg-card border-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          <h3 className="font-medium text-foreground">발주처 정보</h3>
        </div>
        <div className="flex items-center gap-2">
          {onSelectFromCustomers && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onSelectFromCustomers}
              className="text-xs"
            >
              고객 선택
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onEditToggle}
            className="p-2"
          >
            <Edit3 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {formContent}

      <div className="mt-4 p-3 bg-muted/30 rounded-lg">
        <p className="text-sm text-muted-foreground">
          💡 발주처는 계약서를 받아보고 서명할 고객입니다.
        </p>
      </div>
    </Card>
  )
}
