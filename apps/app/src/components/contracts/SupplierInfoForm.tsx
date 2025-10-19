import React from 'react'
import { Card } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Button } from '../ui/button'
import { Building, Edit3 } from 'lucide-react'
import { formatPhoneNumber, formatBusinessNumber } from '@/lib/formatters'

interface SupplierInfoFormProps {
  supplierInfo: {
    name: string
    email: string
    phone: string
    fax?: string
    businessRegistrationNumber: string
    businessType?: string
    businessCategory?: string
    companyName: string
    businessAddress?: string
    companySealImageUrl?: string
  }
  isEditing: boolean
  onSupplierInfoChange: (info: any) => void
  onEditToggle: () => void
}

export function SupplierInfoForm({
  supplierInfo,
  isEditing,
  onSupplierInfoChange,
  onEditToggle,
}: SupplierInfoFormProps) {
  return (
    <Card className="p-4 md:p-6 bg-card border-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Building className="w-5 h-5 text-primary" />
          <h3 className="font-medium text-foreground">수급업체 정보</h3>
        </div>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
        <div className="space-y-2">
          <Label htmlFor="supplierName" className="text-foreground">
            대표자명 *
          </Label>
          <Input
            id="supplierName"
            value={supplierInfo.name}
            onChange={(e) =>
              onSupplierInfoChange({ ...supplierInfo, name: e.target.value })
            }
            placeholder={isEditing ? '홍길동' : ''}
            className={
              isEditing
                ? 'bg-input-background border-border'
                : 'bg-muted text-muted-foreground'
            }
            disabled={!isEditing}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="supplierEmail" className="text-foreground">
            이메일 *
          </Label>
          <Input
            id="supplierEmail"
            type="email"
            value={supplierInfo.email}
            onChange={(e) =>
              onSupplierInfoChange({ ...supplierInfo, email: e.target.value })
            }
            placeholder={isEditing ? 'supplier@example.com' : ''}
            className={
              isEditing
                ? 'bg-input-background border-border'
                : 'bg-muted text-muted-foreground'
            }
            disabled={!isEditing}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="supplierPhone" className="text-foreground">
            연락처 *
          </Label>
          <Input
            id="supplierPhone"
            value={supplierInfo.phone}
            onChange={(e) =>
              onSupplierInfoChange({
                ...supplierInfo,
                phone: formatPhoneNumber(e.target.value),
              })
            }
            placeholder={isEditing ? '010-1234-5678' : ''}
            className={
              isEditing
                ? 'bg-input-background border-border'
                : 'bg-muted text-muted-foreground'
            }
            disabled={!isEditing}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="supplierFax" className="text-foreground">
            팩스
          </Label>
          <Input
            id="supplierFax"
            value={supplierInfo.fax || ''}
            onChange={(e) =>
              onSupplierInfoChange({
                ...supplierInfo,
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

        <div className="space-y-2">
          <Label
            htmlFor="supplierBusinessNumber"
            className="text-foreground"
          >
            사업자등록번호
          </Label>
          <Input
            id="supplierBusinessNumber"
            value={supplierInfo.businessRegistrationNumber}
            onChange={(e) =>
              onSupplierInfoChange({
                ...supplierInfo,
                businessRegistrationNumber: formatBusinessNumber(e.target.value),
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

        {supplierInfo.businessRegistrationNumber && (
          <>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="supplierCompanyName" className="text-foreground">
                회사명 *
              </Label>
              <Input
                id="supplierCompanyName"
                value={supplierInfo.companyName}
                onChange={(e) =>
                  onSupplierInfoChange({
                    ...supplierInfo,
                    companyName: e.target.value,
                  })
                }
                placeholder={isEditing ? '(주)회사명 또는 개인사업자명' : ''}
                className={
                  isEditing
                    ? 'bg-input-background border-border'
                    : 'bg-muted text-muted-foreground'
                }
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplierBusinessType" className="text-foreground">
                업태
              </Label>
              <Input
                id="supplierBusinessType"
                value={supplierInfo.businessType || ''}
                onChange={(e) =>
                  onSupplierInfoChange({
                    ...supplierInfo,
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
              <Label htmlFor="supplierBusinessCategory" className="text-foreground">
                업종
              </Label>
              <Input
                id="supplierBusinessCategory"
                value={supplierInfo.businessCategory || ''}
                onChange={(e) =>
                  onSupplierInfoChange({
                    ...supplierInfo,
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

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="supplierBusinessAddress" className="text-foreground">
            사업장 주소
          </Label>
          <Input
            id="supplierBusinessAddress"
            value={supplierInfo.businessAddress || ''}
            onChange={(e) =>
              onSupplierInfoChange({
                ...supplierInfo,
                businessAddress: e.target.value,
              })
            }
            placeholder={isEditing ? '서울시 강남구 테헤란로 123' : ''}
            className={
              isEditing
                ? 'bg-input-background border-border'
                : 'bg-muted text-muted-foreground'
            }
            disabled={!isEditing}
          />
        </div>
      </div>

      <div className="mt-4 p-3 bg-muted/30 rounded-lg">
        <p className="text-sm text-muted-foreground">
          💡 이 정보는 계약서에 공급자 정보로 자동 삽입됩니다. 필요시 수정하세요.
        </p>
      </div>
    </Card>
  )
}
