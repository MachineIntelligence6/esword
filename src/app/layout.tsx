import AuthProvider from '@/components/auth-provider'
import { Toaster } from '@/components/ui/toaster'
import { getServerAuth } from '@/server/auth'
import '@/styles/tailwind.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import SiteHeader from './header'
import { cn } from '@/lib/utils'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'E-Sword',
  description: '',
}




export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerAuth()
  return (
    <html lang="en">
      <body className={cn(
        inter.className,
        "max-h-screen overflow-hidden"
      )}>
        <AuthProvider session={session}>
          <SiteHeader session={session} />
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
