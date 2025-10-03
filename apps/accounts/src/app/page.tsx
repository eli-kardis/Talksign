import { redirect } from 'next/navigation'

export default function AccountsHome() {
  redirect('/auth/signin')
}