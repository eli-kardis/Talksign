import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { FileText, AlertCircle } from 'lucide-react';
import type { User } from '@/types/user';
import { formatPhoneNumber } from '@/lib/formatters';



interface SocialCompleteProps {
  user: User;
  onComplete: (updatedUser: User) => void;
}

export function SocialComplete({ user, onComplete }: SocialCompleteProps) {
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phone) {
      setError('전화번호를 입력해주세요.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // In a real app, this would call the API
      // For now, we'll just simulate the completion
      const updatedUser = {
        ...user,
        businessName,
        phone
      };
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onComplete(updatedUser);
      
    } catch (error) {
      console.error('Social complete error:', error);
      setError(error instanceof Error ? error.message : '정보 업데이트 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    // 추가 정보 없이 바로 완료 처리
    onComplete(user);
  };

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
            <p className="text-muted-foreground mt-2">추가 정보를 입력해주세요</p>
          </div>
        </div>

        {/* Complete Profile Form */}
        <Card className="border-border">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-xl text-foreground">프로필 완성</CardTitle>
            <CardDescription className="text-muted-foreground">
              안녕하세요 {user.name}님! 서비스 이용을 위해 추가 정보를 입력해주세요.
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
                  value={user.email}
                  disabled
                  className="bg-muted border-border text-muted-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessName" className="text-foreground">사업자명 (선택)</Label>
                <Input
                  id="businessName"
                  type="text"
                  placeholder="개인사업자 또는 법인명"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="bg-input-background border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-foreground">전화번호 *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="010-1234-5678"
                  value={phone}
                  onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                  required
                  className="bg-input-background border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 border-border text-foreground hover:bg-accent"
                  onClick={handleSkip}
                  disabled={isLoading}
                >
                  나중에
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={isLoading}
                >
                  {isLoading ? "저장 중..." : "완료"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
