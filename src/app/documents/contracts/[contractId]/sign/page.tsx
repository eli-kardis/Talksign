// src/app/documents/contracts/[contractId]/sign/page.tsx
"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTenant } from "@/contexts/TenantContext";

interface ContractSignPageProps {
  params: {
    contractId: string;
  };
}

export default function ContractSignPage({ params }: ContractSignPageProps) {
  const router = useRouter();
  const { basePath } = useTenant();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSigning, setIsSigning] = useState(false);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleCancel = () => {
    router.push(`${basePath}/documents/contracts`);
  };

  const handleComplete = async () => {
    setIsSigning(true);
    
    // 서명 처리 로직 (실제로는 API 호출)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    alert('계약서 서명이 완료되었습니다.');
    router.push(`${basePath}/documents/contracts`);
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">계약서 서명</h1>
          <p className="text-muted-foreground">계약서 ID: {params.contractId}</p>
        </div>
      </div>

      {/* 서명 영역 */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">서명 입력</h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearCanvas}
              disabled={isSigning}
            >
              다시 그리기
            </Button>
          </div>
          
          <div className="border-2 border-dashed border-border rounded-lg p-4">
            <canvas
              ref={canvasRef}
              width={600}
              height={200}
              className="w-full h-48 border border-border rounded cursor-crosshair bg-background"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
            />
            <p className="text-sm text-muted-foreground mt-2 text-center">
              위 영역에 마우스로 서명을 입력해주세요
            </p>
          </div>
        </div>
      </Card>

      {/* 액션 버튼 */}
      <div className="flex items-center gap-4 justify-end">
        <Button 
          variant="outline" 
          onClick={handleCancel}
          disabled={isSigning}
        >
          취소
        </Button>
        <Button 
          onClick={handleComplete}
          disabled={isSigning}
        >
          {isSigning ? "처리중..." : "서명 완료"}
        </Button>
      </div>
    </div>
  );
}