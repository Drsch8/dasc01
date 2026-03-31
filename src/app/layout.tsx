import type { Metadata, Viewport } from 'next'
import { DM_Mono, Playfair_Display } from 'next/font/google'
import './globals.css'

const dmMono = DM_Mono({
  weight: ['400', '500'],
  subsets: ['latin'],
  variable: '--font-dm-mono',
})

const playfair = Playfair_Display({
  weight: ['700', '900'],
  subsets: ['latin'],
  variable: '--font-playfair',
})

export const metadata: Metadata = {
  title: 'Darts',
  description: '501/301 darts scorer with stats',
  icons: { icon: '/favicon.png' },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmMono.variable} ${playfair.variable}`}>
      <body className="font-mono bg-bg text-ink text-sm min-h-screen">{children}</body>
    </html>
  )
}
