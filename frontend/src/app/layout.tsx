import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "AI 代码知识档案库",
  description: "基于 graphify 的多知识库图谱平台",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
