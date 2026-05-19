import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "AI Code Knowledge Archive",
  description: "Multi-KB knowledge platform powered by graphify",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
