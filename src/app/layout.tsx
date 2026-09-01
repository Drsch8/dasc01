import type { Metadata, Viewport } from 'next'
import { Anton, Barlow, Barlow_Condensed } from 'next/font/google'
import './globals.css'

const anton = Anton({
  weight: ['400'],
  subsets: ['latin'],
  variable: '--font-anton',
})

const barlowCondensed = Barlow_Condensed({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-condensed',
})

const barlow = Barlow({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-barlow',
})

export const metadata: Metadata = {
  title: 'Darts',
  description: '501/301 darts scorer with stats',
  icons: {
    icon: '/favicon.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Darts',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0d0f13',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${anton.variable} ${barlowCondensed.variable} ${barlow.variable}`}>
      <body className="font-sans bg-bg text-ink text-sm min-h-screen antialiased">{children}</body>
    </html>
  )
}
