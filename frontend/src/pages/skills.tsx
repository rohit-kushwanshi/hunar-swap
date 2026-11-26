// src/pages/skills.tsx
import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api-client";
import { Navbar } from "@/components/navbar";
import { Search, Plus, X, Loader2, Star } from "lucide-react";
import { toast } from "sonner";

export default function Skills() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", category: "" });

  const { data: skills, isLoading } = useQuery({
    queryKey: ["skills", search, selectedCategory],
    queryFn: () => api.listSkills({ search: search || undefined, category: selectedCategory }),
  });
  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: api.listCategories });

  const createMutation = useMutation({
    mutationFn: api.createSkill,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skills"] });
      toast.success("Skill added!");
      setShowAddForm(false);
      setForm({ title: "", description: "", category: "" });
    },
    onError: () => toast.error("Failed to add skill"),
  });

  const categoryOptions = ["Coding", "Design", "Music", "Video Editing", "Photography", "Language", "Writing", "Other"];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Skill Marketplace</h1>
            <p className="text-muted-foreground mt-1">Discover and exchange skills with students</p>
          </div>
          {user && (
            <button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
              <Plus size={16} /> Add Skill
            </button>
          )}
        </div>

        {showAddForm && (
          <div className="glass-panel rounded-xl p-6 mb-6 border border-primary/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Add New Skill</h2>
              <button onClick={() => setShowAddForm(false)}><X size={18} className="text-muted-foreground" /></button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <input placeholder="Skill title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="col-span-2 px-4 py-2.5 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm" />
              <textarea placeholder="Describe what you can teach..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="col-span-2 px-4 py-2.5 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm resize-none" />
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="px-4 py-2.5 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm">
                <option value="">Select category</option>
                {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <button onClick={() => createMutation.mutate(form)} disabled={createMutation.isPending} className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50">
                {createMutation.isPending && <Loader2 size={14} className="animate-spin" />} Add Skill
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="search" placeholder="Search skills..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-card border border-border focus:border-primary outline-none text-sm" />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setSelectedCategory(undefined)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${!selectedCategory ? "bg-primary text-primary-foreground" : "bg-card border border-border"}`}>All</button>
            {(categories ?? []).map(cat => (
              <button key={cat.category} onClick={() => setSelectedCategory(cat.category === selectedCategory ? undefined : cat.category)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${selectedCategory === cat.category ? "bg-primary text-primary-foreground" : "bg-card border border-border"}`}>
                {cat.category} ({cat.count})
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="animate-spin text-primary" size={32} /></div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(skills ?? []).map(skill => (
              <Link key={skill.id} href={`/skills/${skill.id}`}>
                <div className="glass-panel rounded-xl p-5 hover:border-primary/40 border border-transparent transition-all cursor-pointer group hover:-translate-y-0.5">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">{skill.category}</span>
                    {skill.userRating && <span className="flex items-center gap-1 text-xs text-muted-foreground"><Star size={10} className="fill-yellow-400 text-yellow-400" /> {skill.userRating.toFixed(1)}</span>}
                  </div>
                  <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">{skill.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{skill.description}</p>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">{(skill.userName ?? "?")[0].toUpperCase()}</div>
                    <span className="text-xs text-muted-foreground">{skill.userName ?? "Anonymous"}</span>
                  </div>
                </div>
              </Link>
            ))}
            {(!skills || skills.length === 0) && (
              <div className="col-span-3 text-center py-16 text-muted-foreground">
                <p className="text-lg mb-2">No skills found</p>
                <p className="text-sm">{user ? "Be the first to add a skill!" : "Sign up to add your skills"}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
