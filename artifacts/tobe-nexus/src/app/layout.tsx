import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "TOBE-Nexus | AI 成交戰略系統",
  description: "商業總部的 AI 戰略樞紐 — 專為房產仲介設計的物件管理與 AI 文案生成系統",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body className="flex min-h-screen bg-titanium-800">
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-screen overflow-hidden bg-titanium-800">
          {children}
        </div>
      </body>
    </html>
  );
}
