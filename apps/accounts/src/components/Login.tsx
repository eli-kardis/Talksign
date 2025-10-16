import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

import { Alert, AlertDescription } from './ui/alert';
import { FileText, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface LoginProps {
  onNavigate: (view: string) => void;
}

export function Login({ onNavigate }: LoginProps) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const result = await signIn(email, password)

    if (result.success) {
      onNavigate('dashboard')
    } else {
      setError(result.error || '로그인에 실패했습니다.')
    }

    setIsLoading(false)
  }

  const handleGoogleLogin = async () => {
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
        setError('Google 로그인에 실패했습니다.')
        setIsLoading(false)
      }

      // OAuth는 자동으로 리다이렉트되므로 여기서는 로딩 상태 유지
    } catch (err) {
      console.error('Google OAuth exception:', err)
      setError('Google 로그인 중 오류가 발생했습니다.')
      setIsLoading(false)
    }
  }

  const handleKakaoLogin = async () => {
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
        setError('카카오 로그인에 실패했습니다.')
        setIsLoading(false)
      }

      // OAuth는 자동으로 리다이렉트되므로 여기서는 로딩 상태 유지
    } catch (err) {
      console.error('Kakao OAuth exception:', err)
      setError('카카오 로그인 중 오류가 발생했습니다.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Login Form */}
        <Card>
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-lg sm:text-xl">로그인</CardTitle>
            <CardDescription>
              간편하게 로그인하고 서비스를 이용하세요
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

            {/* 소셜 로그인 (메인) */}
            <div className="space-y-3">
              {/* Google Login Button */}
              <Button
                type="button"
                className="w-full h-12 text-sm bg-white hover:bg-gray-50 text-[#1f1f1f] border border-[#747775] font-medium rounded-md"
                onClick={handleGoogleLogin}
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

              {/* Kakao Login Button */}
              <Button
                type="button"
                className="w-full h-12 text-base bg-[#FEE500] hover:bg-[#FEE500]/90 text-[#000000]/85 rounded-xl font-medium"
                onClick={handleKakaoLogin}
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
                  또는 이메일로 로그인
                </span>
              </div>
            </div>

            {/* 이메일 로그인 (작게) */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-input-background h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm">비밀번호</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="비밀번호를 입력하세요"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-input-background pr-10 h-10"
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

              <Button
                type="submit"
                variant="outline"
                className="w-full h-10"
                disabled={isLoading}
              >
                {isLoading ? "로그인 중..." : "이메일로 로그인"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <div className="text-sm text-muted-foreground">
                계정이 없으신가요?{' '}
                <Button
                  variant="link"
                  className="p-0"
                  onClick={() => onNavigate('signup')}
                >
                  회원가입
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
