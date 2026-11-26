// src/pages/chat.tsx
import { useState, useEffect, useRef } from "react";
import { useSearch } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api-client";
import { Navbar } from "@/components/navbar";
import { Loader2, Send, MessageCircle } from "lucide-react";
import { Link } from "wouter";

export default function Chat() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const initialUserId = params.get("userId") ? parseInt(params.get("userId")!) : null;
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(initialUserId);
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversations, isLoading: convsLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: api.listConversations,
    refetchInterval: 3000,
  });

  const { data: messages, isLoading: msgsLoading } = useQuery({
    queryKey: ["messages", selectedUserId],
    queryFn: () => api.getMessages(selectedUserId!),
    enabled: !!selectedUserId,
    refetchInterval: 3000,
  });

  const sendMutation = useMutation({
    mutationFn: (content: string) => api.sendMessage(selectedUserId!, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", selectedUserId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const selectedConv = (conversations ?? []).find(c => c.userId === selectedUserId);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim() || !selectedUserId) return;
    const content = message;
    setMessage("");
    sendMutation.mutate(content);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-4 h-[calc(100vh-64px)]">
        <div className="flex h-full gap-4">
          <div className="w-72 glass-panel rounded-xl flex flex-col overflow-hidden flex-shrink-0">
            <div className="p-4 border-b border-border"><h2 className="font-semibold">Conversations</h2></div>
            <div className="flex-1 overflow-y-auto">
              {convsLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="animate-spin text-primary" size={20} /></div>
              ) : (conversations ?? []).length === 0 ? (
                <div className="p-4 text-center text-muted-foreground text-sm">No conversations yet. <Link href="/skills" className="text-primary">Find students</Link> to chat with.</div>
              ) : (
                (conversations ?? []).map(conv => (
                  <button key={conv.userId} onClick={() => setSelectedUserId(conv.userId)} className={`w-full p-4 flex items-start gap-3 hover:bg-white/5 transition-colors text-left border-b border-border/50 ${selectedUserId === conv.userId ? "bg-primary/10" : ""}`}>
                    <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">{conv.userName[0].toUpperCase()}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{conv.userName}</span>
                        {conv.unreadCount > 0 && <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">{conv.unreadCount}</span>}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="flex-1 glass-panel rounded-xl flex flex-col overflow-hidden">
            {selectedUserId ? (
              <>
                <div className="p-4 border-b border-border flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">{(selectedConv?.userName ?? "?")[0].toUpperCase()}</div>
                  <Link href={`/profile/${selectedUserId}`}><span className="font-medium hover:text-primary transition-colors cursor-pointer">{selectedConv?.userName ?? `User ${selectedUserId}`}</span></Link>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {msgsLoading ? (
                    <div className="flex justify-center py-8"><Loader2 className="animate-spin text-primary" size={20} /></div>
                  ) : (messages ?? []).length === 0 ? (
                    <div className="text-center text-muted-foreground text-sm py-8">No messages yet. Say hello!</div>
                  ) : (
                    (messages ?? []).map(msg => {
                      const isMe = msg.senderId === user?.id;
                      return (
                        <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${isMe ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-card border border-border rounded-bl-sm"}`}>
                            <p>{msg.content}</p>
                            <p className={`text-xs mt-1 ${isMe ? "text-primary-foreground/60" : "text-muted-foreground"}`}>{new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>
                <form onSubmit={handleSend} className="p-4 border-t border-border flex gap-3">
                  <input value={message} onChange={e => setMessage(e.target.value)} placeholder="Type a message..." className="flex-1 px-4 py-2.5 rounded-full bg-background border border-border focus:border-primary outline-none text-sm" />
                  <button type="submit" disabled={!message.trim()} className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50"><Send size={16} /></button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                <MessageCircle size={48} className="mb-4 opacity-20" />
                <p className="text-lg font-medium">Select a conversation</p>
                <p className="text-sm">or find students in the Skills marketplace</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
