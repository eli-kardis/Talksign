import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TalkSign - 프리랜서를 위한 올인원 SaaS',
  description: '견적, 전자계약, 결제 및 카카오톡 자동 리마인드 기능을 통합한 올인원 SaaS 서비스',
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