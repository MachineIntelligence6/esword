import AuthProvider from '@/components/auth-provider'
import { Toaster } from '@/components/ui/toaster'
import { getServerAuth } from '@/server/auth'
import '@/styles/tailwind.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import SiteHeader from './header'
import { cn } from '@/lib/utils'
import SiteInnerLayout from './inner-layout'
import { redirect } from 'next/navigation'

const inter = Inter({
  subsets: ['latin'],
  preload: true,
})

export const metadata: Metadata = {
  title: 'Hidden Sword',
  description: '',
}



export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerAuth()
  if (typeof session === "boolean" && session === false) return redirect("/api/auth/logout")
  return (
    <html lang="en">
      <body className={cn(
        inter.className,
        "max-w-full !overflow-x-hidden overflow-hidden "
        // "max-h-screen overflow-hidden "
      )}>
        <AuthProvider session={session}>
          <SiteHeader />
          <div className='pt-[70px] overflow-y-auto'>
            <SiteInnerLayout>
              {children}
            </SiteInnerLayout>
          </div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
