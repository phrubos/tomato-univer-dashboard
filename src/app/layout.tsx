import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ChartPanelProvider } from "@/contexts/ChartPanelContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "🍅 Univer Dashboard",
  description: "Univer paradicsom fajtakísérlet dashboard · Univer tomato variety trial dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Alapértelmezett nyelv a magyar; a LanguageProvider a választott nyelvre állítja át
    <html lang="hu" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <LanguageProvider>
            <ChartPanelProvider>
              <AuthProvider>
                {children}
              </AuthProvider>
            </ChartPanelProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
