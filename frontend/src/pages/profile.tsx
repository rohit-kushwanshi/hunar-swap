// src/pages/profile.tsx
import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api-client";
import { Navbar } from "@/components/navbar";
import { Loader2, Edit2, MapPin, Star, Mail } from "lucide-react";
import { toast } from "sonner";

export default function Profile() {
  const { id } = useParams<{ id: string }>();
  const { user: authUser } = useAuth();
  const queryClient = useQueryClient();
  const isMe = id === "me";
  const userId = isMe ? authUser?.id : parseInt(id ?? "0");

  const { data: profile, isLoading } = useQuery({ queryKey: ["user", userId], queryFn: () => api.getUser(userId!), enabled: !!userId });
  const { data: skills } = useQuery({ queryKey: ["skills", { userId }], queryFn: () => api.listSkills({ userId }), enabled: !!userId });

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ name: "", bio: "", address: "", skills: "" });

  useEffect(() => {
    if (profile) setForm({ name: profile.name, bio: profile.bio ?? "", address: profile.address ?? "", skills: (profile.skills ?? []).join(", ") });
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: (data: { name: string; bio: string; address: string; skills: string[] }) => api.updateUser(userId!, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["user", userId] }); toast.success("Profile updated!"); setIsEditing(false); },
    onError: () => toast.error("Failed to update profile"),
  });

  function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    updateMutation.mutate({ name: form.name, bio: form.bio, address: form.address, skills: form.skills.split(",").map(s => s.trim()).filter(Boolean) });
  }

  if (isLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={32} /></div>;
  if (!profile) return <div className="min-h-screen bg-background text-foreground"><Navbar /><div className="max-w-2xl mx-auto px-4 py-16 text-center"><p className="text-muted-foreground">Profile not found</p></div></div>;

  const canEdit = isMe || authUser?.id === profile.id;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="glass-panel rounded-xl p-8 mb-6">
          {isEditing ? (
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div><label className="text-xs text-muted-foreground mb-1 block">Name</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm" /></div>
                <div><label className="text-xs text-muted-foreground mb-1 block">Location</label><input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm" placeholder="City, Country" /></div>
              </div>
              <div><label className="text-xs text-muted-foreground mb-1 block">Bio</label><textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={3} className="w-full px-4 py-2.5 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm resize-none" /></div>
              <div><label className="text-xs text-muted-foreground mb-1 block">Skills (comma-separated)</label><input value={form.skills} onChange={e => setForm(f => ({ ...f, skills: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm" /></div>
              <div className="flex gap-3">
                <button type="submit" className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm">Save Changes</button>
                <button type="button" onClick={() => setIsEditing(false)} className="px-5 py-2.5 rounded-lg border border-border text-sm">Cancel</button>
              </div>
            </form>
          ) : (
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-3xl font-bold text-primary flex-shrink-0">{profile.name[0].toUpperCase()}</div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold">{profile.name}</h1>
                  {profile.isVerified && <span className="text-xs px-2 py-0.5 bg-secondary/20 text-secondary rounded-full">Verified</span>}
                  {profile.rating && <span className="flex items-center gap-1 text-sm text-muted-foreground"><Star size={12} className="fill-yellow-400 text-yellow-400" /> {profile.rating.toFixed(1)}</span>}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                  <span className="flex items-center gap-1"><Mail size={12} />{profile.email}</span>
                  {profile.address && <span className="flex items-center gap-1"><MapPin size={12} />{profile.address}</span>}
                </div>
                {profile.bio && <p className="text-muted-foreground mb-4 leading-relaxed">{profile.bio}</p>}
                {(profile.skills?.length ?? 0) > 0 && <div className="flex flex-wrap gap-2 mb-4">{profile.skills.map(s => <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">{s}</span>)}</div>}
                <div className="flex gap-3">
                  {canEdit && <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-white/5 transition-colors text-sm"><Edit2 size={14} /> Edit Profile</button>}
                  {!canEdit && <Link href={`/chat?userId=${profile.id}`}><button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm">Send Message</button></Link>}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="glass-panel rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">{canEdit ? "My Skills" : `${profile.name}'s Skills`}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(skills ?? []).map(skill => (
              <Link key={skill.id} href={`/skills/${skill.id}`}>
                <div className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary mb-2 inline-block">{skill.category}</span>
                  <h3 className="font-medium text-sm">{skill.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{skill.description}</p>
                </div>
              </Link>
            ))}
            {(!skills || skills.length === 0) && <p className="text-muted-foreground text-sm col-span-3 py-4">No skills added yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
