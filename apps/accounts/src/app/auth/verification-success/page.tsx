'use client'

import { useEffect } from 'react'
import { CheckCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function VerificationSuccessPage() {
  useEffect(() => {
    // 3초 후 자동으로 창 닫기
    const timer = setTimeout(() => {
      window.close()

      // 일부 브라우저에서 window.close()가 작동하지 않을 수 있으므로
      // 대시보드로 리다이렉트
      setTimeout(() => {
        window.location.href = 'https://app.talksign.co.kr/dashboard'
      }, 500)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-border">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl text-foreground">이메일 인증 완료!</CardTitle>
          <CardDescription className="text-muted-foreground">
            잠시 후 이 창이 자동으로 닫힙니다
          </CardDescription>
        </CardHeader>

        <CardContent className="text-center space-y-4">
          <div className="bg-primary/10 rounded-lg p-4">
            <p className="text-sm text-foreground">
              회원가입이 완료되었습니다.<br />
              원래 창으로 돌아가 대시보드를 확인해주세요.
            </p>
          </div>

          <p className="text-xs text-muted-foreground">
            창이 자동으로 닫히지 않으면 이 창을 닫아주세요
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
