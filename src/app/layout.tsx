import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import NavBar from "@/components/NavBar";
import { getActiveProfile } from "@/lib/profile";
import { getTotalPoints } from "@/lib/petData";
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
  title: "学習アプリ｜漢字テスト & 百マス計算",
  description: "漢字テストと百マス計算ができる家庭学習用Webアプリ",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let activeProfile = null;
  let totalPoints = 0;
  try {
    [activeProfile, totalPoints] = await Promise.all([getActiveProfile(), getTotalPoints()]);
  } catch {
    // ログイン前やDB未接続時は無視して未選択表示にする
  }

  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-50">
        <NavBar activeProfile={activeProfile} totalPoints={totalPoints} />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
