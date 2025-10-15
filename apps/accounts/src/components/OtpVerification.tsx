'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, CheckCircle, Clock, RefreshCw, ArrowLeft } from 'lucide-react'
import Link from "next/link"
import { supabase } from '@/lib/supabase'

interface OtpVerificationProps {
  email: string
  onResendEmail?: () => Promise<{ success: boolean; error?: string }>
  onBackToSignup?: () => void
}

export function OtpVerification({ email, onResendEmail, onBackToSignup }: OtpVerificationProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // 재전송 쿨다운 타이머
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const handleOtpChange = (index: number, value: string) => {
    // 숫자만 허용
    if (value && !/^\d$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // 다음 입력 칸으로 자동 이동
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // 6자리 모두 입력되면 자동 검증
    if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 6) {
      handleVerifyOtp(newOtp.join(''))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Backspace 처리
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').trim()

    // 6자리 숫자인지 확인
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split('')
      setOtp(newOtp)
      // 자동 검증
      handleVerifyOtp(pastedData)
    }
  }

  const handleVerifyOtp = async (otpCode: string) => {
    setIsVerifying(true)
    setMessage(null)

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otpCode,
        type: 'email',
      })

      if (error) {
        setMessage({
          type: 'error',
          text: '인증 코드가 올바르지 않거나 만료되었습니다.',
        })
        setOtp(['', '', '', '', '', ''])
        inputRefs.current[0]?.focus()
      } else {
        setMessage({
          type: 'success',
          text: '이메일 인증이 완료되었습니다! 잠시 후 대시보드로 이동합니다...',
        })

        // 1초 후 대시보드로 리다이렉트
        setTimeout(() => {
          window.location.href = 'https://app.talksign.co.kr/dashboard'
        }, 1000)
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: '인증 중 오류가 발생했습니다. 다시 시도해주세요.',
      })
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResendEmail = async () => {
    if (!onResendEmail || resendCooldown > 0) return

    setIsResending(true)
    setMessage(null)

    try {
      const result = await onResendEmail()

      if (result.success) {
        setMessage({
          type: 'success',
          text: '인증 코드가 다시 전송되었습니다.',
        })
        setResendCooldown(60) // 60초 쿨다운
        setOtp(['', '', '', '', '', ''])
        inputRefs.current[0]?.focus()
      } else {
        setMessage({
          type: 'error',
          text: result.error || '코드 재전송에 실패했습니다.',
        })
      }
    } catch {
      setMessage({
        type: 'error',
        text: '코드 재전송 중 오류가 발생했습니다.',
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
            <p className="text-muted-foreground mt-2">인증 코드를 입력해주세요</p>
          </div>
        </div>

        {/* Verification Card */}
        <Card className="border-border">
          <CardHeader className="text-center">
            <CardTitle className="text-lg sm:text-xl text-foreground">6자리 인증 코드</CardTitle>
            <CardDescription className="text-muted-foreground">
              {email}로 전송된 코드를 입력하세요
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* OTP Input */}
            <div className="flex gap-2 justify-center" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  disabled={isVerifying}
                  className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-semibold border-2 border-border rounded-lg bg-background text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all disabled:opacity-50"
                />
              ))}
            </div>

            {/* Message Display */}
            {message && (
              <Alert
                className={`${
                  message.type === 'success'
                    ? 'border-primary bg-primary/10'
                    : 'border-destructive bg-destructive/10'
                }`}
              >
                <AlertDescription
                  className={message.type === 'success' ? 'text-primary' : 'text-destructive'}
                >
                  {message.text}
                </AlertDescription>
              </Alert>
            )}

            {/* Instructions */}
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-accent/50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-foreground mb-1">이메일 확인</p>
                  <p className="text-muted-foreground">
                    받은 편지함에서 6자리 인증 코드를 확인하세요
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-accent/50 rounded-lg">
                <Clock className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-foreground mb-1">코드가 보이지 않나요?</p>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• 스팸/정크 메일함을 확인해주세요</li>
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
                  disabled={isResending || resendCooldown > 0 || isVerifying}
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
                      인증 코드 다시 보내기
                    </>
                  )}
                </Button>
              )}

              <div className="flex gap-3">
                {onBackToSignup ? (
                  <Button onClick={onBackToSignup} variant="ghost" className="flex-1">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    회원가입으로 돌아가기
                  </Button>
                ) : (
                  <Button asChild variant="ghost" className="flex-1">
                    <Link href="/auth/signup">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      회원가입으로 돌아가기
                    </Link>
                  </Button>
                )}

                <Button asChild className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Link href="/auth/signin">로그인하기</Link>
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
