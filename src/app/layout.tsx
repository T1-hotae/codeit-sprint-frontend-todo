import type { Metadata } from "next";
import Header from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "do it ; todo",
  description: "할 일 목록을 관리하는 To Do 서비스",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <Header />
        {/* 반응형 컨테이너: 모바일 16px / 태블릿 24px 여백, 데스크탑 최대 1200px */}
        <main className="mx-auto max-w-[1200px] px-4 py-4 md:px-6 md:py-6">{children}</main>
      </body>
    </html>
  );
}
