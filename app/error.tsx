'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
      <p className="text-accent font-bold tracking-[0.15em] uppercase text-[11px] mb-4">ERROR</p>
      <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4" style={{ letterSpacing: '-0.02em' }}>
        Something Went Wrong
      </h1>
      <p className="text-muted text-lg mb-8 max-w-md">
        An unexpected error occurred. Our team has been notified.
      </p>
      <button
        onClick={() => reset()}
        className="px-6 py-3 bg-foreground text-white font-bold rounded-sm hover:-translate-y-0.5 transition-all shadow-lg tracking-[0.1em] uppercase text-xs cursor-pointer"
      >
        Try Again
      </button>
    </div>
  );
}
