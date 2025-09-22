import './globals.css'
import { Inter } from 'next/font/google'
import { AnalyticsProvider } from './components/AnalyticsProvider'
import { PerformanceProvider } from './components/PerformanceProvider'
import AdminAccess from './components/AdminAccess'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'NC Resilience Platform',
  description: 'North Carolina Small Business & Agriculture Resilience Intelligence Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AnalyticsProvider>
          <PerformanceProvider>
            <div className="min-h-screen bg-gray-50">
              {children}
              <AdminAccess />
            </div>
          </PerformanceProvider>
        </AnalyticsProvider>
      </body>
    </html>
  )
}