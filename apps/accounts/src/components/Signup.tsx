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
import { supabase } from '@/lib/supabase'

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

  const handleGoogleSignup = async () => {
    setIsLoading(true)
    setError('')

    try {
      const redirectUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/auth/callback`
        : 'https://accounts.talksign.co.kr/auth/callback'

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })

      if (error) {
        console.error('Google OAuth error:', error)
        setError('Google 회원가입에 실패했습니다.')
        setIsLoading(false)
      }

      // OAuth는 자동으로 리다이렉트되므로 여기서는 로딩 상태 유지
    } catch (err) {
      console.error('Google OAuth exception:', err)
      setError('Google 회원가입 중 오류가 발생했습니다.')
      setIsLoading(false)
    }
  }

  const handleKakaoSignup = async () => {
    setIsLoading(true)
    setError('')

    try {
      const redirectUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/auth/callback`
        : 'https://accounts.talksign.co.kr/auth/callback'

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'kakao',
        options: {
          redirectTo: redirectUrl,
        }
      })

      if (error) {
        console.error('Kakao OAuth error:', error)
        setError('카카오 회원가입에 실패했습니다.')
        setIsLoading(false)
      }

      // OAuth는 자동으로 리다이렉트되므로 여기서는 로딩 상태 유지
    } catch (err) {
      console.error('Kakao OAuth exception:', err)
      setError('카카오 회원가입 중 오류가 발생했습니다.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Signup Form */}
        <Card className="border-border">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-lg sm:text-xl text-foreground">회원가입</CardTitle>
            <CardDescription className="text-muted-foreground">
              간편하게 가입하고 무료로 시작하세요
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

            {/* 소셜 회원가입 (메인) */}
            <div className="space-y-3 mb-6">
              {/* Google Signup Button */}
              <Button
                type="button"
                className="w-full h-12 text-sm bg-white hover:bg-gray-50 text-[#1f1f1f] border border-[#747775] font-medium rounded-md"
                onClick={handleGoogleSignup}
                disabled={isLoading}
              >
                <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google로 계속하기
              </Button>

              {/* Kakao Signup Button */}
              <Button
                type="button"
                className="w-full h-12 text-base bg-[#FEE500] hover:bg-[#FEE500]/90 text-[#000000]/85 rounded-xl font-medium"
                onClick={handleKakaoSignup}
                disabled={isLoading}
              >
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 4C7.58172 4 4 6.68419 4 10C4 11.8924 5.06339 13.5677 6.72266 14.6621L5.90625 17.8965C5.87109 18.0312 5.97656 18.1621 6.11133 18.1621C6.17188 18.1621 6.23242 18.1367 6.28125 18.0918L9.86328 15.4746C10.5547 15.6113 11.2676 15.6855 12 15.6855C16.4183 15.6855 20 13.0013 20 9.68555C20 6.36978 16.4183 4 12 4Z" fill="#000000"/>
                </svg>
                카카오 로그인
              </Button>
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  또는 이메일로 가입
                </span>
              </div>
            </div>

            {/* 이메일 회원가입 폼 */}
            <form onSubmit={handleSubmit} className="space-y-3">
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
                  maxHeight: showCompanyField ? '200px' : '0px',
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
                variant="outline"
                className="w-full h-10"
                disabled={isLoading || !isValid()}
              >
                {isLoading ? "가입 중..." : "이메일로 회원가입"}
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
