import AuthProvider from '@/components/auth-provider'
import { Toaster } from '@/components/ui/toaster'
import { getServerAuth } from '@/server/auth'
import '@/styles/tailwind.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import SiteHeader from './header'
import { cn } from '@/lib/utils'
import SiteInnerLayout from './inner-layout'

const inter = Inter({
  subsets: ['latin'],
  preload: true,
})

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
        "max-w-full !overflow-x-hidden overflow-hidden"
        // "max-h-screen overflow-hidden"
      )}>
        <div className='overflow-auto max-h-screen'>
          <AuthProvider session={session}>
            <SiteHeader />
            <div className='pt-[70px]'>
              <SiteInnerLayout>
                {children}
              </SiteInnerLayout>
            </div>
            <Toaster />
          </AuthProvider>
        </div>

      </body>
    </html>
  )
}
