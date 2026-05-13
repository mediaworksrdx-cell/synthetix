"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

const Home = () => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll(".fade-up");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex flex-col w-full bg-transparent overflow-hidden">
      {/* ═══ Hero Section ═══ */}
      <section className="relative pt-32 pb-20">
        <div className="container relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="fade-up">
              <p className="section-label">SYNTHETIX ANALYTICS</p>
              <h1 className="hero-title">
                Engineering Systems.<br />
                Artificial Intelligence.<br />
                <span className="gradient-text">Technology Innovation.</span>
              </h1>
              <p className="section-subtext">
                We build advanced technology systems and enable the next generation of builders.
              </p>
              <div className="flex flex-wrap gap-6 items-center">
                <Link
                  href="/services"
                  className="btn-primary px-8 py-4 bg-foreground text-white font-bold rounded-sm hover:-translate-y-1 transition-all shadow-xl tracking-pro uppercase text-xs"
                >
                  Explore Capabilities
                </Link>
                <Link href="/contact" className="service-link">
                  <span>Start Building</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </Link>
              </div>
            </div>

            <div className="fade-up" style={{ transitionDelay: "0.2s" }}>
              <div className="img-placeholder aspect-[4/3] relative group">
                <Image
                  src="/images/hero-abstract.png"
                  alt="Abstract technology visualization"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ═══ Impact Section ═══ */}
      <section className="section-alt">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="fade-up">
              <div className="img-placeholder aspect-[4/3] relative">
                <Image
                  src="/images/impact-abstract.png"
                  alt="Global impact and interconnected systems"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div className="fade-up" style={{ transitionDelay: "0.15s" }}>
              <p className="section-label">IMPACT</p>
              <h2 className="section-title">We are creating more than products — we are creating impact.</h2>
              <p className="service-desc">
                Our organization is dedicated to delivering enterprise-grade technology and institutional knowledge to individuals and businesses ready to build the future. Through a unique blend of software development and empowerment, we bridge innovation and accessibility.
              </p>
              <Link href="/about" className="service-link mt-4">
                <span>Learn More</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Vision Section ═══ */}
      <section className="section">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="fade-up" style={{ transitionDelay: "0.15s" }}>
              <p className="section-label">VISION</p>
              <h2 className="section-title">The future belongs to those who build.</h2>
              <p className="service-desc">
                We exist to place the full force of modern technology and knowledge into the hands of people ready to create, innovate, and lead. We are building a global wave of creators and systems that transform industries.
              </p>
              <Link href="/about" className="service-link mt-4">
                <span>Our Philosophy</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </Link>
            </div>
            <div className="fade-up" style={{ transitionDelay: "0.2s" }}>
              <div className="img-placeholder aspect-[4/3] relative">
                <Image
                  src="/images/vision-abstract.png"
                  alt="Futuristic vision of innovation"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ═══ What We Do ═══ */}
      <section className="section-alt">
        <div className="container">
          <div className="fade-up mb-12">
            <p className="section-label">WHAT WE DO</p>
            <h2 className="section-title">Core Capabilities.</h2>
          </div>

          <div className="services-grid">
            {[
              { title: "Software Engineering", desc: "Designing resilient, scalable systems that serve as the backbone for modern digital enterprise operations.", icon: "M16 18l6-6-6-6M8 6l-6 6 6 6" },
              { title: "Artificial Intelligence", desc: "Custom AI agents and predictive models designed for deep integration into institutional workflows.", icon: "M12 2a10 10 0 110 20 10 10 0 010-20zm0 4a6 6 0 100 12 6 6 0 000-12z" },
              { title: "Learning Intelligence", desc: "Knowledge-powered systems that educate, upskill, and empower the next generation of builders.", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
              { title: "Fintech Systems", desc: "High-concurrency payment architectures and financial infrastructure built for absolute reliability.", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6m8 0V9a2 2 0 012-2h2a2 2 0 012 2v10m6 0v-4a2 2 0 00-2-2h-2a2 2 0 00-2 2v4" }
            ].map((capability, i) => (
              <div key={i} className="service-card fade-up" style={{ transitionDelay: `${i * 0.1}s` }}>
                <div className="service-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={capability.icon}/></svg>
                </div>
                <div className="service-content">
                  <h3 className="service-title">{capability.title}</h3>
                  <p className="service-desc">{capability.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ How We Work ═══ */}
      <section className="section">
        <div className="container">
          <div className="fade-up mb-12">
            <p className="section-label">HOW WE WORK</p>
            <h2 className="section-title">Our Approach.</h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { title: "Engineering-first", desc: "Every solution begins with rigorous engineering discipline and architectural excellence.", num: "01" },
              { title: "Solution-driven", desc: "We solve real challenges — not chase trends. Every product starts from a genuine need.", num: "02" },
              { title: "Knowledge-led", desc: "Deep institutional knowledge guides every decision, every architecture, every deployment.", num: "03" },
              { title: "Continuous Innovation", desc: "We evolve relentlessly — refining, optimizing, and pushing the boundary of what's possible.", num: "04" },
            ].map((item, i) => (
              <div key={i} className="fade-up" style={{ transitionDelay: `${i * 0.1}s` }}>
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/50 hover:-translate-y-2 hover:shadow-xl transition-all duration-300 h-full">
                  <p className="text-accent font-bold text-3xl mb-4" style={{ letterSpacing: "-0.03em" }}>{item.num}</p>
                  <h3 className="service-title">{item.title}</h3>
                  <p className="service-desc mt-2">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ═══ Products Preview ═══ */}
      <section className="section-alt">
        <div className="container">
          <div className="fade-up mb-12">
            <p className="section-label">PRODUCT ECOSYSTEM</p>
            <h2 className="section-title">Technology That Delivers.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "AI Platforms", tag: "INTELLIGENCE", img: "/images/products-ai.png" },
              { title: "Data Systems", tag: "SCALE", img: "/images/products-data.png" },
              { title: "Backend Infrastructure", tag: "RELIABILITY", img: "/images/products-backend.png" },
            ].map((product, i) => (
              <div key={i} className="fade-up bg-white/70 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/50 hover:-translate-y-2 hover:shadow-xl transition-all duration-300 group" style={{ transitionDelay: `${i * 0.1}s` }}>
                <div className="aspect-[5/3] overflow-hidden relative">
                  <Image src={product.img} alt={product.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-6">
                  <p className="text-[11px] font-bold text-accent uppercase tracking-pro mb-1">{product.tag}</p>
                  <h3 className="service-title">{product.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Aarka AI Preview ═══ */}
      <section className="section">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="fade-up">
              <div className="img-placeholder aspect-[4/3] relative">
                <Image
                  src="/images/aarka-ai-preview.png"
                  alt="Aarka AI intelligence system"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div className="fade-up" style={{ transitionDelay: "0.15s" }}>
              <p className="section-label">AARKA AI</p>
              <h2 className="section-title">An Evolving Intelligence System.</h2>
              <p className="service-desc">
                Aarka AI is our proprietary intelligence engine — built for enterprise-scale operations, continuous learning, and mission-critical reliability. It represents the next frontier in applied artificial intelligence.
              </p>
              <Link href="/aarkaai" className="service-link mt-4">
                <span>Explore Aarka AI</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CTA Section ═══ */}
      <section className="section-dark">
        <div className="container relative z-10">
          <div className="max-w-2xl mx-auto text-center fade-up">
            <p className="text-accent font-bold tracking-pro uppercase text-[11px] mb-6">GET STARTED</p>
            <h2 className="text-white text-4xl font-bold mb-8" style={{ letterSpacing: "-0.02em" }}>Start Building With Us</h2>
            <p className="text-lg text-white/60 mb-10 leading-relaxed">
              Whether you&apos;re building the next breakthrough product or transforming your enterprise — we&apos;re ready to partner with you.
            </p>
            <Link
              href="/contact"
              className="px-8 py-4 bg-accent text-white font-bold rounded-sm hover:brightness-110 transition-all inline-block shadow-xl shadow-accent/20 tracking-pro uppercase text-xs"
            >
              Start Building With Us
            </Link>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-accent/5 skew-x-12 translate-x-1/4"></div>
      </section>
    </div>
  );
};

export default Home;
