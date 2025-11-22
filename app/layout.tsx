import type React from "react"
import type { Metadata } from "next"
import { VT323, Courier_Prime, Special_Elite, Mrs_Saint_Delafield } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const vt323 = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-screen",
})

// English Fonts
const courier = Courier_Prime({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-en-courier",
})

const specialElite = Special_Elite({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-en-rough",
})

const mrsSaintDelafield = Mrs_Saint_Delafield({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-en-script",
})

export const metadata: Metadata = {
  title: "Gemini Fax Beeper",
  description: "A retro typewriter and pager experience",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Ma+Shan+Zheng&family=Noto+Sans+SC:wght@400;700&family=Noto+Serif+SC:wght@400;700&family=Zhi+Mang+Xing&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${vt323.variable} ${courier.variable} ${specialElite.variable} ${mrsSaintDelafield.variable} antialiased bg-gray-100 overflow-hidden`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  )
}
