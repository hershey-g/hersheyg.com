import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import DemoCallCTA from "@/components/DemoCallCTA";
import "./globals.css";

const inter = localFont({
  src: "../fonts/inter-latin-wght-normal.woff2",
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = localFont({
  src: "../fonts/jetbrains-mono-latin-wght-normal.woff2",
  variable: "--font-jetbrains",
  display: "optional",
});

export const viewport: Viewport = {};

export const metadata: Metadata = {
  metadataBase: new URL("https://hersheyg.com"),
  title: "Hershey Goldberger",
  description:
    "Agentic AI systems and full-stack products. Production-grade. One engineer.",
  keywords: [
    "agentic AI",
    "AI engineer",
    "full-stack developer",
    "autonomous agents",
    "production AI systems",
    "Hershey Goldberger",
  ],
  authors: [{ name: "Hershey Goldberger" }],
  creator: "Hershey Goldberger",
  robots: { index: true, follow: true },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Hershey Goldberger",
    description:
      "Agentic AI systems and full-stack products. Production-grade. One engineer.",
    url: "https://hersheyg.com",
    siteName: "Hershey Goldberger",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hershey Goldberger",
    description:
      "Agentic AI systems and full-stack products. Production-grade. One engineer.",
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} bg-bg text-text antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: "Hershey Goldberger",
              url: "https://hersheyg.com",
              jobTitle: "AI Engineer & Full-Stack Developer",
              description:
                "Agentic AI systems and full-stack products. Production-grade. One engineer.",
            }),
          }}
        />
        {children}
        <Analytics />
        <DemoCallCTA />
      </body>
    </html>
  );
}
