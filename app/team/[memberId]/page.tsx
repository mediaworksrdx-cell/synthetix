import Link from "next/link";
import { notFound } from "next/navigation";

// Reuse member data type
type TeamMember = {
  id: string;
  name: string;
  role: string;
  bio: string;
  fullBio: string;
  expertise: string[];
  education: string;
  initials: string;
  color: string;
};

// Same data as page.tsx (ideally this should be in a shared lib/data file, but defined here for simplicity of the dynamic route)
const members: TeamMember[] = [
  { id: "siddharth", name: "Siddharth Gupta", role: "CEO & Founder", bio: "Visionary leader with a background in high-frequency trading systems and enterprise AI integration.", fullBio: "Siddharth brings over 15 years of experience architecting high-frequency trading platforms and extreme-scale enterprise data systems. Before founding Synthetix Analytics, he led the core engineering group at a top-tier quantitative hedge fund, overseeing the transition to deep-learning-based algorithmic execution. His vision is built on the belief that institutional-grade engineering should dictate the future of applied intelligence.", expertise: ["System Architecture", "Algorithmic Trading", "Enterprise AI Strategy", "Distributed Compute"], education: "M.S. Computer Science, Stanford University", initials: "SG", color: "F59E0B" },
  { id: "arjun", name: "Arjun Mehta", role: "Chief Architect", bio: "Specialist in distributed systems and scalable cloud infrastructure for massive institutional data.", fullBio: "Arjun is the technical force behind Synthetix's core infrastructure. A specialist in distributed systems, he spent a decade engineering petabyte-scale cloud storage layers and fault-tolerant microservice architectures for global cloud providers. He ensures that every Synthetix platform maintains 99.999% uptime with rigid latency guarantees.", expertise: ["Distributed Systems", "Cloud Infrastructure (K8s, AWS)", "High-Availability Architecture", "Rust/C++ Backend Systems"], education: "Ph.D. Distributed Computing, MIT", initials: "AM", color: "3B82F6" },
  { id: "sarah", name: "Sarah Chen", role: "Head of AI", bio: "Expert in LLM fine-tuning and vector database architectures for semantic search solutions.", fullBio: "Sarah leads the Cognitive Engine division, focusing directly on the boundaries of large language models and neural search. Her previous research centered on optimizing transformer inference speed and reducing hallucination vectors in financial modeling AI. She architected the reasoning protocols driving Aarka AI.", expertise: ["Large Language Models", "Vector Search / RAG Networks", "Machine Learning Optimization", "Quantitative Modeling"], education: "M.S. Artificial Intelligence, Carnegie Mellon", initials: "SC", color: "8B5CF6" },
  { id: "michael", name: "Michael Ross", role: "Fintech Lead", bio: "Senior engineer focusing on secure payment protocols and transaction processing reliability.", fullBio: "Michael's expertise lies at the intersection of cryptography, security, and financial transaction processing. He has designed clearing infrastructure used by Tier 1 banks to handle millions of transactions per second. At Synthetix, he oversees the integrity and immutability of our financial engineering products.", expertise: ["Transaction Processing Engineering", "Cryptography", "Financial Protocols (FIX/SWIFT)", "Low-Latency Networks"], education: "B.S. Mathematics & Computer Science, University of Waterloo", initials: "MR", color: "22D3EE" },
  { id: "elena", name: "Elena Volkov", role: "Data Scientist", bio: "Leading predictive modeling and quantitative analysis for financial forecasting products.", fullBio: "Elena is a quantitative researcher bridging the gap between abstract mathematics and real-world market application. She specializes in time-series forecasting, anomaly detection, and stochastic modeling. Her predictive algorithms form the backbone of the Market Intelligence platform.", expertise: ["Time-Series Analysis", "Stochastic Calculus", "Predictive Forecasting", "Python / R Ecosystems"], education: "Ph.D. Applied Mathematics, Cambridge University", initials: "EV", color: "F43F5E" },
  { id: "david", name: "David Park", role: "Product Engineer", bio: "Bridges the gap between complex backend engineering and world-class user experiences.", fullBio: "David combines a deep understanding of complex data systems with a relentless focus on human-computer interaction. He creates the sleek, deterministic, and highly responsive front-end applications that allow users to harness Synthetix's immense backend power without friction.", expertise: ["React / Next.js Ecosystems", "WebGL / Data Visualization", "User Experience Engineering", "State Management at Scale"], education: "B.F.A. Interactive Media / B.S. Computer Science, RISD & Brown", initials: "DP", color: "34D399" },
  { id: "priya", name: "Priya Sharma", role: "Security Architect", bio: "Ensuring every system we build meets the highest standards of institutional security and compliance.", fullBio: "Priya is charged with modeling active threats and building impenetrable defenses. With a background in offensive security and penetration testing for defense contractors, she treats every Synthetix deployment as a zero-trust environment, ensuring total data sovereignty for our clients.", expertise: ["Zero-Trust Architecture", "Penetration Testing", "Compliance (SOC2 / ISO27001)", "Vulnerability Analysis"], education: "M.S. Cybersecurity, Georgia Tech", initials: "PS", color: "F97316" },
  { id: "james", name: "James Wilson", role: "Operations Lead", bio: "Master of technical deployment and reliable infrastructure management in multi-cloud environments.", fullBio: "James orchestrates the complex dance of continuous integration and continuous deployment across diverse global infrastructures. He brings extreme automation to the DevOps cycle, allowing Synthetix to ship robust updates dynamically without ever disrupting client operations.", expertise: ["CI/CD Automation", "Infrastructure as Code (Terraform)", "Site Reliability Engineering", "Multi-Cloud strategy"], education: "B.S. Information Systems, University of Texas", initials: "JW", color: "06B6D4" },
];

export function generateStaticParams() {
  return members.map((member) => ({
    memberId: member.id,
  }));
}

export default async function MemberPage({ params }: { params: Promise<{ memberId: string }> }) {
  const resolvedParams = await params;
  const member = members.find((m) => m.id === resolvedParams.memberId);

  if (!member) {
    notFound();
  }

  return (
    <div className="flex flex-col w-full bg-transparent min-h-screen relative">
      <section className="pt-32 pb-24">
        <div className="container max-w-4xl mx-auto px-4">
          
          <Link href="/team" className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-accent transition-colors mb-12">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            Back to Team
          </Link>

          <div className="relative bg-white/95 backdrop-blur-2xl border border-white/60 shadow-2xl rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            {/* Close Button */}
            <Link 
              href="/team"
              className="absolute top-6 right-6 w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors z-10"
              aria-label="Close profile"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </Link>

            <div className="grid md:grid-cols-[1fr_2fr] gap-0">
              {/* Left Column: Image & Quick Stats */}
              <div className="bg-slate-50 p-8 md:p-10 border-r border-slate-200 flex flex-col items-center md:items-start text-center md:text-left pt-16 md:pt-10">
                <div className="w-32 h-32 md:w-48 md:h-48 rounded-2xl overflow-hidden shadow-lg mb-6 shrink-0 border border-white">
                  <img
                    src={`https://placehold.co/400x400/${member.color}/ffffff?text=${member.initials}&font=inter`}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <p className="text-xs font-bold text-accent uppercase tracking-pro mb-2">{member.role}</p>
                <h1 className="text-2xl font-bold text-foreground mb-6">{member.name}</h1>
                
                <div className="w-full mt-auto space-y-4">
                  <div>
                    <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Education</p>
                    <p className="text-sm font-semibold text-foreground">{member.education}</p>
                  </div>
                </div>
              </div>

              {/* Right Column: Deep Bio & Expertise */}
              <div className="p-8 md:p-12 pt-16 md:pt-12">
                <h3 className="text-xl font-bold text-foreground mb-4">Biography</h3>
                <p className="text-muted leading-relaxed mb-10">
                  {member.fullBio}
                </p>

                <h3 className="text-lg font-bold text-foreground mb-4">Core Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {member.expertise.map((skill, i) => (
                    <span 
                      key={i} 
                      className="px-4 py-2 bg-[#FFF7ED] text-[#D97706] text-xs font-bold uppercase tracking-wider rounded-md border border-[#FDE68A]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
