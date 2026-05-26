"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

const ContactPage = () => {
  const [submitted, setSubmitted] = useState(false);
  const [captchaCode, setCaptchaCode] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaError, setCaptchaError] = useState("");

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateCaptcha = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
    setCaptchaInput("");
    setCaptchaError("");
  };

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
    generateCaptcha();
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!captchaCode || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear and draw background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Premium background gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "rgba(241, 245, 249, 0.95)");
    gradient.addColorStop(1, "rgba(226, 232, 240, 0.95)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw background noise lines
    for (let i = 0; i < 6; i++) {
      ctx.strokeStyle = `rgba(15, 23, 42, ${0.08 + Math.random() * 0.1})`;
      ctx.lineWidth = 1 + Math.random() * 1.5;
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }

    // Draw background noise dots
    for (let i = 0; i < 45; i++) {
      ctx.fillStyle = `rgba(15, 23, 42, ${0.05 + Math.random() * 0.1})`;
      ctx.beginPath();
      ctx.arc(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        1 + Math.random() * 1.5,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // Draw characters
    const charArray = captchaCode.split("");
    const charWidth = canvas.width / (charArray.length + 1);
    
    ctx.font = "bold 24px 'Courier New', monospace";
    ctx.textBaseline = "middle";

    charArray.forEach((char, index) => {
      ctx.save();
      // Calculate position
      const x = charWidth * (index + 0.8) + (Math.random() - 0.5) * 5;
      const y = canvas.height / 2 + (Math.random() - 0.5) * 8;
      
      // Calculate rotation and scale
      const angle = ((Math.random() - 0.5) * 25 * Math.PI) / 180;
      ctx.translate(x, y);
      ctx.rotate(angle);
      
      // Shadow effect for realism
      ctx.shadowColor = "rgba(0, 0, 0, 0.15)";
      ctx.shadowBlur = 2;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;

      // Premium text color (shades of slate/blue/indigo)
      const colors = ["#0f172a", "#1e293b", "#334155", "#475569", "#2563eb", "#4f46e5"];
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      
      ctx.fillText(char, 0, 0);
      ctx.restore();
    });
  }, [captchaCode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (captchaInput.toUpperCase() !== captchaCode) {
      setCaptchaError("Incorrect captcha code. Please try again.");
      generateCaptcha();
      return;
    }
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

                  {/* Visual Captcha Security */}
                  <div className="space-y-3 p-4 bg-gray-50/50 backdrop-blur-sm border border-gray-200/50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block">
                        Verification Security
                      </label>
                      <span className="text-[10px] text-accent font-bold uppercase tracking-wider">Required</span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 items-center">
                      <div className="relative flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden shrink-0">
                        <canvas
                          ref={canvasRef}
                          width={150}
                          height={46}
                          className="block cursor-pointer"
                          onClick={generateCaptcha}
                          title="Click to refresh captcha"
                        />
                        <button
                          type="button"
                          onClick={generateCaptcha}
                          className="p-3 text-gray-400 hover:text-foreground hover:bg-gray-100 transition-colors border-l border-gray-100"
                          title="Refresh verification code"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="animate-spin-hover"
                          >
                            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                          </svg>
                        </button>
                      </div>
                      <div className="w-full">
                        <input
                          required
                          type="text"
                          value={captchaInput}
                          onChange={(e) => {
                            setCaptchaInput(e.target.value);
                            if (captchaError) setCaptchaError("");
                          }}
                          className={`w-full bg-white/70 backdrop-blur-sm border p-3 rounded-lg focus:border-accent outline-none transition-colors text-sm uppercase font-mono tracking-wider ${
                            captchaError ? "border-red-400 focus:border-red-500 bg-red-50/20" : "border-white/50"
                          }`}
                          placeholder="ENTER CODE"
                          maxLength={6}
                          autoComplete="off"
                          autoCorrect="off"
                          autoCapitalize="off"
                          spellCheck="false"
                        />
                      </div>
                    </div>
                    {captchaError && (
                      <p className="text-xs text-red-500 font-bold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        {captchaError}
                      </p>
                    )}
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
                  care@synthetixanalytics.com<br />
                  +91 8838202279
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
