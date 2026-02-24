import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import { getSiteUrl, isProductionIndexingEnabled } from "@/lib/site";
import {
  getSiteStructuredData,
  SITE_DEFAULT_TITLE,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_NAME,
  SITE_SOCIAL_IMAGE_PATH,
} from "@/lib/seo";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const siteUrl = getSiteUrl();
const indexingEnabled = isProductionIndexingEnabled();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: SITE_DEFAULT_TITLE,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  authors: [{ name: SITE_NAME, url: siteUrl }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  manifest: "/manifest.webmanifest",
  keywords: SITE_KEYWORDS,
  openGraph: {
    type: "website",
    title: SITE_DEFAULT_TITLE,
    description: SITE_DESCRIPTION,
    siteName: SITE_NAME,
    locale: "en_US",
    images: [
      {
        url: SITE_SOCIAL_IMAGE_PATH,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} portfolio preview image`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_DEFAULT_TITLE,
    description: SITE_DESCRIPTION,
    images: [SITE_SOCIAL_IMAGE_PATH],
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
  const structuredData = getSiteStructuredData(siteUrl);

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
