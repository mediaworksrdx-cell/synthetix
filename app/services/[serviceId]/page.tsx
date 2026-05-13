import React, { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";

type Service = {
  id: string;
  category: string;
  title: string;
  description: string;
  fullDescription: string;
  img: string;
  features: string[];
  approach?: { title: string; description: string }[];
  lifecycle?: string[];
  sectors?: string[];
  technologies: string[];
  deliverables: string[];
  businessImpact?: string;
};

export const servicesData: Service[] = [
  {
    id: "software-engineering",
    category: "ENGINEERING",
    title: "Software Engineering",
    description: "Design and development of scalable, high-performance systems built for modern applications and enterprise environments.",
    fullDescription: "Our Software Engineering division delivers enterprise-grade systems engineered for scalability, resilience, and long-term business value. We design and build high-performance platforms capable of handling extreme concurrency, large-scale data processing, and mission-critical operations with near-zero downtime. Every solution is aligned with strategic business objectives and built to operate as a core digital asset.",
    img: "/images/service-software.png",
    features: [
      "Custom Enterprise Architecture",
      "High-Concurrency Systems",
      "Microservices & API Engineering",
      "Legacy System Modernization",
      "Distributed Systems Development",
      "Cloud-Native Infrastructure"
    ],
    approach: [
      { title: "Architecture Excellence", description: "We adopt domain-driven design and microservices architecture to ensure modular, scalable, and maintainable systems. Event-driven patterns enable real-time processing and seamless system communication." },
      { title: "Scalability & Performance", description: "Systems are engineered for horizontal scalability with optimized performance, ensuring low latency and high throughput under heavy workloads." },
      { title: "Reliability & Availability", description: "Multi-region deployments, fault-tolerant design, and automated failover mechanisms ensure continuous system availability." },
      { title: "Security & Compliance", description: "Security is embedded at every layer with encryption, identity management, and compliance-ready frameworks aligned with global standards." },
      { title: "Observability & Monitoring", description: "Full-stack observability with real-time metrics, logging, and distributed tracing enables proactive system management and rapid incident resolution." }
    ],
    lifecycle: [
      "Product & Requirement Analysis",
      "System Architecture & Design",
      "Scalable Implementation",
      "Automated Testing & Validation",
      "CI/CD Pipeline Integration",
      "Deployment & Production Monitoring"
    ],
    technologies: [
      "React / Next.js", "Node.js / Python / Java / Kotlin", "Go / Rust", "PostgreSQL / Redis / Cassandra", "Kafka / RabbitMQ", "AWS / Azure / GCP / Kubernetes"
    ],
    deliverables: [
      "Production-ready codebase",
      "Scalable architecture documentation",
      "Deployment pipelines (CI/CD)",
      "Monitoring and observability setup",
      "Security and compliance implementation"
    ],
    businessImpact: "Our engineering solutions enable organizations to build robust digital platforms, accelerate product delivery, reduce operational costs, and achieve sustainable growth through technology-driven innovation."
  },
  {
    id: "artificial-intelligence",
    category: "INTELLIGENCE",
    title: "Artificial Intelligence",
    description: "Development of intelligent systems using machine learning, data processing, and advanced automation techniques.",
    fullDescription: "Our Artificial Intelligence division delivers enterprise-grade cognitive systems that transform raw data into actionable intelligence. We design, train, and deploy advanced AI models that integrate directly into business workflows, enabling automation, predictive decision-making, and real-time insights at scale. Every solution is built with a focus on accuracy, security, and production reliability.",
    img: "/images/service-ai.png",
    features: [
      "Custom LLM Deployment",
      "Retrieval-Augmented Generation (RAG) Systems",
      "Knowledge Graph Engineering",
      "Intelligent OCR & Document Processing",
      "Predictive Analytics & Forecasting Models",
      "Autonomous AI Agents"
    ],
    approach: [
      { title: "Model Architecture & Optimization", description: "We develop and fine-tune large language models and machine learning systems tailored to specific enterprise use cases, ensuring high accuracy and domain relevance." },
      { title: "Data-Centric AI", description: "Structured and unstructured data pipelines are engineered for quality, consistency, and scalability, forming the foundation of reliable AI systems." },
      { title: "RAG & Contextual Intelligence", description: "We implement retrieval-augmented pipelines and vector search systems to deliver context-aware, real-time responses using enterprise data." },
      { title: "Scalability & Deployment", description: "AI systems are deployed with scalable infrastructure, optimized inference, and low-latency performance for production environments." },
      { title: "Security & Data Governance", description: "Strict data isolation, encryption, and compliance frameworks ensure full control over sensitive enterprise information." }
    ],
    lifecycle: [
      "Use Case Definition & Data Assessment",
      "Model Selection & Architecture Design",
      "Data Preparation & Training",
      "Fine-Tuning & Optimization",
      "Evaluation & Validation",
      "Deployment & Monitoring"
    ],
    technologies: [
      "TensorFlow", "PyTorch", "Hugging Face", "FAISS", "Pinecone", "Intel OpenVINO", "Python"
    ],
    deliverables: [
      "Trained and fine-tuned models",
      "Production-ready API endpoints",
      "RAG pipelines and retrieval systems",
      "Model evaluation and performance metrics",
      "Integration with enterprise systems"
    ],
    businessImpact: "Our AI solutions enable organizations to automate complex processes, enhance decision-making, unlock insights from data, and build intelligent systems that drive measurable business outcomes at scale."
  },
  {
    id: "learning-intelligence",
    category: "EMPOWERMENT",
    title: "Learning Intelligence",
    description: "Design and delivery of structured learning systems that enable individuals and organizations to acquire skills across multiple domains and industries.",
    fullDescription: "Our Learning Intelligence division delivers comprehensive, multi-sector learning solutions designed to develop practical skills across industries. We provide structured, outcome-driven programs that combine foundational knowledge with real-world application, enabling individuals and organizations to build capabilities across diverse domains.",
    img: "/images/service-learning.png",
    features: [
      "Multi-Sector Professional Training Programs",
      "Industry-Specific Curriculum Development",
      "Workforce Skill Development",
      "Corporate Training & Upskilling",
      "Certification & Competency Programs",
      "Executive Leadership Programs"
    ],
    approach: [
      { title: "Industry-Aligned Learning", description: "Curriculum is designed to match real-world requirements across multiple sectors, ensuring relevance and applicability." },
      { title: "Practical & Applied Training", description: "Hands-on learning, case studies, and real-world scenarios to ensure execution-level understanding." },
      { title: "Structured Progression", description: "Clear pathways from basic to advanced levels across different industries." },
      { title: "Performance Measurement", description: "Continuous evaluation, skill tracking, and competency validation." },
      { title: "Scalable Delivery", description: "Training programs designed for individuals, institutions, and enterprise workforce development." }
    ],
    lifecycle: [
      "Training Needs Analysis & Assessment",
      "Curriculum & Content Design",
      "Learning Platform Integration",
      "Pilot Program Implementation",
      "Feedback Collection & Refinement",
      "Full-Scale Rollout & Certification"
    ],
    sectors: [
      "Technology & Engineering",
      "Finance & Business Management",
      "Healthcare & Life Sciences",
      "Manufacturing & Industrial Operations",
      "Retail & E-commerce",
      "Logistics & Supply Chain",
      "Energy & Infrastructure",
      "Education & Research"
    ],
    technologies: [
      "Digital Learning Platforms (LMS)",
      "Real-Time Analytics & Assessment Systems",
      "Simulation & Training Environments",
      "AI-Driven Personalization Systems",
      "Data & Reporting Tools"
    ],
    deliverables: [
      "Customized training programs",
      "Industry-specific learning modules",
      "Assessment and certification systems",
      "Performance analytics dashboards",
      "Scalable training infrastructure"
    ],
    businessImpact: "Our programs enable individuals and organizations to build cross-industry expertise, improve workforce productivity, and achieve measurable skill advancement aligned with evolving market demands."
  },
  {
    id: "fintech-systems",
    category: "FINANCE",
    title: "Fintech Systems",
    description: "Engineering financial platforms, analytics systems, and algorithmic infrastructures for data-driven decision-making.",
    fullDescription: "Our Fintech Systems division delivers high-performance financial infrastructure engineered for institutional-grade requirements. We design and build ultra-low latency systems, high-throughput transaction platforms, and secure financial architectures capable of operating at scale in real-time market environments. Every solution is optimized for speed, precision, and regulatory compliance.",
    img: "/images/service-fintech.png",
    features: [
      "Algorithmic Trading Infrastructure",
      "High-Frequency Data Processing Systems",
      "Secure Payment & Transaction Platforms",
      "Quantitative Analysis & Modeling Systems",
      "Distributed Financial Systems & Ledger Technologies",
      "Risk Management & Compliance Systems"
    ],
    approach: [
      { title: "Low-Latency Architecture", description: "Systems are optimized for sub-millisecond execution, ensuring minimal delay in high-frequency trading and transaction processing." },
      { title: "High Throughput Systems", description: "Designed to handle massive volumes of transactions and data streams without performance degradation." },
      { title: "Security & Cryptography", description: "Advanced encryption, secure protocols, and compliance frameworks ensure data integrity and financial security." },
      { title: "Scalability & Reliability", description: "Distributed systems with fault tolerance and horizontal scalability to maintain uninterrupted financial operations." },
      { title: "Data Precision & Integrity", description: "Accurate, real-time data processing with strict validation and audit mechanisms." }
    ],
    lifecycle: [
      "Financial Requirement Analysis",
      "System Architecture & Latency Modeling",
      "High-Performance Implementation",
      "Testing (Latency, Load, Security)",
      "Deployment & Monitoring",
      "Continuous Optimization"
    ],
    technologies: [
      "WebSockets", "FIX Protocol", "Blockchain", "Smart Contracts", "Redis", "TimescaleDB", "Kubernetes Clusters", "C++", "Java", "Python", "Go"
    ],
    deliverables: [
      "Live trading environments",
      "Secure API and exchange integrations",
      "Audited financial architectures",
      "High-performance data pipelines",
      "Monitoring and risk management systems"
    ],
    businessImpact: "Our fintech solutions enable financial institutions to execute trades faster, process transactions securely, manage risk effectively, and operate with high efficiency in competitive, real-time markets."
  },
  {
    id: "database-engineering",
    category: "INFRASTRUCTURE",
    title: "Database Engineering",
    description: "Design of high-performance data architectures optimized for scalability, reliability, and efficiency.",
    fullDescription: "Our Database Engineering division delivers high-performance data infrastructure designed for scalability, reliability, and real-time intelligence. We architect and optimize distributed data systems capable of handling massive volumes of structured and unstructured data, enabling enterprises to ingest, process, and analyze information with high efficiency and minimal latency.",
    img: "/images/service-database.png",
    features: [
      "Distributed Data Architecture Design",
      "Real-Time Data Streaming Systems",
      "Query Optimization & Performance Tuning",
      "Data Lake & Warehouse Engineering",
      "Disaster Recovery & High Availability Systems",
      "NoSQL & Graph Database Solutions"
    ],
    approach: [
      { title: "Scalable Data Architecture", description: "We design distributed database systems that support horizontal scaling and high availability across multiple regions." },
      { title: "Real-Time Data Processing", description: "Streaming pipelines enable continuous data ingestion and processing for time-sensitive applications." },
      { title: "Performance Optimization", description: "Advanced indexing, query tuning, and storage optimization ensure minimal latency and high throughput." },
      { title: "Data Reliability & Recovery", description: "Fault-tolerant systems with automated backups and disaster recovery mechanisms ensure data integrity." },
      { title: "Data Governance & Security", description: "Access control, encryption, and compliance-ready architectures protect sensitive data assets." }
    ],
    lifecycle: [
      "Data Requirement Analysis",
      "Schema & Architecture Design",
      "Pipeline Development & Integration",
      "Performance Optimization",
      "Testing & Validation",
      "Deployment & Monitoring"
    ],
    technologies: [
      "PostgreSQL", "CockroachDB", "MongoDB", "Cassandra", "Apache Kafka", "Apache Spark", "Snowflake", "BigQuery", "Distributed Cloud Environments"
    ],
    deliverables: [
      "Optimized database schemas",
      "Scalable data architectures",
      "Real-time streaming pipelines",
      "Migration and transformation scripts",
      "Backup, recovery, and monitoring systems"
    ],
    businessImpact: "Our database solutions enable organizations to manage large-scale data efficiently, improve query performance, ensure data reliability, and build a strong foundation for analytics, AI, and business intelligence systems."
  }
];

export function generateStaticParams() {
  return servicesData.map((service) => ({
    serviceId: service.id,
  }));
}

export default async function ServicePage({ params }: { params: Promise<{ serviceId: string }> }) {
  const resolvedParams = await params;
  const service = servicesData.find((s) => s.id === resolvedParams.serviceId);

  if (!service) {
    notFound();
  }

  return (
    <div className="flex flex-col w-full bg-transparent min-h-screen relative">
      <section className="pt-32 pb-24">
        <div className="container max-w-5xl mx-auto px-4">
          
          <Link href="/services" className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-accent transition-colors mb-12">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            Back to Services
          </Link>

          <div className="relative bg-white/95 backdrop-blur-2xl border border-white/60 shadow-2xl rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            {/* Close Button */}
            <Link 
              href="/services"
              className="absolute top-6 right-6 w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors z-10"
              aria-label="Close service view"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </Link>

            <div className="grid md:grid-cols-[1fr_1.5fr] gap-0">
              {/* Left Column: Image & Quick Info */}
              <div className="bg-slate-50 p-8 md:p-12 border-r border-slate-200 flex flex-col items-center md:items-start text-center md:text-left pt-16 md:pt-12">
                <div className="w-full aspect-[4/3] rounded-xl overflow-hidden shadow-lg mb-8 border border-white relative">
                  <Image
                    src={service.img}
                    alt={service.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent" />
                </div>
                
                <p className="text-xs font-bold text-accent uppercase tracking-pro mb-3">{service.category}</p>
                <h1 className="text-3xl font-bold text-foreground mb-6 leading-tight tracking-tight">{service.title}</h1>
                
                <div className="w-full mt-auto space-y-6">
                  <div>
                    <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-2">Primary Deliverables</p>
                    <ul className="space-y-2">
                      {service.deliverables.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <svg className="w-4 h-4 text-accent shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-sm font-medium text-foreground leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="pt-6 border-t border-slate-200 mt-6">
                    <Link
                      href="/contact"
                      className="px-6 py-3 bg-foreground text-white font-bold rounded-sm hover:-translate-y-1 transition-all shadow-xl tracking-pro uppercase text-xs inline-block w-full text-center"
                    >
                      Discuss Your Project
                    </Link>
                  </div>
                </div>
              </div>

              {/* Right Column: Deep Description & Features */}
              <div className="p-8 md:p-14 pt-16 md:pt-14">
                <h3 className="text-xl font-bold text-foreground mb-4">Overview</h3>
                <p className="text-muted leading-relaxed mb-12 text-lg">
                  {service.fullDescription}
                </p>

                <div className="mb-12">
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-pro mb-5 text-accent">Core Solutions</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {service.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-3 bg-slate-50 border border-slate-100 p-3 rounded-lg">
                        <svg className="w-5 h-5 text-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span className="text-sm font-semibold text-foreground/80">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {service.approach && (
                  <div className="mb-12">
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-pro mb-5 text-accent">Engineering Approach</h3>
                    <div className="space-y-6">
                      {service.approach.map((item, i) => (
                        <div key={i}>
                          <h4 className="text-base font-bold text-foreground mb-1">{item.title}</h4>
                          <p className="text-sm text-muted leading-relaxed">{item.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {service.lifecycle && (
                  <div className="mb-12">
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-pro mb-5 text-accent">Development Lifecycle</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4">
                      {service.lifecycle.map((step, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <span className="flex shrink-0 items-center justify-center w-8 h-8 rounded-full bg-accent/10 text-accent text-sm font-bold border border-accent/20">
                            {i + 1}
                          </span>
                          <span className="text-sm font-medium text-foreground leading-tight">{step}</span>
                          {(i + 1) % 3 !== 0 && i < service.lifecycle!.length - 1 && (
                            <svg className="w-4 h-4 text-muted/50 ml-auto hidden md:block shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                          )}
                          {(i + 1) % 2 !== 0 && i < service.lifecycle!.length - 1 && (
                            <svg className="w-4 h-4 text-muted/50 ml-auto hidden sm:block md:hidden shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {service.sectors && (
                  <div className="mb-12">
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-pro mb-5 text-accent">Sectors Covered</h3>
                    <div className="flex flex-wrap gap-2">
                      {service.sectors.map((sector, i) => (
                        <span 
                          key={i} 
                          className="px-4 py-2 bg-slate-50 text-foreground text-sm font-semibold rounded-md border border-slate-200 shadow-sm"
                        >
                          {sector}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mb-12">
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-pro mb-5 text-accent">Technologies</h3>
                  <div className="flex flex-wrap gap-2">
                    {service.technologies.map((tech, i) => (
                      <span 
                        key={i} 
                        className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-md border border-slate-200"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {service.businessImpact && (
                  <div>
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-pro mb-5 text-accent">Business Impact</h3>
                    <div className="bg-gradient-to-br from-slate-50 to-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-accent"></div>
                      <p className="text-base text-foreground font-medium leading-relaxed italic">
                        "{service.businessImpact}"
                      </p>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
