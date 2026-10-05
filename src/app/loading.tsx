export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center">
        <div className="w-9 h-9 rounded-full border-2 border-border border-t-foreground animate-spin" />
      </div>
      <p className="mt-4 text-xs font-mono uppercase tracking-widest text-muted-foreground animate-pulse">
        Loading...
      </p>
    </div>
  );
}
