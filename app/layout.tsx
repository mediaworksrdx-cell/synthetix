import type { Metadata } from "next";
import { Sora, Inter, Outfit, DM_Serif_Display } from "next/font/google";
import "./globals.css";
import "./chat.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  weight: ["400", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600"],
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["400", "500", "600", "700"],
});

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  variable: "--font-dm-serif",
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Synthetix Analytics | Engineering Systems. AI. Innovation.",
  description: "We build advanced technology systems and enable the next generation of builders.",
};

import AppShell from "@/components/AppShell";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sora.variable} ${inter.variable} ${outfit.variable} ${dmSerif.variable}`}>
      <body className="font-inter text-foreground flex flex-col min-h-screen">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
