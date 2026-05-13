"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

const AboutPage = () => {
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

  const [activeSlide, setActiveSlide] = useState(0);

  const slides = [
    {
      label: "OUR VISION",
      title: "To build the foundation for next-generation human capability.",
      description: "To engineer intelligence systems and learning architectures that redefine how individuals engage with complexity, develop expertise, and execute at scale. It establishes a high-performance environment where capability is not incidental but systematically developed, where knowledge is operationalized into action, and where individuals are equipped to perform with clarity, precision, and impact. By aligning intelligence, infrastructure, and continuous development, it creates a model for sustained excellence, enabling individuals and organizations to consistently adapt, lead, and deliver outcomes in rapidly evolving, high-complexity environments.",
    },
    {
      label: "OUR MISSION",
      title: "A universe where every mind builds, grows, and creates without limits.",
      description: "Architected through a unified intelligence layer, scalable infrastructure, and continuous development systems, this establishes an environment where ideas are systematically converted into high-impact, scalable outcomes. It embeds continuous advancement, precision-driven execution, and structured innovation at scale—ensuring performance remains consistent in complex and rapidly evolving environments. By eliminating friction across access, knowledge, and creation, it unlocks compounded capability growth, drives measurable results, and defines a future built on intelligence, scale, and execution discipline.",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 8000); // 8 seconds per slide for high-end readability

    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="flex flex-col w-full bg-transparent min-h-screen">
      {/* Banner Section */}
      <section className="relative w-full pt-20">
        <div className="group w-full aspect-[24/9] md:aspect-[36/9] relative overflow-hidden bg-transparent">
          {/* Loop Mode Video Placeholder Background — Transparent & Blended */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#F59E0B]/5 via-transparent to-[#FDE68A]/5 z-0" />
          
          <Image 
             src="/images/about-mission.png" 
             alt="About Us Banner" 
             fill 
             className="object-cover opacity-[0.18] mix-blend-darken group-hover:scale-110 transition-transform duration-[10000ms] ease-linear"
             priority 
          />

          {/* Depth Overlays — Blending to Page Background */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
          
          {/* Subtle tech patterns */}
          <div className="absolute inset-0 opacity-10 mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] z-10" />
        </div>
      </section>

      {/* Interactive Mission/Vision Slider Section */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto">
            {/* Slide Navigation Controls */}
            <div className="flex items-center justify-between mb-12 fade-up">
              <button 
                onClick={() => setActiveSlide(prev => (prev === 0 ? slides.length - 1 : prev - 1))}
                className="w-12 h-12 rounded-full border border-foreground/10 flex items-center justify-center hover:bg-foreground hover:text-white transition-all group"
                aria-label="Previous slide"
              >
                <span className="group-hover:-translate-x-1 transition-transform">←</span>
              </button>

              <div className="flex gap-4">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveSlide(i)}
                    className={`h-1 transition-all duration-500 rounded-full ${activeSlide === i ? 'w-12 bg-accent' : 'w-4 bg-foreground/10'}`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>

              <button 
                onClick={() => setActiveSlide(prev => (prev === slides.length - 1 ? 0 : prev + 1))}
                className="w-12 h-12 rounded-full border border-foreground/10 flex items-center justify-center hover:bg-foreground hover:text-white transition-all group"
                aria-label="Next slide"
              >
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>

            {/* Active Slide Content */}
            <div className="relative min-h-[400px] md:min-h-[350px]">
              {slides.map((slide, index) => (
                <div 
                  key={index}
                  className={`absolute inset-0 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${
                    activeSlide === index 
                      ? 'opacity-100 translate-x-0 scale-100 pointer-events-auto' 
                      : index < activeSlide 
                        ? 'opacity-0 -translate-x-20 scale-95 pointer-events-none' 
                        : 'opacity-0 translate-x-20 scale-95 pointer-events-none'
                  }`}
                >
                  <p className="section-label mb-6">{slide.label}</p>
                  <h2 className="hero-title font-dm-serif text-5xl md:text-6xl leading-[1.1] mb-14 gradient-text pb-4 tracking-tight">
                    {slide.title}
                  </h2>
                  <p className="section-subtext !text-foreground !max-w-none text-lg leading-relaxed">
                    {slide.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Background Accent for depth */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] aspect-video bg-gradient-to-tr from-accent/5 via-transparent to-accent/5 blur-3xl opacity-30 -z-10 pointer-events-none" />
      </section>

      <div className="section-divider mt-12" />

      {/* Philosophy Section */}
      <section className="section-alt">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div className="fade-up">
              <p className="section-label gradient-text !text-xs !font-bold">PHILOSOPHY</p>
              <h2 className="section-title">Architectural Integrity.</h2>
              <p className="service-desc mt-4">
                We believe that the most powerful systems are those built with absolute technical clarity. Our approach merges the speed of a high-growth startup with the disciplined rigor of an institutional-grade engineering firm.
              </p>
            </div>
            <div className="fade-up" style={{ transitionDelay: "0.2s" }}>
              <p className="section-label gradient-text !text-xs !font-bold">EXECUTION</p>
              <h2 className="section-title">Deterministic Impact.</h2>
              <p className="service-desc mt-4">
                Our delivery model is centered on verifiable outcomes. We don&apos;t just deliver code; we deliver measurable technical advantages that allow our institutional partners to outperform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="section">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="fade-up">
              <div className="img-placeholder aspect-[4/3] relative group">
                <Image
                  src="/images/about-values.png"
                  alt="Values visualization"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
              </div>
            </div>
            <div className="fade-up" style={{ transitionDelay: "0.15s" }}>
              <p className="section-label gradient-text !text-xs !font-bold">VALUES</p>
              <h2 className="section-title">Precision. Scale. Integrity.</h2>
              <p className="service-desc mt-4">
                Every line of code we ship carries the weight of institutional trust. We optimize for long-term systemic health, not short-term shipping velocity.
              </p>
              <div className="mt-8 space-y-4">
                {["Technical Excellence", "Client-First Engineering", "Radical Transparency"].map((val, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
                    <span className="text-sm font-semibold text-foreground">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* Team CTA Section */}
      <section className="section-alt">
        <div className="container">
          <div className="max-w-3xl fade-up">
            <p className="section-label gradient-text !text-xs !font-bold">THE COLLECTIVE</p>
            <h2 className="section-title">Intelligence Driven by Talent.</h2>
            <p className="section-subtext">
              Behind every specialized system is a collective of engineers moving the needle. Meet the architects and data scientists building the future of Synthetix.
            </p>
            <Link
              href="/team"
              className="px-8 py-4 bg-foreground text-white font-bold rounded-sm hover:-translate-y-1 transition-all shadow-xl tracking-pro uppercase text-xs inline-block"
            >
              Meet the Core Team
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
