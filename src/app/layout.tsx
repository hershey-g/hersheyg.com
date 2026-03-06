import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

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
      </body>
    </html>
  );
}
