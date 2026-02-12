import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Ayu Koene",
  description: "Creator Designer Engineer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className}>
      <body
        className="min-h-screen antialiased flex flex-col bg-theme text-gray-900 dark:text-white"
        data-theme="light"
      >
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
