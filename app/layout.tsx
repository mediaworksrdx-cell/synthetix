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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sora.variable} ${inter.variable} ${outfit.variable} ${dmSerif.variable}`}>
      <body className="font-inter text-foreground flex flex-col min-h-screen">
        {/* Animated background orbs */}
        <div className="bg-orb bg-orb-1" aria-hidden="true" />
        <div className="bg-orb bg-orb-2" aria-hidden="true" />
        <div className="bg-orb bg-orb-3" aria-hidden="true" />

        {/* Particles */}
        <div className="particles" aria-hidden="true">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${5 + i * 4.5}%`,
                animationDuration: `${10 + (i % 6) * 3}s`,
                animationDelay: `${i * 0.8}s`,
                width: `${2 + (i % 4)}px`,
                height: `${2 + (i % 4)}px`,
              }}
            />
          ))}
        </div>

        <Navbar />
        <main className="flex-grow pt-[112px]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
