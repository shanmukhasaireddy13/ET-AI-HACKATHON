import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/50 group-hover:bg-primary/40 transition-colors">
            <div className="w-3 h-3 rounded-full bg-primary animate-pulse-slow"></div>
          </div>
          <span className="text-xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
            AGENT<span className="text-foreground">MONITOR</span>
          </span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Dashboard
          </Link>
          <Link href="/approvals" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative">
            Approvals
          </Link>
          <Link href="/integrations" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
            Integrations
          </Link>
        </div>
      </div>
    </nav>
  );
}
