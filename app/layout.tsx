import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '台灣空氣品質監測',
  description: '即時空氣品質資訊與歷史記錄查詢',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW">
      <body>{children}</body>
    </html>
  )
}
