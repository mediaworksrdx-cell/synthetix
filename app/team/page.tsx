"use client";

import { useEffect, Suspense } from "react";
import Link from "next/link";

const TeamPageContent = () => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("show");
        });
      },
      { threshold: 0.1 }
    );
    const elements = document.querySelectorAll(".fade-up");
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex flex-col w-full bg-transparent min-h-[80vh] relative items-center justify-center pt-32 pb-12">
      <div className="container max-w-3xl mx-auto text-center flex flex-col items-center">
        <div className="fade-up w-full flex flex-col items-center">
          <div className="w-16 h-16 mb-8 text-accent">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
            </svg>
          </div>
          <p className="section-label mb-4">THE COLLECTIVE</p>
          <h1 className="hero-title mb-6">Under Construction</h1>
          <p className="text-lg text-muted mb-10 leading-relaxed">
            We are currently updating our team directory. Check back soon to meet the minds behind our technology.
          </p>
          <Link
            href="/"
            className="px-8 py-4 bg-accent text-white font-bold rounded-sm hover:-translate-y-1 transition-all inline-block shadow-xl shadow-accent/20 tracking-pro uppercase text-xs"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default function TeamPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-32 pb-12 flex justify-center"><div className="w-8 h-8 rounded-full border-4 border-accent border-t-transparent animate-spin"></div></div>}>
      <TeamPageContent />
    </Suspense>
  );
}

