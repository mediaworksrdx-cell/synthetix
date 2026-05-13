"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const Navbar = () => {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Services", href: "/services" },
    { name: "Products", href: "/products" },
    { name: "Aarka AI", href: "/aarkaai" },
    { name: "Core Team", href: "/team" },
    { name: "About Us", href: "/about" },
    { name: "Contact Us", href: "/contact" },
  ];

  const marqueeServices = [
    "Software Engineering",
    "•",
    "Artificial Intelligence",
    "•",
    "Learning Intelligence",
    "•",
    "Fintech Systems",
    "•",
    "Database Engineering",
    "•",
    "Cloud Infrastructure",
    "•",
    "Market Analytics",
    "•"
  ];

  return (
    <nav
      className={`fixed top-0 z-50 w-full transition-all duration-500 ${
        scrolled
          ? "bg-white/95 backdrop-blur-2xl shadow-lg shadow-black/[0.03] border-b border-white/60"
          : "bg-white/80 backdrop-blur-xl border-b border-transparent"
      }`}
    >
      <div className="container h-[72px] flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 bg-foreground rounded-lg flex items-center justify-center overflow-hidden transition-all duration-400 group-hover:rounded-xl group-hover:shadow-lg group-hover:shadow-accent/20">
            <span className="text-white font-bold text-xl relative z-10">S</span>
            <div className="absolute inset-0 bg-accent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-foreground leading-tight">
              Synthetix
            </span>
            <span className="text-[10px] font-semibold tracking-pro uppercase text-accent leading-tight">
              Analytics
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`relative px-4 py-2 text-[11px] font-bold tracking-pro uppercase rounded-lg transition-all duration-300 ${
                  isActive
                    ? "text-accent bg-accent/8"
                    : "text-muted hover:text-foreground hover:bg-foreground/[0.04]"
                }`}
              >
                {link.name}
                {isActive && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-accent rounded-full" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Mobile Toggle */}
        <button
          className="lg:hidden p-2.5 rounded-lg text-foreground hover:bg-foreground/5 transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {mobileOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="7" y2="7" />
                <line x1="4" x2="20" y1="17" y2="17" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-400 ${
          mobileOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-white/80 backdrop-blur-2xl px-6 py-5 space-y-1 border-t border-gray-100/50">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-3 text-sm font-bold tracking-pro uppercase rounded-lg transition-all ${
                  isActive
                    ? "text-accent bg-accent/8"
                    : "text-muted hover:text-foreground hover:bg-foreground/5"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Infinite Services Ribbon */}
      <div className={`w-full overflow-hidden whitespace-nowrap flex items-center py-2.5 transition-colors duration-500 border-t relative z-40 ${scrolled ? 'bg-white/95 backdrop-blur-xl border-white/60' : 'bg-transparent border-white/10'}`}>
        <div className="animate-marquee flex gap-8 md:gap-14 shrink-0 px-4 items-center">
          {/* Double map for seamless infinite loop */}
          {[...marqueeServices, ...marqueeServices].map((service, index) => (
            <span 
              key={index} 
              className={service === "•" ? "text-accent text-sm" : "text-[11px] font-bold tracking-pro uppercase text-foreground/80"}
            >
              {service}
            </span>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
