import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TalkSign 계정',
  description: 'TalkSign 로그인 및 회원가입',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}