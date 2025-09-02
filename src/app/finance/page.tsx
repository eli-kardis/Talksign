// src/app/finance/page.tsx
import { redirect } from 'next/navigation';

export default function FinancePage() {
  redirect('/finance/payments');
}