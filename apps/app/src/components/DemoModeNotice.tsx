"use client";

import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function DemoModeNotice() {
  const { user } = useAuth();
  const [showDemoNotice, setShowDemoNotice] = useState(false);

  useEffect(() => {
    // 로그인하지 않았거나 데모 사용자인 경우 데모 모드 알림 표시
    const isDemoMode = !user || user.email === 'demo@talksign.app';
    setShowDemoNotice(isDemoMode);
  }, [user]);

  if (!showDemoNotice) {
    return null;
  }

  return (
    <Alert className="mb-4 border-blue-200 bg-blue-50">
      <Info className="h-4 w-4 text-blue-600" />
      <AlertDescription className="text-blue-800">
        <strong>데모 모드</strong>로 실행 중입니다.
        실제 서비스 이용을 원하시면 회원가입 후 로그인해주세요.
        데모 데이터는 다른 사용자와 공유될 수 있습니다.
      </AlertDescription>
    </Alert>
  );
}