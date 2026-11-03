import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://lendloop-two.vercel.app"),
  title: "LendLoop — Neighborhood Tool Lending Board",
  description:
    "Borrow what you need. Lend what you don't. Community-first tool sharing with automated workflows.",
  applicationName: "LendLoop",
  openGraph: {
    title: "LendLoop — Neighborhood Tool Lending Board",
    description:
      "Borrow what you need. Lend what you don't. Community-first tool sharing with automated workflows.",
    url: "https://lendloop-two.vercel.app",
    siteName: "LendLoop",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "LendLoop — Neighborhood Tool Lending Board",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LendLoop — Neighborhood Tool Lending Board",
    description:
      "Borrow what you need. Lend what you don't. Community-first tool sharing with automated workflows.",
    images: ["/twitter-image.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "LendLoop",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/Logo.png", sizes: "500x500", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#151311",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col font-sans bg-background text-foreground"
        suppressHydrationWarning
      >
        <Providers>
          {children}
          <Toaster position="bottom-right" richColors />
        </Providers>
      </body>
    </html>
  );
}
