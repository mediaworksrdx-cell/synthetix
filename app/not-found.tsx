import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
      <p className="text-accent font-bold tracking-[0.15em] uppercase text-[11px] mb-4">404</p>
      <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4" style={{ letterSpacing: '-0.02em' }}>
        Page Not Found
      </h1>
      <p className="text-muted text-lg mb-8 max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-foreground text-white font-bold rounded-sm hover:-translate-y-0.5 transition-all shadow-lg tracking-[0.1em] uppercase text-xs"
      >
        Back to Home
      </Link>
    </div>
  );
}
