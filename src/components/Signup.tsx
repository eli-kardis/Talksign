import React, { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Checkbox } from './ui/checkbox'

import { Alert, AlertDescription } from './ui/alert'
import { FileText, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { formatPhoneNumber } from '@/lib/formatters'
import type { UserData } from '@/lib/auth'

interface SignupProps {
  onNavigate: (view: string) => void
}

export function Signup({ onNavigate }: SignupProps) {
  const { signUp } = useAuth()
  const [formData, setFormData] = useState<UserData>({
    name: '',
    email: '',
    password: '',
    businessName: '',
    phone: ''
  })
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [agreePrivacy, setAgreePrivacy] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // 간단한 유효성 검사
  const isValid = () => {
    return (
      formData.name &&
      formData.email &&
      formData.password &&
      formData.password.length >= 6 &&
      formData.password === confirmPassword &&
      agreeTerms &&
      agreePrivacy
    )
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
      alert('회원가입이 완료되었습니다. 로그인해 주세요.')
      onNavigate('login')
    } else {
      setError(result.error || '회원가입에 실패했습니다.')
    }
    
    setIsLoading(false)
  }

  const handleInputChange = (field: keyof UserData, value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      [field]: field === 'phone' ? formatPhoneNumber(value) : value 
    }))
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
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground">이름 *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="홍길동"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="bg-input-background border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">이메일 *</Label>
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
                <Label htmlFor="businessName" className="text-foreground">사업자명 (선택)</Label>
                <Input
                  id="businessName"
                  type="text"
                  placeholder="개인사업자 또는 법인명"
                  value={formData.businessName}
                  onChange={(e) => handleInputChange('businessName', e.target.value)}
                  className="bg-input-background border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-foreground">전화번호 *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="010-1234-5678"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
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
