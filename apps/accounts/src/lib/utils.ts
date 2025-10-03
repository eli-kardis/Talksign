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