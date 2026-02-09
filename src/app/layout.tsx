import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Credit Trader - SecondMe",
  description: "基于 SecondMe 的个人信息与智能对话平台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
