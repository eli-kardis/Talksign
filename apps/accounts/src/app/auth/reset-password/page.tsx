'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileText, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react'
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/lib/supabase"

export default function ResetPasswordPage() {
  const router = useRouter()
  const { resetPassword } = useAuth()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isValidSession, setIsValidSession] = useState(false)

  // URL에서 세션 정보 확인 및 세션 설정
  useEffect(() => {
    const checkAndSetSession = async () => {
      try {
        const queryParams = new URLSearchParams(window.location.search)
        const urlError = queryParams.get('error')
        
        // callback에서 온 에러 처리
        if (urlError) {
          let errorMessage = '유효하지 않은 재설정 링크입니다. 새로운 재설정 링크를 요청해주세요.'
          
          if (urlError === 'invalid_link') {
            errorMessage = '재설정 링크가 만료되었거나 유효하지 않습니다.'
          } else if (urlError === 'callback_error') {
            errorMessage = '링크 처리 중 오류가 발생했습니다.'
          } else if (urlError === 'no_code') {
            errorMessage = '재설정 링크가 올바르지 않습니다.'
          }
          
          setError(errorMessage)
          return
        }
        
        // 현재 세션 상태 확인
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Session error:', sessionError)
          setError('세션을 확인할 수 없습니다. 새로운 재설정 링크를 요청해주세요.')
          return
        }
        
        if (session) {
          console.log('Valid session found')
          setIsValidSession(true)
        } else {
          // 세션이 없으면 URL에서 토큰 확인
          const hashParams = new URLSearchParams(window.location.hash.substring(1))
          const accessToken = hashParams.get('access_token') || queryParams.get('access_token')
          const refreshToken = hashParams.get('refresh_token') || queryParams.get('refresh_token')
          const type = hashParams.get('type') || queryParams.get('type')
          
          console.log('URL tokens:', { 
            accessToken: !!accessToken, 
            refreshToken: !!refreshToken, 
            type,
            hash: window.location.hash,
            search: window.location.search 
          })
          
          if (accessToken && type === 'recovery') {
            // Supabase 세션에 토큰 설정
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || ''
            })
            
            if (error) {
              console.error('Session set error:', error)
              setError('유효하지 않은 재설정 링크입니다. 새로운 재설정 링크를 요청해주세요.')
            } else if (data.session) {
              console.log('Session set successfully')
              setIsValidSession(true)
            } else {
              setError('세션 설정에 실패했습니다. 새로운 재설정 링크를 요청해주세요.')
            }
          } else {
            setError('유효하지 않은 재설정 링크입니다. 새로운 재설정 링크를 요청해주세요.')
          }
        }
      } catch (error) {
        console.error('Session check error:', error)
        setError('링크 처리 중 오류가 발생했습니다. 새로운 재설정 링크를 요청해주세요.')
      }
    }

    checkAndSetSession()
  }, [])

  const validatePassword = (password: string): string | null => {
    if (password.length < 6) {
      return '비밀번호는 최소 6자 이상이어야 합니다.'
    }
    if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
      return '비밀번호는 영문과 숫자를 포함해야 합니다.'
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // 비밀번호 검증
    const passwordError = validatePassword(password)
    if (passwordError) {
      setError(passwordError)
      return
    }

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    setIsLoading(true)
    
    try {
      const result = await resetPassword(password)
      
      if (!result.success) {
        setError(result.error || '비밀번호 재설정에 실패했습니다.')
        return
      }

      setSuccess(true)
      
      // 3초 후 로그인 페이지로 리다이렉트
      setTimeout(() => {
        router.push('/auth/signin')
      }, 3000)

    } catch (error) {
      console.error('Reset password error:', error)
      setError('비밀번호 재설정 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isValidSession && error) {
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
          </div>

          {/* Error Message */}
          <Card className="border-border">
            <CardHeader className="space-y-1 text-center">
              <div className="flex justify-center mb-4">
                <AlertCircle className="w-12 h-12 text-destructive" />
              </div>
              <CardTitle className="text-xl text-foreground">링크가 유효하지 않습니다</CardTitle>
              <CardDescription className="text-muted-foreground">
                비밀번호 재설정 링크가 만료되었거나 유효하지 않습니다
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-destructive bg-destructive/10">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <AlertDescription className="text-destructive">
                  {error}
                </AlertDescription>
              </Alert>

              <div className="flex flex-col space-y-3">
                <Link href="/auth/forgot-password" className="w-full">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    새로운 재설정 링크 요청
                  </Button>
                </Link>
                
                <Link href="/auth/signin" className="w-full">
                  <Button variant="ghost" className="w-full">
                    로그인으로 돌아가기
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (success) {
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
          </div>

          {/* Success Message */}
          <Card className="border-border">
            <CardHeader className="space-y-1 text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
              <CardTitle className="text-xl text-foreground">비밀번호가 변경되었습니다</CardTitle>
              <CardDescription className="text-muted-foreground">
                새로운 비밀번호로 로그인할 수 있습니다
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertDescription className="text-green-800 dark:text-green-300">
                  비밀번호가 성공적으로 변경되었습니다. 잠시 후 로그인 페이지로 이동합니다.
                </AlertDescription>
              </Alert>

              <Link href="/auth/signin" className="w-full">
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  로그인하기
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
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
        </div>

        {/* Reset Password Form */}
        <Card className="border-border">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-xl text-foreground">새 비밀번호 설정</CardTitle>
            <CardDescription className="text-muted-foreground">
              새로운 비밀번호를 입력해주세요
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">새 비밀번호</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="새 비밀번호를 입력하세요 (최소 6자)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
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
                <div className="text-xs text-muted-foreground">
                  영문, 숫자를 포함하여 6자 이상 입력해주세요
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground">비밀번호 확인</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="비밀번호를 다시 입력하세요"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="bg-input-background border-border text-foreground placeholder:text-muted-foreground pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
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
                disabled={isLoading}
              >
                {isLoading ? "변경 중..." : "비밀번호 변경"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/auth/signin"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                로그인으로 돌아가기
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
