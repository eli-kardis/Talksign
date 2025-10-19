'use client'

import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Alert, AlertDescription } from './ui/alert'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { FileText, Save, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { formatPhoneNumber, formatBusinessNumber } from '@/lib/formatters'

interface UserProfile {
  name: string
  phone: string
  email: string
  businessRegistrationNumber: string
  companyName: string
  businessAddress: string
}

interface SettingsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function Settings({ open, onOpenChange }: SettingsProps) {
  const { user, updateProfile } = useAuth()
  const [formData, setFormData] = useState<UserProfile>({
    name: '',
    phone: '',
    email: '',
    businessRegistrationNumber: '',
    companyName: '',
    businessAddress: ''
  })
  const [originalData, setOriginalData] = useState<UserProfile>({
    name: '',
    phone: '',
    email: '',
    businessRegistrationNumber: '',
    companyName: '',
    businessAddress: ''
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [showCompanyField, setShowCompanyField] = useState(false)

  useEffect(() => {
    if (user) {
      loadUserProfile()
    }
  }, [user])

  const loadUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('name, phone, email, business_registration_number, company_name, business_address')
        .eq('id', user?.id)
        .single()

      if (error) {
        console.error('프로필 로딩 오류:', error)
        setError('공급자 정보를 불러오는데 실패했습니다.')
        return
      }

      const profileData = {
        name: data.name || '',
        phone: data.phone || '',
        email: data.email || '',
        businessRegistrationNumber: data.business_registration_number || '',
        companyName: data.company_name || '',
        businessAddress: data.business_address || ''
      }

      setFormData(profileData)
      setOriginalData(profileData)
      setShowCompanyField(!!data.business_registration_number)
    } catch (error) {
      console.error('공급자 정보 로딩 중 오류:', error)
      setError('공급자 정보를 불러오는데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    let formattedValue = value

    if (field === 'phone') {
      formattedValue = formatPhoneNumber(value)
    } else if (field === 'businessRegistrationNumber') {
      formattedValue = formatBusinessNumber(value)
    }

    setFormData(prev => ({
      ...prev,
      [field]: formattedValue
    }))

    if (field === 'businessRegistrationNumber') {
      const numbersOnly = formattedValue.replace(/\D/g, '')
      setShowCompanyField(numbersOnly.length > 0)
      if (numbersOnly.length === 0) {
        setFormData(prev => ({ ...prev, companyName: '' }))
      }
    }

    setMessage('')
    setError('')
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.phone || !formData.email) {
      setError('필수 정보를 모두 입력해주세요.')
      return
    }

    if (showCompanyField && !formData.companyName) {
      setError('사업자등록번호를 입력했으면 회사명도 입력해주세요.')
      return
    }

    setIsSaving(true)
    setError('')
    setMessage('')

    try {
      const result = await updateProfile({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        businessRegistrationNumber: formData.businessRegistrationNumber,
        companyName: formData.companyName,
        businessAddress: formData.businessAddress
      })

      if (result.success) {
        setMessage('공급자 정보가 성공적으로 업데이트되었습니다.')
        setOriginalData(formData)
      } else {
        setError(result.error || '공급자 정보 업데이트에 실패했습니다.')
      }
    } catch (error) {
      console.error('공급자 정보 저장 오류:', error)
      setError('공급자 정보 저장 중 오류가 발생했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setError('모든 비밀번호 필드를 입력해주세요.')
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.')
      return
    }

    if (passwordData.newPassword.length < 6) {
      setError('새 비밀번호는 최소 6자 이상이어야 합니다.')
      return
    }

    setIsChangingPassword(true)
    setError('')
    setMessage('')

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      })

      if (error) {
        setError('비밀번호 변경에 실패했습니다.')
        console.error('비밀번호 변경 오류:', error)
        return
      }

      setMessage('비밀번호가 성공적으로 변경되었습니다.')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error) {
      console.error('비밀번호 변경 오류:', error)
      setError('비밀번호 변경 중 오류가 발생했습니다.')
    } finally {
      setIsChangingPassword(false)
    }
  }

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
          <DialogTitle className="text-xl font-medium text-center">계정 설정</DialogTitle>
          <p className="text-muted-foreground text-center text-sm">공급자 정보를 수정하고 비밀번호를 변경할 수 있습니다</p>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">로딩 중...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">

            {/* Messages */}
            {message && (
              <Alert className="border-green-200 bg-green-50">
                <AlertCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {message}
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert className="border-destructive bg-destructive/10">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <AlertDescription className="text-destructive">
                  {error}
                </AlertDescription>
              </Alert>
            )}

        {/* Supplier Settings */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-xl text-foreground">공급자 정보</CardTitle>
            <CardDescription className="text-muted-foreground">
              기본 공급자 정보를 수정할 수 있습니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* 대표자명 */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground">대표자명 *</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="bg-input-background border-border text-foreground"
                />
              </div>

              {/* 이메일 */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">이메일 *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="bg-input-background border-border text-foreground"
                />
              </div>

              {/* 연락처 */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-foreground">연락처 *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="bg-input-background border-border text-foreground"
                />
              </div>

              {/* 사업자등록번호 */}
              <div className="space-y-2">
                <Label htmlFor="businessRegistrationNumber" className="text-foreground">사업자등록번호</Label>
                <Input
                  id="businessRegistrationNumber"
                  type="text"
                  placeholder="123-12-12345"
                  value={formData.businessRegistrationNumber}
                  onChange={(e) => handleInputChange('businessRegistrationNumber', e.target.value)}
                  className="bg-input-background border-border text-foreground"
                />
              </div>

              {/* 회사명 */}
              <div
                className="transition-all duration-500 ease-out overflow-hidden"
                style={{
                  maxHeight: showCompanyField ? '120px' : '0px',
                  opacity: showCompanyField ? 1 : 0,
                  transform: `translateY(${showCompanyField ? '0px' : '-20px'})`,
                  marginBottom: showCompanyField ? '16px' : '0px'
                }}
              >
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-foreground">회사명 *</Label>
                  <Input
                    id="companyName"
                    type="text"
                    placeholder="(주)회사명 또는 개인사업자명"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    className="bg-input-background border-border text-foreground"
                  />
                </div>
              </div>

              {/* 사업장 주소 */}
              <div className="space-y-2">
                <Label htmlFor="businessAddress" className="text-foreground">사업장 주소</Label>
                <Input
                  id="businessAddress"
                  type="text"
                  placeholder="서울시 강남구 테헤란로 123"
                  value={formData.businessAddress}
                  onChange={(e) => handleInputChange('businessAddress', e.target.value)}
                  className="bg-input-background border-border text-foreground"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={isSaving || !hasChanges}
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "저장 중..." : "공급자 정보 저장"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Password Change */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-xl text-foreground">비밀번호 변경</CardTitle>
            <CardDescription className="text-muted-foreground">
              계정의 비밀번호를 변경할 수 있습니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              {/* 현재 비밀번호 */}
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-foreground">현재 비밀번호 *</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPasswords.current ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="bg-input-background border-border text-foreground pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                  >
                    {showPasswords.current ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              {/* 새 비밀번호 */}
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-foreground">새 비밀번호 *</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPasswords.new ? "text" : "password"}
                    placeholder="6자 이상 입력하세요"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="bg-input-background border-border text-foreground pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                  >
                    {showPasswords.new ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              {/* 새 비밀번호 확인 */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground">새 비밀번호 확인 *</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPasswords.confirm ? "text" : "password"}
                    placeholder="새 비밀번호를 다시 입력하세요"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="bg-input-background border-border text-foreground pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={isChangingPassword}
              >
                {isChangingPassword ? "변경 중..." : "비밀번호 변경"}
              </Button>
            </form>
          </CardContent>
        </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}