// src/pages/dashboard.tsx
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api-client";
import { Navbar } from "@/components/navbar";
import { BookOpen, MessageCircle, Users, Star, ArrowRight, Clock, Loader2 } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading } = useQuery({ queryKey: ["dashboard-stats"], queryFn: api.stats });
  const { data: activity } = useQuery({ queryKey: ["recent-activity"], queryFn: api.recentActivity });
  const { data: featured } = useQuery({ queryKey: ["featured-skills"], queryFn: api.featuredSkills });

  const statCards = [
    { label: "My Skills", value: stats?.totalSkills ?? 0, icon: BookOpen, color: "text-primary" },
    { label: "Pending Requests", value: stats?.pendingRequests ?? 0, icon: Clock, color: "text-accent" },
    { label: "Accepted Exchanges", value: stats?.acceptedRequests ?? 0, icon: Star, color: "text-secondary" },
    { label: "Messages", value: stats?.unreadMessages ?? 0, icon: MessageCircle, color: "text-purple-400" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Welcome back, <span className="text-gradient">{user?.name ?? "Student"}</span></h1>
          <p className="text-muted-foreground mt-1">Here's what's happening with your skill exchange.</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={32} /></div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((card) => (
              <div key={card.label} className="glass-panel rounded-xl p-5">
                <card.icon className={`${card.color} mb-3`} size={22} />
                <div className="text-3xl font-bold">{card.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{card.label}</div>
              </div>
            ))}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="glass-panel rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Featured Skills</h2>
                <Link href="/skills" className="text-sm text-primary hover:underline flex items-center gap-1">View all <ArrowRight size={14} /></Link>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {(featured ?? []).slice(0, 4).map((skill) => (
                  <Link key={skill.id} href={`/skills/${skill.id}`}>
                    <div className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary mb-2 inline-block">{skill.category}</span>
                      <h3 className="font-medium text-sm mb-1">{skill.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">{skill.description}</p>
                      <p className="text-xs text-muted-foreground mt-2">by {skill.userName ?? "Anonymous"}</p>
                    </div>
                  </Link>
                ))}
                {(!featured || featured.length === 0) && (
                  <p className="text-muted-foreground text-sm col-span-2 py-4 text-center">No skills yet.</p>
                )}
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="glass-panel rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
              <div className="space-y-3">
                {(activity ?? []).slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Users size={14} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm">{item.message}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{new Date(item.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
                {(!activity || activity.length === 0) && <p className="text-sm text-muted-foreground text-center py-4">No activity yet</p>}
              </div>
            </div>
            <div className="glass-panel rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-1">
                {[{ href: "/skills", icon: BookOpen, label: "Browse Skills", color: "text-primary" }, { href: "/requests", icon: Users, label: "View Requests", color: "text-secondary" }, { href: "/chat", icon: MessageCircle, label: "Open Chat", color: "text-accent" }, { href: "/profile/me", icon: Star, label: "Edit Profile", color: "text-purple-400" }].map(({ href, icon: Icon, label, color }) => (
                  <Link key={href} href={href}>
                    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                      <Icon size={16} className={color} />
                      <span className="text-sm">{label}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
