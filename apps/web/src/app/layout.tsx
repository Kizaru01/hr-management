import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { ThemeProvider } from "@/components/theme-provider";

import "./globals.css";

interface RootLayoutProps {
  children: ReactNode;
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HR Management",
  description: "HR Management System",
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script id="theme-bootstrap" strategy="beforeInteractive">
          {`let s=null;try{s=localStorage.getItem("hrms-theme:v1")}catch{}const t=s==="light"||s==="dark"?s:matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t`}
        </Script>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
