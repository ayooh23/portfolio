import type { Metadata } from "next";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";

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
    <html lang="en" className="__variable_3e085d __variable_06a85b">
      <body
        className="min-h-screen antialiased flex flex-col bg-theme text-gray-900 dark:text-white"
        data-theme="light"
      >
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
