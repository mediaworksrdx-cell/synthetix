export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-8 h-8 border-2 border-foreground/20 border-t-accent rounded-full"
          style={{ animation: 'spin 0.8s linear infinite' }}
        />
        <p className="text-muted text-sm font-medium tracking-wide">Loading...</p>
      </div>
    </div>
  );
}
