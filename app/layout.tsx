import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// ─── Fonts ──────────────────────────────────────────────
// Next.js auto-hosts Google Fonts at build time (no external requests).
// We load them as CSS variables so any component can use them
// via font-family: var(--font-geist-sans) without importing anything.
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ─── Metadata ───────────────────────────────────────────
// Static metadata for the root layout. Child pages can override
// via their own `metadata` export or `generateMetadata()` function.
// The `template` pattern appends " | MeDashboard" to child titles.
export const metadata: Metadata = {
  title: {
    default: "MeDashboard",
    template: "%s | MeDashboard",
  },
  description:
    "Personal dashboard for notes, finances, calendar, and YouTube — built with Next.js and Supabase.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MeDashboard",
  },
  icons: {
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0d1117",
};

// ─── Root Layout ────────────────────────────────────────
// This is the ONLY layout that renders <html> and <body>.
// It wraps ALL pages (auth + dashboard) and provides fonts.
// The {children} here will be either:
//   - (auth)/layout.tsx  → for /login, /register
//   - (dashboard)/layout.tsx → for /notes, /finances, etc.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
