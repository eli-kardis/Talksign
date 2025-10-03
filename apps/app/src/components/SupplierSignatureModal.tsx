import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { PenTool, RotateCcw } from 'lucide-react';

interface SupplierSignatureModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (signatureData: string) => void;
  supplierName?: string;
}

export function SupplierSignatureModal({
  open,
  onClose,
  onConfirm,
  supplierName
}: SupplierSignatureModalProps) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [signature, setSignature] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Reset signature when modal opens
  useEffect(() => {
    if (open) {
      clearSignature();
    }
  }, [open]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let x, y;
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let x, y;
    if ('touches' in e) {
      e.preventDefault();
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#000000';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      setSignature(canvas.toDataURL('image/png'));
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignature('');
  };

  const handleConfirm = () => {
    if (!signature) {
      alert('서명을 먼저 작성해주세요.');
      return;
    }
    onConfirm(signature);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PenTool className="w-5 h-5 text-primary" />
            공급자 전자서명
          </DialogTitle>
          <DialogDescription>
            계약서 전송 전에 귀하의 서명을 작성해주세요.
            {supplierName && (
              <span className="block mt-2 text-foreground font-medium">
                서명인: {supplierName}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Signature Canvas */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">
                서명
              </label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearSignature}
                disabled={!signature}
                className="h-8 px-2 text-xs"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                다시 작성
              </Button>
            </div>

            <div className="relative">
              <canvas
                ref={canvasRef}
                width={450}
                height={200}
                className="w-full border-2 border-dashed border-border rounded-lg cursor-crosshair bg-white touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
              {!signature && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <p className="text-muted-foreground text-sm">
                    여기에 서명해주세요
                  </p>
                </div>
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              마우스나 터치로 위 영역에 서명을 작성하세요. 서명은 계약서에 포함됩니다.
            </p>
          </div>

          {/* Legal Notice */}
          <div className="bg-accent/50 border border-border rounded-lg p-3">
            <p className="text-xs text-foreground">
              <strong>법적 고지:</strong> 본 전자서명은 전자서명법에 따라 법적 효력을 가지며,
              계약서 내용에 대한 귀하의 동의를 의미합니다.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            취소
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={!signature}
            className="bg-primary hover:bg-primary/90"
          >
            서명 완료
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
