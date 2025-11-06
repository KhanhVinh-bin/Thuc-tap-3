import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { CartProvider } from "@/lib/cart-context"
import { AuthProvider } from "@/lib/auth-context"
import "./globals.css"

export const metadata = {
  title: "EduLearn - Nền tảng học trực tuyến",
  description: "Khám phá hàng nghìn khóa học chất lượng cao từ các chuyên gia hàng đầu",
  generator: "EduLearn",
}

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <AuthProvider>
          <CartProvider>
            <Suspense fallback={null}>
              {children}
              <Analytics />
            </Suspense>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
