import './globals.css'
import { ModalProvider } from '@/contexts/ModalContext'

export const metadata = {
  title: 'NoHarm - Sustainable Technology Solutions',
  description: 'Connect with climate tech solutions and sustainable partnerships.',
  icons: {
    icon: '/images/logos/new-favicon.png',
  },
};

export const viewport = { //For Next.js 13.4/14+, viewport needs to be exported separately
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className="antialiased">
        <ModalProvider>
          {children}
        </ModalProvider>
      </body>
    </html>
  )
}

