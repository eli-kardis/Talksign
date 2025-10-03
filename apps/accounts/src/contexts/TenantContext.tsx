"use client";

import React, { createContext, useContext, ReactNode } from 'react';

interface TenantContextType {
  tenant: string | null;
  basePath: string;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

interface TenantProviderProps {
  tenant: string | null;
  children: ReactNode;
}

export function TenantProvider({ tenant, children }: TenantProviderProps) {
  const basePath = tenant ? `/t/${tenant}` : '';

  const value: TenantContextType = {
    tenant,
    basePath,
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant(): TenantContextType {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}

/**
 * 테넌트 경로와 일반 경로를 결합하는 유틸리티 함수
 * @param path - 추가할 경로 (예: '/dashboard', '/documents/quotes')
 * @param tenant - 테넌트 ID (선택적, 없으면 현재 컨텍스트의 테넌트 사용)
 * @returns 완전한 경로 (예: '/t/company1/dashboard' 또는 '/dashboard')
 */
export function withTenantPath(path: string, tenant?: string | null): string {
  // path가 이미 테넌트 경로로 시작하는 경우 그대로 반환
  if (path.startsWith('/t/')) {
    return path;
  }

  // 명시적으로 tenant가 전달된 경우
  if (tenant !== undefined) {
    return tenant ? `/t/${tenant}${path}` : path;
  }

  // 컨텍스트 없이 호출된 경우 기본 경로 반환
  return path;
}

/**
 * 테넌트 정보 없이도 사용할 수 있는 경로 생성 유틸리티
 * @param path - 기본 경로
 * @param tenant - 테넌트 ID (선택적)
 * @returns 완전한 경로
 */
export function createTenantPath(path: string, tenant?: string | null): string {
  if (tenant) {
    return `/t/${tenant}${path}`;
  }
  return path;
}

/**
 * 현재 경로에서 테넌트 정보를 추출하는 유틸리티
 * @param pathname - 현재 경로 (예: '/t/company1/dashboard')
 * @returns 테넌트 ID 또는 null
 */
export function extractTenantFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/t\/([^\/]+)/);
  return match ? match[1] : null;
}

/**
 * 테넌트 경로에서 기본 경로를 추출하는 유틸리티
 * @param pathname - 현재 경로 (예: '/t/company1/dashboard')
 * @returns 기본 경로 (예: '/dashboard')
 */
export function extractBasePathFromTenantPath(pathname: string): string {
  const match = pathname.match(/^\/t\/[^\/]+(.*)$/);
  return match ? match[1] || '/' : pathname;
}
