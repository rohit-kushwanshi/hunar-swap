import { Link } from "wouter";

export default function Home() {
  return (
    <div className="min-h-screen w-full flex flex-col bg-background text-foreground dark">
      <header className="flex items-center justify-between p-6 glass-panel sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <img src="/hunarswap_logo.png" alt="Hunar Swap Logo" className="h-10 w-10 object-contain" />
          <span className="text-xl font-bold text-gradient">Hunar Swap</span>
        </div>
        <nav className="flex gap-4">
          <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">Login</Link>
          <Link href="/register" className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">Get Started</Link>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl mix-blend-screen animate-pulse" />
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl mix-blend-screen animate-pulse" style={{ animationDelay: "2s" }} />
        </div>
        
        <div className="relative z-10 max-w-3xl space-y-6">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
            Hunar Ke Badle <span className="text-gradient">Hunar</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            The underground creative hub where talented students meet. Share your skills, learn something new, and build the future together.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <Link href="/register" className="text-lg font-medium bg-primary text-primary-foreground px-8 py-4 rounded-full hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/20">
              Join the Community
            </Link>
            <Link href="/skills" className="text-lg font-medium glass-panel px-8 py-4 rounded-full hover:bg-white/5 transition-all hover:scale-105 active:scale-95">
              Explore Skills
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
