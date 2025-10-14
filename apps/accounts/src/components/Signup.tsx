import React, { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Checkbox } from './ui/checkbox'

import { Alert, AlertDescription } from './ui/alert'
import { FileText, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { formatPhoneNumber, formatBusinessNumber } from '@/lib/formatters'
import type { UserData } from '@/lib/auth'

interface SignupProps {
  onNavigate: (view: string) => void
  onSignupSuccess?: (email: string) => void
}

export function Signup({ onNavigate, onSignupSuccess }: SignupProps) {
  const { signUp } = useAuth()
  const [formData, setFormData] = useState<UserData>({
    name: '',
    businessRegistrationNumber: '',
    companyName: '',
    phone: '',
    email: '',
    password: '',
    businessName: ''
  })
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showCompanyField, setShowCompanyField] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [agreePrivacy, setAgreePrivacy] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // 간단한 유효성 검사
  const isValid = () => {
    const basicRequirements = (
      formData.name &&
      formData.phone &&
      formData.email &&
      formData.password &&
      formData.password.length >= 6 &&
      formData.password === confirmPassword &&
      agreeTerms &&
      agreePrivacy
    )
    
    // 사업자등록번호를 입력했으면 회사명도 필수
    if (showCompanyField && !formData.companyName) {
      return false
    }
    
    return basicRequirements
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isValid()) {
      setError('모든 필수 정보를 올바르게 입력해주세요.')
      return
    }
    
    setIsLoading(true)
    setError('')
    
    const result = await signUp(formData)
    
    if (result.success) {
      // 이메일 인증 페이지로 이동 (이메일 정보 전달)
      if (onSignupSuccess) {
        onSignupSuccess(formData.email)
      } else {
        onNavigate('email-verification')
      }
    } else {
      setError(result.error || '회원가입에 실패했습니다.')
    }
    
    setIsLoading(false)
  }

  const handleInputChange = (field: keyof UserData, value: string) => {
    let formattedValue = value
    
    // 필드별 포맷팅 적용
    if (field === 'phone') {
      formattedValue = formatPhoneNumber(value)
    } else if (field === 'businessRegistrationNumber') {
      formattedValue = formatBusinessNumber(value)
    }
    
    setFormData(prev => ({ 
      ...prev, 
      [field]: formattedValue
    }))
    
    // 사업자등록번호 입력시 회사명 필드 표시/숨김
    if (field === 'businessRegistrationNumber') {
      // 숫자만 추출해서 길이 확인 (하이픈 제외)
      const numbersOnly = formattedValue.replace(/\D/g, '')
      setShowCompanyField(numbersOnly.length > 0)
      // 사업자등록번호를 지우면 회사명도 초기화
      if (numbersOnly.length === 0) {
        setFormData(prev => ({ ...prev, companyName: '' }))
      }
    }
    
    setError('') // 입력시 에러 초기화
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Title */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center">
              <FileText className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-medium text-foreground">Link Flow</h1>
            <p className="text-muted-foreground mt-2">새로운 계정을 만들어보세요</p>
          </div>
        </div>

        {/* Signup Form */}
        <Card className="border-border">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-xl text-foreground">회원가입</CardTitle>
            <CardDescription className="text-muted-foreground">
              무료로 시작하여 업무 효율성을 높여보세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-4 border-destructive bg-destructive/10">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <AlertDescription className="text-destructive">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 mt-6">
              {/* 대표자명 */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground">대표자명 *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="홍길동"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="bg-input-background border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>

              {/* 사업자등록번호 (선택) */}
              <div className="space-y-2">
                <Label htmlFor="businessRegistrationNumber" className="text-foreground">사업자등록번호 (선택)</Label>
                <Input
                  id="businessRegistrationNumber"
                  type="text"
                  placeholder="123-12-12345"
                  value={formData.businessRegistrationNumber}
                  onChange={(e) => handleInputChange('businessRegistrationNumber', e.target.value)}
                  className="bg-input-background border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>

              {/* 회사명 (사업자등록번호 입력시에만 표시) - 슬라이드 애니메이션 */}
              <div 
                className="transition-all duration-500 ease-out overflow-hidden"
                style={{
                  maxHeight: showCompanyField ? '120px' : '0px',
                  opacity: showCompanyField ? 1 : 0,
                  transform: `translateY(${showCompanyField ? '0px' : '-20px'})`,
                  marginBottom: showCompanyField ? '16px' : '0px',
                  paddingTop: showCompanyField ? '0px' : '0px'
                }}
              >
                <div 
                  className="space-y-2"
                  style={{
                    transform: `translateY(${showCompanyField ? '0px' : '-10px'})`,
                    transition: 'transform 0.5s ease-out 0.1s'
                  }}
                >
                  <Label 
                    htmlFor="companyName" 
                    className="text-foreground block"
                    style={{
                      opacity: showCompanyField ? 1 : 0,
                      transition: 'opacity 0.4s ease-out 0.2s'
                    }}
                  >
                    회사명 *
                  </Label>
                  <Input
                    id="companyName"
                    type="text"
                    placeholder="(주)회사명 또는 개인사업자명"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    className="bg-input-background border-border text-foreground placeholder:text-muted-foreground"
                    style={{
                      opacity: showCompanyField ? 1 : 0,
                      transform: `translateY(${showCompanyField ? '0px' : '-5px'})`,
                      transition: 'opacity 0.4s ease-out 0.3s, transform 0.4s ease-out 0.3s'
                    }}
                    tabIndex={showCompanyField ? 0 : -1}
                  />
                </div>
              </div>

              {/* 연락처 */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-foreground">연락처 *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="010-1234-5678"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="bg-input-background border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>

              {/* 이메일 (ID) */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">이메일 (ID) *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="bg-input-background border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">비밀번호 *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="8자 이상 입력하세요"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="bg-input-background border-border text-foreground placeholder:text-muted-foreground pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground">비밀번호 확인 *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="비밀번호를 다시 입력하세요"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-input-background border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>

              {/* 약관 동의 */}
              <div className="space-y-4 pt-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="terms"
                    checked={agreeTerms}
                    onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
                    className="mt-0.5 h-4 w-4 border-2 border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <Label htmlFor="terms" className="text-sm text-foreground cursor-pointer leading-5">
                    <Button
                      type="button"
                      variant="link"
                      className="text-primary hover:text-primary/80 p-0 h-auto underline text-sm"
                      onClick={() => onNavigate('terms')}
                    >
                      이용약관
                    </Button>
                    에 동의합니다 <span className="text-destructive">*</span>
                  </Label>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="privacy"
                    checked={agreePrivacy}
                    onCheckedChange={(checked) => setAgreePrivacy(checked as boolean)}
                    className="mt-0.5 h-4 w-4 border-2 border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <Label htmlFor="privacy" className="text-sm text-foreground cursor-pointer leading-5">
                    <Button
                      type="button"
                      variant="link"
                      className="text-primary hover:text-primary/80 p-0 h-auto underline text-sm"
                      onClick={() => onNavigate('privacy')}
                    >
                      개인정보처리방침
                    </Button>
                    에 동의합니다 <span className="text-destructive">*</span>
                  </Label>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={isLoading || !isValid()}
              >
                {isLoading ? "가입 중..." : "회원가입"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <div className="text-sm text-muted-foreground">
                이미 계정이 있으신가요?{' '}
                <Button
                  variant="link"
                  className="text-primary hover:text-primary/80 p-0"
                  onClick={() => onNavigate('login')}
                >
                  로그인
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
