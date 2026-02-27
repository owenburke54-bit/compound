import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/lib/context";
import { AddNoteProvider } from "@/lib/addNoteContext";
import BottomNav from "@/components/BottomNav";
import AddNoteFAB from "@/components/AddNoteFAB";
import OnboardingOverlay from "@/components/OnboardingOverlay";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL
  ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  : "https://compound.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "Compound — Personal Knowledge Base",
  description: "Capture thoughts, organize by topic. Local-first, AI optional. Built with Next.js + IndexedDB + OpenAI.",
  openGraph: {
    title: "Compound — Personal Knowledge Base",
    description: "Capture thoughts, organize by topic. Local-first, AI optional.",
    type: "website",
    images: ["/icons/icon-512.svg"],
  },
  icons: {
    icon: "/icons/icon-192.svg",
    apple: "/icons/icon-192.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Compound" />
        <link rel="apple-touch-icon" href="/icons/icon-192.svg" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-900 text-slate-100 min-h-screen w-full overflow-x-hidden`}
      >
        <AppProvider>
          <AddNoteProvider>
            <div className="min-h-screen w-full bg-slate-900 flex flex-col">
              <main className="flex-1 w-full pb-20 safe-area-pb max-w-2xl mx-auto w-full">{children}</main>
              <BottomNav />
              <AddNoteFAB />
              <OnboardingOverlay />
            </div>
          </AddNoteProvider>
        </AppProvider>
      </body>
    </html>
  );
}
