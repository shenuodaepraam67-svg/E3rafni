import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import AuthProvider from "@/components/providers/AuthProvider";

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
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1874360923595437"
          crossOrigin="anonymous"
        ></script>
      </head>
      <body className="font-sans antialiased">
        <AuthProvider>
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
