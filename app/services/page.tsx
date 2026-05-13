"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";

const ServicesPage = () => {
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

  const services = [
    {
      id: "software-engineering",
      title: "Software Engineering",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
      ),
      description: "Design and development of scalable, high-performance systems built for modern applications and enterprise environments.",
      img: "/images/service-software.png",
      tag: "ENGINEERING"
    },
    {
      id: "artificial-intelligence",
      title: "Artificial Intelligence",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
      ),
      description: "Development of intelligent systems using machine learning, data processing, and advanced automation techniques.",
      img: "/images/service-ai.png",
      tag: "INTELLIGENCE"
    },
    {
      id: "learning-intelligence",
      title: "Learning Intelligence",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
      ),
      description: "Design and delivery of structured learning systems that enable individuals and organizations to acquire skills across multiple domains and industries.",
      img: "/images/service-learning.png",
      tag: "EMPOWERMENT"
    },
    {
      id: "fintech-systems",
      title: "Fintech Systems",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="1" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
      ),
      description: "Engineering financial platforms, analytics systems, and algorithmic infrastructures for data-driven decision-making.",
      img: "/images/service-fintech.png",
      tag: "FINANCE"
    },
    {
      id: "database-engineering",
      title: "Database Engineering",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
      ),
      description: "Design of high-performance data architectures optimized for scalability, reliability, and efficiency.",
      img: "/images/service-database.png",
      tag: "INFRASTRUCTURE"
    }
  ];

  return (
    <div className="flex flex-col w-full bg-transparent min-h-screen">
      {/* Header */}
      <section className="pt-32 pb-12">
        <div className="container overflow-hidden">
          <div className="fade-up">
            <p className="section-label">SERVICES</p>
            <h1 className="hero-title">Our Services</h1>
            <p className="section-subtext">
              We deliver engineering-driven solutions designed for scalability, intelligence, and real-world impact.
            </p>
          </div>
        </div>
      </section>

      {/* Services List */}
      <section className="section">
        <div className="container text-container">
          <div className="flex flex-col gap-12">
            {services.map((service, i) => (
              <div
                key={i}
                className="fade-up bg-white/70 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/50 hover:shadow-xl transition-all duration-300 group grid md:grid-cols-2 gap-0"
                style={{ transitionDelay: `${i * 0.1}s` }}
              >
                <div className={`aspect-[5/3] md:aspect-auto overflow-hidden relative ${i % 2 !== 0 ? 'md:order-last' : ''}`}>
                  <Image 
                    src={service.img} 
                    alt={service.title} 
                    fill 
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                <div className="p-8 md:p-12 flex flex-col justify-center relative">
                  <div className="absolute top-8 right-8 text-accent/10 opacity-50 group-hover:opacity-100 transition-opacity duration-500 scale-[3] origin-top-right">
                    {service.icon}
                  </div>
                  <p className="text-[11px] font-bold text-accent uppercase tracking-pro mb-3 relative z-10">{service.tag}</p>
                  <h3 className="text-3xl font-bold text-foreground mb-4 tracking-tight relative z-10">{service.title}</h3>
                  <p className="text-muted leading-relaxed text-lg mb-8 relative z-10">{service.description}</p>
                  
                  <div className="mt-auto relative z-10">
                    <Link href={`/services/${service.id}`} className="service-link inline-flex">
                      <span>Explore Service</span>
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
            <p className="section-label">READY TO SCALE?</p>
            <h2 className="section-title">Start your project with us</h2>
            <p className="section-subtext">
              Our specialized team is ready to deliver engineering-driven solutions for your most ambitious technical challenges.
            </p>
            <div className="flex justify-center mt-10">
              <Link
                href="/contact"
                className="px-8 py-4 bg-foreground text-white font-bold rounded-sm hover:-translate-y-1 transition-all shadow-xl tracking-pro uppercase text-xs inline-block"
              >
                Schedule Consultation
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;
