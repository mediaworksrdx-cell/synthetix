"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

const ProductsPage = () => {
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

  const products = [
    {
      category: "FINANCIAL EDUCATION PLATFORM",
      title: "Market Intelligence AI",
      description: "An advanced educational platform delivering real-time equity tracking, F&O analytics, and AI-driven market scanning to master global asset classes.",
      img: "/images/product-market-ai.png",
      link: "/products/market-intelligence"
    },
    {
      category: "COGNITIVE ENGINE",
      title: "Aarka AI (v2.2)",
      description: "An advanced, self-evolving intelligence system featuring multi-layered reasoning, visual intelligence, and global financial data integration for enterprise autonomy.",
      img: "/images/product-aarka-ai.png",
      link: "/products/aarka-ai"
    },
    {
      category: "EDUCATION SYSTEMS",
      title: "Learning Intelligence Platform",
      description: "An adaptive, AI-driven academy focused on derivatives training, complex trading concepts, and simulated performance reviews to build professional investment skills.",
      img: "/images/product-learning-ai.png",
      link: "/products/learning-intelligence"
    }
  ];

  return (
    <div className="flex flex-col w-full bg-transparent min-h-screen">
      {/* Header */}
      <section className="pt-32 pb-12">
        <div className="container overflow-hidden">
          <div className="fade-up">
            <p className="section-label">PRODUCTS & SYSTEMS</p>
            <h1 className="hero-title">Products & Systems</h1>
            <p className="section-subtext">
              We build intelligent platforms that enable data-driven decision-making, financial insight, and scalable knowledge systems.
            </p>
          </div>
        </div>
      </section>

      {/* Product Showcase */}
      <section className="section">
        <div className="container text-container">
          <div className="flex flex-col gap-16">
            {products.map((product, i) => (
              <div
                key={i}
                className="fade-up bg-white/70 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/50 hover:shadow-xl transition-all duration-300 group grid md:grid-cols-2 gap-0"
                style={{ transitionDelay: `${i * 0.1}s` }}
              >
                <div className={`aspect-[5/3] md:aspect-auto overflow-hidden relative ${i % 2 !== 0 ? 'md:order-last' : ''}`}>
                  <Image 
                    src={product.img} 
                    alt={product.title} 
                    fill 
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                    priority={i === 0}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                <div className="p-10 md:p-14 flex flex-col justify-center relative bg-gradient-to-br from-transparent to-white/40">
                  <p className="text-[11px] font-bold text-accent uppercase tracking-pro mb-3">{product.category}</p>
                  <h3 className="text-4xl font-bold text-foreground mb-6 tracking-tight">{product.title}</h3>
                  <p className="text-muted leading-relaxed text-lg mb-10">{product.description}</p>
                  
                  <div className="mt-auto">
                    <Link href={product.link} className="service-link inline-flex">
                      <span>Explore Engine</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* CTA */}
      <section className="section-alt">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center fade-up">
            <p className="section-label">THE NEXT FRONTIER</p>
            <h2 className="section-title">Explore our systems</h2>
            <p className="section-subtext">
              Ready to leverage our market intelligence and cognitive platforms? Connect with our team to explore integration options and capabilities.
            </p>
            <div className="flex justify-center mt-10">
              <Link
                href="/contact"
                className="px-8 py-4 bg-foreground text-white font-bold rounded-sm hover:-translate-y-1 transition-all shadow-xl tracking-pro uppercase text-xs inline-block"
              >
                Explore our systems
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductsPage;
