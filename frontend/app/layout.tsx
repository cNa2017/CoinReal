import { Providers } from "@/components/providers";
import { WagmiSyncProvider } from "@/components/wagmi-sync-provider";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CoinReal - Crypto Community Reviews",
  description: "The first decentralized content community where users earn cryptocurrency rewards through comments and likes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased dark`}
      >
        <Providers>
          <WagmiSyncProvider>
            {children}
          </WagmiSyncProvider>
        </Providers>
      </body>
    </html>
  );
}
