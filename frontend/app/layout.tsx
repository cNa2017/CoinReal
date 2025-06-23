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
  title: "CoinReal - 币圈大众点评",
  description: "首个让用户通过评论与点赞即可赚取加密货币奖励的去中心化内容社区",
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
