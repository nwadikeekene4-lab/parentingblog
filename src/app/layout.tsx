import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://parentingblog-76yt.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: "Parenting Together",
    template: "%s | Parenting Together",
  },

  description:
    "Parenting Together is a community where parents share real parenting stories, experiences, lessons and advice to help families grow together.",

  alternates: {
    canonical: "/",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Parenting Together",
    title: "Parenting Together",
    description:
      "Real parenting stories, experiences and advice shared by parents to help families grow together.",
    locale: "en_US",
  },

  twitter: {
    card: "summary_large_image",
    title: "Parenting Together",
    description:
      "Real parenting stories, experiences and advice shared by parents to help families grow together.",
  },
};

const websiteStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Parenting Together",
  url: siteUrl,
  description:
    "A community where parents share real parenting stories, experiences, lessons and advice.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link
          rel="preload"
          href="/images/brazilian-people-celebrating-easter.jpg"
          as="image"
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteStructuredData),
          }}
        />
      </head>

      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
  }
