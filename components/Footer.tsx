import Link from "next/link";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative pt-20 pb-10" style={{ background: "linear-gradient(180deg, transparent 0%, rgba(248,250,252,0.6) 20%, rgba(241,245,249,0.4) 100%)" }}>
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 lg:gap-16 mb-16">
          <div className="col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-6 group">
              <div className="w-8 h-8 bg-foreground group-hover:bg-accent rounded-sm flex items-center justify-center transition-colors">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-lg font-bold tracking-extratight text-foreground">
                Synthetix <span className="text-accent">Analytics</span>
              </span>
            </Link>
            <p className="text-muted text-sm leading-relaxed max-w-xs">
              We build advanced technology systems and enable the next generation of builders.
              Innovation driven by engineering and scalable system design.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-pro text-foreground mb-6">Navigation</h4>
            <ul className="space-y-3">
              <li><Link href="/" className="text-sm text-muted hover:text-accent transition-colors font-medium">Home</Link></li>
              <li><Link href="/services" className="text-sm text-muted hover:text-accent transition-colors font-medium">Services</Link></li>
              <li><Link href="/products" className="text-sm text-muted hover:text-accent transition-colors font-medium">Products</Link></li>
              <li><Link href="/aarkaai" className="text-sm text-muted hover:text-accent transition-colors font-medium">Aarka AI</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-pro text-foreground mb-6">Company</h4>
            <ul className="space-y-3">
              <li><Link href="/team" className="text-sm text-muted hover:text-accent transition-colors font-medium">Core Team</Link></li>
              <li><Link href="/about" className="text-sm text-muted hover:text-accent transition-colors font-medium">About Us</Link></li>
              <li><Link href="/contact" className="text-sm text-muted hover:text-accent transition-colors font-medium">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-pro text-foreground mb-6">Headquarters</h4>
            <ul className="space-y-3">
              <li className="text-sm text-muted leading-relaxed font-medium">
                Chennai, India
              </li>
              <li className="text-sm font-bold text-foreground pt-1">
                care@synthetixanalytics.com
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[11px] font-bold tracking-pro uppercase text-muted/60">
            © {currentYear} Synthetix Analytics. Institutional Grade Engineering.
          </p>
          <div className="flex gap-6">
            <Link href="#" className="text-[11px] font-bold tracking-pro uppercase text-muted/60 hover:text-accent transition-colors">Privacy</Link>
            <Link href="#" className="text-[11px] font-bold tracking-pro uppercase text-muted/60 hover:text-accent transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
