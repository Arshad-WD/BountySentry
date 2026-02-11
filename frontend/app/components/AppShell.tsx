import Navbar from "./Navbar";
import Link from "next/link";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-brand-bg transition-all duration-700 ease-in-out selection:bg-brand-accent selection:text-brand-bg">
      <Navbar />
      
      <main className="mx-auto max-w-6xl px-6 pt-36 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        {children}
      </main>
      
      <footer className="mx-auto max-w-6xl px-6 py-16 border-t border-white/5">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-secondary">
          <p>© 2026 Protocol DAO. Authorized access only.</p>
          <div className="flex gap-8">
            <Link href="/docs" className="hover:text-brand-text transition-colors">Documentation</Link>
            <Link href="/security" className="hover:text-brand-text transition-colors">Security</Link>
            <a href="https://twitter.com/ethereum" target="_blank" rel="noopener noreferrer" className="hover:text-brand-text transition-colors">Twitter</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
