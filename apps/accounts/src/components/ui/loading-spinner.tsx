import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  message?: string;
}

export function LoadingSpinner({ 
  size = 'md', 
  className,
  message = '로딩 중...'
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12'
  };

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div 
        className={cn(
          "border-4 border-primary border-t-transparent rounded-full animate-spin",
          sizeClasses[size]
        )}
      />
      {message && (
        <p className="text-muted-foreground text-sm mt-2">{message}</p>
      )}
    </div>
  );
}

export function PageLoadingSpinner({ message }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <LoadingSpinner size="lg" message={message} />
    </div>
  );
}