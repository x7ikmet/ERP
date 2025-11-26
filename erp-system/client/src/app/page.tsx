import { redirect } from 'next/navigation'

export default function RootPage() {
  // For now, redirect everyone to login
  // Later, we can add client-side auth check
  redirect('/login')
}
