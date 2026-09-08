import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AuthProvider from "@/components/providers/AuthProvider";

const cairo = localFont({
  src: [
    {
      path: "../fonts/Cairo-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/Cairo-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../fonts/Cairo-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--font-cairo",
});

export const metadata: Metadata = {
  title: "اعرفني - E3rafni",
  description: "منصة لإنشاء الاختبارات الشخصية",
  metadataBase: new URL('https://e3rafni.vercel.app'),
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    title: "اعرفني - E3rafni",
    description: "منصة لإنشاء الاختبارات الشخصية",
    url: 'https://e3rafni.vercel.app',
    siteName: 'اعرفني',
    locale: 'ar_AR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'اعرفني - E3rafni',
    description: 'منصة لإنشاء الاختبارات الشخصية',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1874360923595437"
          crossOrigin="anonymous"
        ></script>
      </head>
      <body className={`${cairo.variable} font-sans antialiased flex flex-col min-h-screen`}>
        <AuthProvider>
          <Navbar />
          <div className="flex-grow">
            {children}
          </div>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
