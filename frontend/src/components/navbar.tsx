import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Home, Search, MessageSquare, Bell, User as UserIcon, LogOut, Menu, X } from "lucide-react";

export function Navbar() {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setLocation("/login");
  };

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/skills",    label: "Explore",   icon: Search },
    { href: "/requests",  label: "Requests",  icon: Bell },
    { href: "/chat",      label: "Messages",  icon: MessageSquare },
  ];

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <img src="/hunarswap_logo.png" alt="Hunar Swap" className="h-8 w-8 object-contain" />
          <span className="font-bold text-lg hidden sm:inline-block">Hunar Swap</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="relative group">
              <button className="flex items-center gap-2 h-9 px-3 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-sm">
                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline max-w-24 truncate">{user.name}</span>
              </button>
              <div className="absolute right-0 top-full mt-2 w-48 glass-panel border border-white/10 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <div className="px-4 py-3 border-b border-white/10">
                  <p className="font-medium text-sm">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                <Link href="/profile/me" className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-white/5 transition-colors">
                  <UserIcon className="h-4 w-4" /> Profile
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors rounded-b-xl">
                  <LogOut className="h-4 w-4" /> Log out
                </button>
              </div>
            </div>
          ) : (
            <Link href="/login" className="border border-white/10 hover:bg-white/5 px-4 py-2 rounded-lg text-sm transition-colors">
              Sign In
            </Link>
          )}

          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors">
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-white/10 px-4 py-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors">
                <Icon className="h-4 w-4" /> {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
