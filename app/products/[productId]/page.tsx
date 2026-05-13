import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";

type Product = {
  id: string;
  category: string;
  title: string;
  description: string;
  fullDescription: string;
  img: string;
  features: string[];
  capabilities: string[];
  idealFor: string;
};

export const productsData: Product[] = [
  {
    id: "market-intelligence",
    category: "FINANCIAL EDUCATION PLATFORM",
    title: "Market Intelligence AI",
    description: "An advanced educational platform delivering real-time equity tracking, F&O analytics, and AI-driven market scanning to master global asset classes.",
    fullDescription: "Market Intelligence AI is a comprehensive institutional-grade educational platform bridging the gap between theory and live markets. It provides hands-on learning through real-time equity tracking, augmented by an F&O Intelligence Hub featuring live Options Greeks and an advanced Strategy Builder with payoff simulation. The proprietary AI Scanner actively identifies Smart Money Concepts (SMC) and Fair Value Gaps, offering an unparalleled academy environment where learners can continually refine their edge using live market data and specialized AI performance reviews.",
    img: "/images/product-market-ai.png",
    features: ["Real-time Equity & Crypto Tracking", "Advanced F&O Strategy Builder", "Smart Money Concept (SMC) AI Scanner", "Interactive Academy & Learning"],
    capabilities: ["Live Options Chain & Greeks", "Payoff Simulation Engine", "Fair Value Gap Detection", "Simulated Performance Reviews"],
    idealFor: "Aspiring Quant Traders, Retail Investors, Financial Education Institutions"
  },
  {
    id: "aarka-ai",
    category: "COGNITIVE ENGINE",
    title: "Aarka AI (v2.2)",
    description: "An advanced, self-evolving intelligence system featuring multi-layered reasoning, visual intelligence, and global financial data integration for enterprise autonomy.",
    fullDescription: "Aarka AI represents a paradigm shift in applied cognitive systems. Built upon a proprietary Hierarchical Decision Funnel, it guarantees high-speed, zero-hallucination responses tailored for professional environments. Beyond standard language processing, Aarka acts as an autonomous agent capable of multimodal visual research—instantly recognizing factual realities from images and documents via intelligent optical recognition. It features a dedicated finance fast-path for real-time global market intelligence and a self-evolving neural ranking system that actively distills verified facts into a secure, strictly isolated knowledge base that adapts to your professional ecosystem over time.",
    img: "/images/product-aarka-ai.png",
    features: ["Hierarchical Decision Funnel", "Multimodal Visual Intelligence", "Global Financial Data Integration", "Self-Evolving Knowledge Distillation"],
    capabilities: ["Zero-Hallucination Constraints", "Intelligent Image & Text Analysis", "Real-Time Asset & Forex Tracking", "Strictly Isolated Data Silos"],
    idealFor: "Quantitative Analysts, Institutional Researchers, High-Security Enterprise Teams"
  },
  {
    id: "learning-intelligence",
    category: "EDUCATION SYSTEMS",
    title: "Learning Intelligence Platform",
    description: "An adaptive, AI-driven academy focused on derivatives training, complex trading concepts, and simulated performance reviews to build professional investment skills.",
    fullDescription: "The Learning Intelligence Platform democratizes access to institutional-grade financial knowledge through a deeply personalized academy experience. Designed to bridge the gap between theory and execution, it features highly interactive derivatives training modules covering everything from basic fundamentals to advanced multi-leg strategies and Options Greeks. The platform leverages simulated trading environments and specialized AI to provide real-time, data-driven performance reviews, ensuring learners can continually refine their edge before entering live markets.",
    img: "/images/product-learning-ai.png",
    features: ["Interactive Derivatives Training", "AI-Driven Performance Reviews", "Dynamic Strategy Simulations", "Adaptive Learning Pathways"],
    capabilities: ["Personalized AI Tutors", "Simulated Strategy Outcomes", "Options & Greeks Curriculum", "Market Mechanics Sandbox"],
    idealFor: "Aspiring Quant Traders, Retail Investors, Financial Education Institutions"
  }
];

export function generateStaticParams() {
  return productsData.map((product) => ({
    productId: product.id,
  }));
}

export default async function ProductPage({ params }: { params: Promise<{ productId: string }> }) {
  const resolvedParams = await params;
  const product = productsData.find((p) => p.id === resolvedParams.productId);

  if (!product) {
    notFound();
  }

  return (
    <div className="flex flex-col w-full bg-transparent min-h-screen relative">
      <section className="pt-32 pb-24">
        <div className="container max-w-5xl mx-auto px-4">
          
          <Link href="/products" className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-accent transition-colors mb-12">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            Back to Products
          </Link>

          <div className="relative bg-white/95 backdrop-blur-2xl border border-white/60 shadow-2xl rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            {/* Close Button */}
            <Link 
              href="/products"
              className="absolute top-6 right-6 w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors z-10"
              aria-label="Close product view"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </Link>

            <div className="grid md:grid-cols-[1fr_1.5fr] gap-0">
              {/* Left Column: Image & Quick Info */}
              <div className="bg-slate-50 p-8 md:p-12 border-r border-slate-200 flex flex-col items-center md:items-start text-center md:text-left pt-16 md:pt-12">
                <div className="w-full aspect-[4/3] rounded-xl overflow-hidden shadow-lg mb-8 border border-white relative">
                  <Image
                    src={product.img}
                    alt={product.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent" />
                </div>
                
                <p className="text-xs font-bold text-accent uppercase tracking-pro mb-3">{product.category}</p>
                <h1 className="text-3xl font-bold text-foreground mb-6 leading-tight tracking-tight">{product.title}</h1>
                
                <div className="w-full mt-auto space-y-6">
                  <div>
                    <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-2">Ideal For</p>
                    <p className="text-sm font-medium text-foreground leading-relaxed">{product.idealFor}</p>
                  </div>
                  
                  {product.id === "aarka-ai" && (
                     <div>
                       <Link
                         href="/aarkaai"
                         className="px-6 py-3 bg-foreground text-white font-bold rounded-sm hover:-translate-y-1 transition-all shadow-xl tracking-pro uppercase text-xs inline-block w-full text-center mt-4"
                       >
                         View Aarka AI Portal
                       </Link>
                     </div>
                  )}
                </div>
              </div>

              {/* Right Column: Deep Description & Features */}
              <div className="p-8 md:p-14 pt-16 md:pt-14">
                <h3 className="text-xl font-bold text-foreground mb-4">System Overview</h3>
                <p className="text-muted leading-relaxed mb-12 text-lg">
                  {product.fullDescription}
                </p>

                <div className="mb-12">
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-pro mb-5 text-accent">Core Features</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {product.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-accent shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm font-semibold text-foreground/80">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-pro mb-5 text-accent">Technical Capabilities</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.capabilities.map((tech, i) => (
                      <span 
                        key={i} 
                        className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-md border border-slate-200"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
