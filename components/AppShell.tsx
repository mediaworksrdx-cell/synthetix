"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ClaudeAarkaaAI from "@/components/ClaudeAarkaaAI";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [isAarkaaDomain, setIsAarkaaDomain] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname.toLowerCase();
      if (hostname.includes("aarka-ai") || hostname.includes("aarkaai")) {
        setIsAarkaaDomain(true);
        document.title = "Aarkaa AI 2.0 | Autonomous Intelligence System";
      }
    }
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  if (isAarkaaDomain) {
    return <ClaudeAarkaaAI />;
  }

  return (
    <>
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
      <main className="flex-grow pt-24 md:pt-28">{children}</main>
      <Footer />
    </>
  );
}
