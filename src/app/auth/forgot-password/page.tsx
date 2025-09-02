'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileText, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'
import Link from "next/link"
import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    try {
      const result = await resetPassword(email)
      
      if (!result.success) {
        setError(result.error || '비밀번호 재설정 이메일 전송에 실패했습니다.')
        return
      }

      setSuccess(true)

    } catch (error) {
      console.error('Forgot password error:', error)
      setError('비밀번호 재설정 이메일 전송 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
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
              <CardTitle className="text-xl text-foreground">이메일이 전송되었습니다</CardTitle>
              <CardDescription className="text-muted-foreground">
                비밀번호 재설정 링크를 확인해주세요
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertDescription className="text-green-800 dark:text-green-300">
                  <strong>{email}</strong>로 비밀번호 재설정 링크를 전송했습니다.
                  이메일을 확인하여 비밀번호를 재설정해주세요.
                </AlertDescription>
              </Alert>

              <div className="text-sm text-muted-foreground space-y-2">
                <p>• 이메일이 도착하지 않았다면 스팸 폴더를 확인해주세요</p>
                <p>• 링크는 1시간 동안 유효합니다</p>
                <p>• 문제가 지속되면 다시 시도해주세요</p>
              </div>

              <div className="flex flex-col space-y-3 pt-4">
                <Button
                  onClick={() => {
                    setSuccess(false)
                    setEmail('')
                  }}
                  variant="outline"
                  className="w-full"
                >
                  다시 전송하기
                </Button>
                
                <Link href="/auth/signin" className="w-full">
                  <Button variant="ghost" className="w-full">
                    <ArrowLeft className="w-4 h-4 mr-2" />
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

        {/* Forgot Password Form */}
        <Card className="border-border">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-xl text-foreground">비밀번호 찾기</CardTitle>
            <CardDescription className="text-muted-foreground">
              가입된 이메일 주소를 입력하면 비밀번호 재설정 링크를 보내드립니다
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
                <Label htmlFor="email" className="text-foreground">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="가입된 이메일 주소를 입력하세요"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-input-background border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={isLoading}
              >
                {isLoading ? "전송 중..." : "재설정 링크 전송"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/auth/signin"
                className="text-sm text-muted-foreground hover:text-foreground flex items-center justify-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                로그인으로 돌아가기
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
