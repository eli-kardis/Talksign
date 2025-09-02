import { redirect } from 'next/navigation'

export default function Page() {
  // 루트 페이지는 바로 대시보드로 리다이렉트
  redirect('/dashboard')
}