import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 로컬 시간대 기준으로 Date 객체를 YYYY-MM-DD 형식의 문자열로 변환
 * UTC 변환으로 인한 날짜 오프셋 문제를 방지
 */
export function formatDateToLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * YYYY-MM-DD 형식의 문자열을 로컬 시간대 기준 Date 객체로 변환
 * 시간대 오프셋 문제를 방지
 */
export function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day); // month는 0부터 시작하므로 -1
}

/**
 * 이메일 주소에서 username 추출
 * @param email - 이메일 주소 (예: dhtj1234@gmail.com)
 * @returns username (예: dhtj1234)
 */
export function extractUsername(email: string): string {
  const atIndex = email.indexOf('@');
  if (atIndex === -1) {
    return email; // @ 없으면 전체 반환
  }
  return email.substring(0, atIndex);
}

/**
 * 사용자별 URL 생성
 * @param username - 사용자 username
 * @param path - 경로 (예: /dashboard, /customers)
 * @returns 완전한 경로 (예: /dhtj1234/dashboard)
 */
export function getUserPath(username: string, path: string): string {
  // path가 /로 시작하지 않으면 추가
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `/${username}${normalizedPath}`;
}