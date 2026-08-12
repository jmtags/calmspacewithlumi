import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import { AnalyticsTracker } from "./analytics-tracker";
import "./globals.css";

const sans = DM_Sans({ variable: "--font-sans", subsets: ["latin"] });
const serif = Fraunces({ variable: "--font-serif", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CalmSpace — A Gentle Place to Pause",
  description: "A free, private mental wellness companion for calming, reflection, and gentler days.",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
  other: { "codex-preview": "development" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${sans.variable} ${serif.variable}`}>{children}<AnalyticsTracker /></body></html>;
}
