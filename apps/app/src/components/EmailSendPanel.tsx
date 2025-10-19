'use client'

import React, { useState, useEffect } from 'react';
import { X, Mail, Send, Paperclip, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { AuthenticatedApiClient } from '@/lib/api-client';

interface EmailSendPanelProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: 'quote' | 'contract';
  entityId: string;
  entityTitle: string;
  recipientEmail: string;
  recipientName: string;
  senderEmail?: string;
  senderName?: string;
}

export function EmailSendPanel({
  isOpen,
  onClose,
  entityType,
  entityId,
  entityTitle,
  recipientEmail,
  recipientName,
  senderEmail = '',
  senderName = '',
}: EmailSendPanelProps) {
  const [toEmail, setToEmail] = useState(recipientEmail);
  const [fromEmail, setFromEmail] = useState(senderEmail);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  // 기본값 설정
  useEffect(() => {
    if (isOpen) {
      setToEmail(recipientEmail);
      setFromEmail(senderEmail);

      const defaultSubject = entityType === 'quote'
        ? `견적서가 도착했습니다 - ${entityTitle}`
        : `계약서가 도착했습니다 - ${entityTitle}`;
      setSubject(defaultSubject);

      setMessage('');
    }
  }, [isOpen, recipientEmail, senderEmail, entityTitle, entityType]);

  const handleSend = async () => {
    // 유효성 검사
    if (!toEmail.trim()) {
      alert('수신자 이메일을 입력해주세요.');
      return;
    }

    if (!fromEmail.trim()) {
      alert('발신자 이메일을 입력해주세요.');
      return;
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(toEmail)) {
      alert('올바른 수신자 이메일 주소를 입력해주세요.');
      return;
    }

    if (!emailRegex.test(fromEmail)) {
      alert('올바른 발신자 이메일 주소를 입력해주세요.');
      return;
    }

    setIsSending(true);

    try {
      const response = await AuthenticatedApiClient.post('/api/send-email', {
        entityType,
        entityId,
        toEmail: toEmail.trim(),
        fromEmail: fromEmail.trim(),
        subject: subject.trim() || undefined,
        customMessage: message.trim() || undefined,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || '이메일 발송에 실패했습니다.');
      }

      alert(`${recipientName}님께 이메일이 발송되었습니다!`);
      onClose();
    } catch (error) {
      console.error('Email send error:', error);
      alert(error instanceof Error ? error.message : '이메일 발송 중 오류가 발생했습니다.');
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Slide Panel */}
      <div className="fixed right-0 top-0 h-full w-full md:w-[500px] bg-background z-50 shadow-2xl transform transition-transform">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">이메일 발송</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* 문서 정보 */}
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Paperclip className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">첨부 파일</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {entityType === 'quote' ? '견적서' : '계약서'} PDF 파일이 자동으로 첨부됩니다.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                파일명: {entityType}-{entityId}.pdf
              </p>
            </div>

            {/* 수신자 */}
            <div className="space-y-2">
              <Label htmlFor="toEmail">수신자 이메일 *</Label>
              <Input
                id="toEmail"
                type="email"
                value={toEmail}
                onChange={(e) => setToEmail(e.target.value)}
                placeholder="recipient@example.com"
                disabled={isSending}
              />
              <p className="text-xs text-muted-foreground">
                {recipientName}님의 이메일 주소입니다. 필요시 수정 가능합니다.
              </p>
            </div>

            {/* 발신자 */}
            <div className="space-y-2">
              <Label htmlFor="fromEmail">발신자 이메일 *</Label>
              <Input
                id="fromEmail"
                type="email"
                value={fromEmail}
                onChange={(e) => setFromEmail(e.target.value)}
                placeholder="your-email@example.com"
                disabled={isSending}
              />
              <p className="text-xs text-muted-foreground">
                답장을 받을 이메일 주소입니다.
              </p>
            </div>

            {/* 제목 */}
            <div className="space-y-2">
              <Label htmlFor="subject">이메일 제목</Label>
              <Input
                id="subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="이메일 제목을 입력하세요"
                disabled={isSending}
              />
            </div>

            {/* 메시지 */}
            <div className="space-y-2">
              <Label htmlFor="message">
                추가 메시지 (선택사항)
              </Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="고객에게 전달할 메시지를 입력하세요&#10;(예: 검토 후 연락 부탁드립니다.)"
                rows={5}
                disabled={isSending}
              />
              <p className="text-xs text-muted-foreground">
                이메일 본문에 포함될 개인 메시지를 작성할 수 있습니다.
              </p>
            </div>

            {/* 안내 메시지 */}
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-900 dark:text-blue-200">
                💡 <strong>안내:</strong> 고객이 이 이메일에 답장하면 발신자 이메일 주소로 직접 전달됩니다.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-border p-6 space-y-3">
            <Button
              onClick={handleSend}
              disabled={isSending}
              className="w-full"
              size="lg"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  발송 중...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  이메일 발송하기
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSending}
              className="w-full"
            >
              취소
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
