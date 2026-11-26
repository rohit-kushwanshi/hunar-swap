// src/pages/skill-detail.tsx
import { useState } from "react";
import { Link, useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api-client";
import { Navbar } from "@/components/navbar";
import { ArrowLeft, Loader2, Edit2, Trash2, Send, Star, User } from "lucide-react";
import { toast } from "sonner";

export default function SkillDetail() {
  const { id } = useParams<{ id: string }>();
  const skillId = parseInt(id ?? "0");
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: "", description: "", category: "" });

  const { data: skill, isLoading } = useQuery({ queryKey: ["skill", skillId], queryFn: () => api.getSkill(skillId), enabled: !!skillId });

  const updateMutation = useMutation({
    mutationFn: (data: typeof editForm) => api.updateSkill(skillId, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["skill", skillId] }); toast.success("Skill updated!"); setIsEditing(false); },
    onError: () => toast.error("Failed to update skill"),
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.deleteSkill(skillId),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["skills"] }); toast.success("Skill deleted"); setLocation("/skills"); },
    onError: () => toast.error("Failed to delete skill"),
  });

  const requestMutation = useMutation({
    mutationFn: (msg: string) => api.createRequest({ receiverId: skill!.userId, skillId, message: msg }),
    onSuccess: () => { toast.success("Exchange request sent!"); setShowRequestForm(false); setRequestMessage(""); },
    onError: () => toast.error("Failed to send request"),
  });

  const isOwner = user?.id === skill?.userId;

  if (isLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={32} /></div>;
  if (!skill) return <div className="min-h-screen bg-background text-foreground"><Navbar /><div className="max-w-2xl mx-auto px-4 py-16 text-center"><p className="text-muted-foreground">Skill not found</p><Link href="/skills" className="text-primary mt-4 inline-block">Back to Skills</Link></div></div>;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link href="/skills" className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 text-sm"><ArrowLeft size={16} /> Back to Skills</Link>
        <div className="glass-panel rounded-xl p-8">
          {isEditing ? (
            <div className="space-y-4">
              <input value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg bg-background border border-border focus:border-primary outline-none" placeholder="Skill title" />
              <textarea value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} rows={4} className="w-full px-4 py-2.5 rounded-lg bg-background border border-border focus:border-primary outline-none resize-none" placeholder="Description" />
              <input value={editForm.category} onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg bg-background border border-border focus:border-primary outline-none" placeholder="Category" />
              <div className="flex gap-3">
                <button onClick={() => updateMutation.mutate(editForm)} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm">Save</button>
                <button onClick={() => setIsEditing(false)} className="px-4 py-2 rounded-lg border border-border text-sm">Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary mb-3 inline-block">{skill.category}</span>
                  <h1 className="text-3xl font-bold">{skill.title}</h1>
                </div>
                {isOwner && (
                  <div className="flex gap-2">
                    <button onClick={() => { setIsEditing(true); setEditForm({ title: skill.title, description: skill.description, category: skill.category }); }} className="p-2 rounded-lg hover:bg-white/5 transition-colors text-muted-foreground"><Edit2 size={16} /></button>
                    <button onClick={() => confirm("Delete this skill?") && deleteMutation.mutate()} className="p-2 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"><Trash2 size={16} /></button>
                  </div>
                )}
              </div>
              <p className="text-muted-foreground leading-relaxed mb-8">{skill.description}</p>
              <div className="flex items-center gap-4 p-4 rounded-lg bg-white/5 mb-6">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-lg font-bold text-primary">{(skill.userName ?? "?")[0].toUpperCase()}</div>
                <div>
                  <Link href={`/profile/${skill.userId}`}><span className="font-medium hover:text-primary transition-colors cursor-pointer">{skill.userName ?? "Anonymous"}</span></Link>
                  {skill.userRating && <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5"><Star size={10} className="fill-yellow-400 text-yellow-400" /> {skill.userRating.toFixed(1)}</div>}
                </div>
              </div>
              {!isOwner && (
                showRequestForm ? (
                  <div className="space-y-3">
                    <textarea placeholder="What do you want to learn and what can you offer?" value={requestMessage} onChange={e => setRequestMessage(e.target.value)} rows={3} className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm resize-none" />
                    <div className="flex gap-3">
                      <button onClick={() => requestMutation.mutate(requestMessage)} className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm"><Send size={14} /> Send Request</button>
                      <button onClick={() => setShowRequestForm(false)} className="px-4 py-2.5 rounded-lg border border-border text-sm">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <button onClick={() => setShowRequestForm(true)} className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg"><Send size={16} /> Request Exchange</button>
                    <Link href={`/chat?userId=${skill.userId}`}><button className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border"><User size={16} /> Message</button></Link>
                  </div>
                )
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
