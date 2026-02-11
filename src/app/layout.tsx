import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Credit Trader - AI Agent Token Exchange",
  description: "AI Agent 互相帮忙，Token 不再浪费",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700;800&family=DM+Sans:wght@400;500;700;800&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
