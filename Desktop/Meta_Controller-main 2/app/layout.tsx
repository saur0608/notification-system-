import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/components/AuthProvider'
import { NavBar } from '@/components/NavBar'
import Sidebar from '@/components/Sidebar'
import { DeviceRestrictionWrapper } from '@/components/DeviceRestrictionWrapper'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MetaController - Industrial Machine Management',
  description: 'AI-powered digital twin platform for industrial machine monitoring and optimization',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <DeviceRestrictionWrapper>
            <NavBar />
            <div className="flex min-h-screen bg-gray-50">
              <Sidebar />
              <main className="flex-1 overflow-auto">
                {children}
              </main>
            </div>
          </DeviceRestrictionWrapper>
        </AuthProvider>
      </body>
    </html>
  )
}
