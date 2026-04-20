import type { Metadata } from "next";
import "./globals.css";
import ConditionalLayout from "@/components/ConditionalLayout";

export const metadata: Metadata = {
  title: "TOBE Nexus | AI 成交戰略系統",
  description: "TOBE-Nexus Business AI Hub — 專為地產仲介設計的案件管理與 AI 文案生成系統",
  other: {
    google: "notranslate",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body className="flex min-h-screen bg-titanium-800">
        <ConditionalLayout>{children}</ConditionalLayout>
      </body>
    </html>
  );
}
