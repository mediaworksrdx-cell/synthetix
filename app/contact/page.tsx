"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const ContactPage = () => {
  const [submitted, setSubmitted] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="flex flex-col w-full bg-transparent min-h-screen">
      {/* Hero Section */}
      <section className="pt-32 pb-12">
        <div className="container">
          <div className="fade-up">
            <p className="section-label">GET IN TOUCH</p>
            <h1 className="hero-title">Initiate the Dialogue.</h1>
            <p className="section-subtext">
              Our team of specialized engineers and strategists is ready to discuss your next technical challenge.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Grid */}
      <section className="section">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            {/* Form */}
            <div className="fade-up">
              {submitted ? (
                <div className="p-10 border border-accent/30 rounded-xl bg-accent/5 backdrop-blur-sm">
                  <h3 className="text-2xl font-bold mb-4" style={{ letterSpacing: "-0.02em" }}>Transmission Received.</h3>
                  <p className="text-muted leading-relaxed">
                    Our lead architect will review your technical requirements and contact you within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Full Name</label>
                      <input
                        required
                        type="text"
                        className="w-full bg-white/70 backdrop-blur-sm border border-white/50 p-4 rounded-lg focus:border-accent outline-none transition-colors text-sm"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Email Address</label>
                      <input
                        required
                        type="email"
                        className="w-full bg-white/70 backdrop-blur-sm border border-white/50 p-4 rounded-lg focus:border-accent outline-none transition-colors text-sm"
                        placeholder="john@enterprise.com"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Company</label>
                    <input
                      type="text"
                      className="w-full bg-white/70 backdrop-blur-sm border border-white/50 p-4 rounded-lg focus:border-accent outline-none transition-colors text-sm"
                      placeholder="Acme Corp"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Message</label>
                    <textarea
                      required
                      rows={5}
                      className="w-full bg-white/70 backdrop-blur-sm border border-white/50 p-4 rounded-lg focus:border-accent outline-none transition-colors text-sm resize-none"
                      placeholder="Describe your technical requirements..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-4 bg-foreground text-white font-bold rounded-lg hover:-translate-y-1 transition-all shadow-xl tracking-pro uppercase text-xs"
                  >
                    Send Message
                  </button>
                </form>
              )}
            </div>

            {/* Info */}
            <div className="fade-up space-y-12" style={{ transitionDelay: "0.2s" }}>
              <div>
                <p className="section-label">CHENNAI — HQ</p>
                <p className="text-xl font-bold mb-2" style={{ letterSpacing: "-0.02em" }}>Technological Core</p>
                <p className="text-muted text-sm leading-relaxed">
                  Chennai, Tamil Nadu<br />
                  India
                </p>
              </div>
              <div>
                <p className="section-label">DIRECT CONTACT</p>
                <p className="text-xl font-bold mb-2" style={{ letterSpacing: "-0.02em" }}>Always Synched</p>
                <p className="text-muted text-sm leading-relaxed">
                  partnership@synthetix.ai<br />
                  +91 44 2345 6789
                </p>
              </div>
              <div className="p-6 bg-white/50 backdrop-blur-sm border border-white/50 rounded-xl">
                <p className="text-xs font-bold text-accent uppercase tracking-pro mb-3">Security Notice</p>
                <p className="text-xs text-muted leading-relaxed">
                  All communications are encrypted using bank-grade protocols. Your data is isolated according to institutional privacy standards.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="h-[400px] w-full grayscale hover:grayscale-0 opacity-40 hover:opacity-100 transition-all duration-1000">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d124411.58192891824!2d80.14831569726563!3d13.047985999999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a5265ea4f7d3361%3A0x6e61a70b6863d433!2sChennai%2C%20Tamil%20Nadu%2C%20India!5e0!3m2!1sen!2sin!4v1711036000000!5m2!1sen!2sin"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
        ></iframe>
      </section>
    </div>
  );
};

export default ContactPage;
