'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, CheckCircle, Clock, RefreshCw, ArrowLeft } from 'lucide-react'
import Link from "next/link"

interface EmailVerificationProps {
  email: string
  onResendEmail?: () => Promise<{ success: boolean; error?: string }>
  onBackToSignup?: () => void
}

export function EmailVerification({ email, onResendEmail, onBackToSignup }: EmailVerificationProps) {
  const [isResending, setIsResending] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // 재전송 쿨다운 타이머
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const handleResendEmail = async () => {
    if (!onResendEmail || resendCooldown > 0) return

    setIsResending(true)
    setMessage(null)

    try {
      const result = await onResendEmail()
      
      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: '인증 이메일이 다시 전송되었습니다.' 
        })
        setResendCooldown(60) // 60초 쿨다운
      } else {
        setMessage({ 
          type: 'error', 
          text: result.error || '이메일 재전송에 실패했습니다.' 
        })
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: '이메일 재전송 중 오류가 발생했습니다.' 
      })
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center">
              <Mail className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-medium text-foreground">이메일 인증</h1>
            <p className="text-muted-foreground mt-2">이메일을 확인해주세요</p>
          </div>
        </div>

        {/* Verification Card */}
        <Card className="border-border">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-xl text-foreground">이메일을 확인해주세요</CardTitle>
            <CardDescription className="text-muted-foreground">
              회원가입을 완료하려면 이메일 인증이 필요합니다
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Email Display */}
            <div className="bg-secondary rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground mb-1">인증 이메일이 전송되었습니다</p>
              <p className="font-medium text-foreground break-all">{email}</p>
            </div>

            {/* Instructions */}
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-accent/50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-foreground mb-1">1. 이메일 확인</p>
                  <p className="text-muted-foreground">받은 편지함에서 Link Flow에서 보낸 이메일을 찾아주세요</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-accent/50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-foreground mb-1">2. 인증 링크 클릭</p>
                  <p className="text-muted-foreground">이메일 내의 &ldquo;이메일 인증하기&rdquo; 버튼을 클릭해주세요</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-accent/50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-foreground mb-1">3. 로그인 완료</p>
                  <p className="text-muted-foreground">인증 완료 후 로그인하여 서비스를 이용해주세요</p>
                </div>
              </div>
            </div>

            {/* Message Display */}
            {message && (
              <Alert className={`${
                message.type === 'success' 
                  ? 'border-primary bg-primary/10' 
                  : 'border-destructive bg-destructive/10'
              }`}>
                <AlertDescription className={
                  message.type === 'success' ? 'text-primary' : 'text-destructive'
                }>
                  {message.text}
                </AlertDescription>
              </Alert>
            )}

            {/* Email Not Found */}
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-foreground mb-1">이메일이 보이지 않나요?</p>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• 스팸/정크 메일함을 확인해주세요</li>
                    <li>• 이메일 주소가 정확한지 확인해주세요</li>
                    <li>• 몇 분 후에 다시 확인해주세요</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {onResendEmail && (
                <Button
                  onClick={handleResendEmail}
                  disabled={isResending || resendCooldown > 0}
                  variant="outline"
                  className="w-full"
                >
                  {isResending ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      전송 중...
                    </>
                  ) : resendCooldown > 0 ? (
                    <>
                      <Clock className="w-4 h-4 mr-2" />
                      {resendCooldown}초 후 재전송 가능
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      인증 이메일 다시 보내기
                    </>
                  )}
                </Button>
              )}

              <div className="flex gap-3">
                {onBackToSignup ? (
                  <Button
                    onClick={onBackToSignup}
                    variant="ghost"
                    className="flex-1"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    회원가입으로 돌아가기
                  </Button>
                ) : (
                  <Button
                    asChild
                    variant="ghost"
                    className="flex-1"
                  >
                    <Link href="/auth/signup">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      회원가입으로 돌아가기
                    </Link>
                  </Button>
                )}

                <Button
                  asChild
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Link href="/auth/signin">
                    로그인하기
                  </Link>
                </Button>
              </div>
            </div>

            {/* Help Text */}
            <div className="text-center pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                문제가 지속되면{' '}
                <Link href="mailto:support@linkflow.co.kr" className="text-primary hover:text-primary/80">
                  고객지원
                </Link>
                으로 문의해주세요
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
