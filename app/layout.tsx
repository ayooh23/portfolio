import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import { getSiteUrl, isProductionIndexingEnabled } from "@/lib/site";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const siteUrl = getSiteUrl();
const siteName = "Ayu Koene";
const siteDescription =
  "Strategic designer with a background in mechanical engineering, digital design, and brand strategy.";
const indexingEnabled = isProductionIndexingEnabled();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} | Strategic Designer`,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  applicationName: siteName,
  alternates: {
    canonical: "/",
  },
  keywords: [
    "Ayu Koene",
    "Strategic Designer",
    "Service Design",
    "Product Design",
    "Innovation",
    "Portfolio",
  ],
  openGraph: {
    type: "website",
    url: "/",
    title: `${siteName} | Strategic Designer`,
    description: siteDescription,
    siteName,
    images: [
      {
        url: "/Fav_AYOOH.jpg",
        width: 1200,
        height: 630,
        alt: "Portrait of Ayu Koene",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} | Strategic Designer`,
    description: siteDescription,
    images: ["/Fav_AYOOH.jpg"],
  },
  icons: {
    icon: "/fav_ayooh.png",
    shortcut: "/fav_ayooh.png",
    apple: "/fav_ayooh.png",
  },
  robots: {
    index: indexingEnabled,
    follow: indexingEnabled,
    googleBot: {
      index: indexingEnabled,
      follow: indexingEnabled,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "portfolio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        name: "Ayu Koene",
        url: siteUrl,
        image: `${siteUrl}/images/ayu.jpg`,
        jobTitle: "Strategic Designer",
        sameAs: [
          "https://nl.linkedin.com/in/ayu-koene-55b63718a",
          "https://www.instagram.com/ayukoene?igsh=YWxpdG5tZHZ5MjA0&utm_source=qr",
        ],
      },
      {
        "@type": "WebSite",
        name: siteName,
        url: siteUrl,
        inLanguage: "en",
      },
    ],
  };

  return (
    <html lang="en" className={inter.variable}>
      <body
        className={`${inter.className} min-h-screen antialiased flex flex-col bg-theme text-gray-900 dark:text-white`}
        data-theme="light"
      >
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
