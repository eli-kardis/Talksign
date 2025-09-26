// src/types/user.ts
export type AuthProvider = 'email' | 'google' | 'kakao' | 'naver' | (string & {});

export interface User {
  id: string;
  name: string;
  email: string;
  businessName?: string;
  phone?: string;
  provider: AuthProvider; // ✅ 필수로 통일
}