// src/pages/requests.tsx
import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Navbar } from "@/components/navbar";
import { Loader2, CheckCircle, XCircle, Clock, ArrowRight } from "lucide-react";
import { toast } from "sonner";

type TabType = "received" | "sent";

export default function Requests() {
  const [tab, setTab] = useState<TabType>("received");
  const queryClient = useQueryClient();

  const { data: requests, isLoading } = useQuery({
    queryKey: ["requests", tab],
    queryFn: () => api.listRequests(tab),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: "accepted" | "rejected" }) => api.updateRequest(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      toast.success("Request updated!");
    },
    onError: () => toast.error("Failed to update request"),
  });

  const statusConfig = {
    pending: { icon: Clock, color: "text-accent", bg: "bg-accent/10" },
    accepted: { icon: CheckCircle, color: "text-secondary", bg: "bg-secondary/10" },
    rejected: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" },
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Exchange Requests</h1>
          <p className="text-muted-foreground mt-1">Manage your skill exchange requests</p>
        </div>

        <div className="flex gap-1 p-1 bg-card rounded-lg mb-6 border border-border w-fit">
          {(["received", "sent"] as TabType[]).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="animate-spin text-primary" size={32} /></div>
        ) : (
          <div className="space-y-3">
            {(requests ?? []).map(req => {
              const cfg = statusConfig[req.status as keyof typeof statusConfig] ?? statusConfig.pending;
              const StatusIcon = cfg.icon;
              const otherName = tab === "received" ? req.senderName ?? "Unknown" : req.receiverName ?? "Unknown";
              const otherId = tab === "received" ? req.senderId : req.receiverId;
              return (
                <div key={req.id} className="glass-panel rounded-xl p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">{otherName[0].toUpperCase()}</div>
                        <div>
                          <Link href={`/profile/${otherId}`}><span className="font-medium text-sm hover:text-primary transition-colors cursor-pointer">{otherName}</span></Link>
                          {req.skillTitle && <p className="text-xs text-muted-foreground">Re: {req.skillTitle}</p>}
                        </div>
                      </div>
                      {req.message && <p className="text-sm text-muted-foreground pl-10 mb-3">{req.message}</p>}
                      <div className="flex items-center gap-2 pl-10">
                        <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                          <StatusIcon size={10} /> {req.status}
                        </span>
                        <span className="text-xs text-muted-foreground">{new Date(req.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {tab === "received" && req.status === "pending" && (
                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => updateMutation.mutate({ id: req.id, status: "accepted" })} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-secondary/10 text-secondary hover:bg-secondary/20 transition-colors text-xs font-medium">
                          <CheckCircle size={12} /> Accept
                        </button>
                        <button onClick={() => updateMutation.mutate({ id: req.id, status: "rejected" })} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors text-xs font-medium">
                          <XCircle size={12} /> Reject
                        </button>
                      </div>
                    )}
                    {req.status === "accepted" && (
                      <Link href={`/chat?userId=${otherId}`}>
                        <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-xs font-medium flex-shrink-0">
                          Chat <ArrowRight size={12} />
                        </button>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
            {(!requests || requests.length === 0) && (
              <div className="text-center py-16 text-muted-foreground">
                <p className="text-lg mb-2">No {tab} requests</p>
                <p className="text-sm">{tab === "received" ? "Check back when someone requests your skills" : "Browse skills to send your first request"}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
