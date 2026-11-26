// Hunar Swap — API Client
// All API calls go through this file using fetch

const BASE_URL = "/api";

let authToken: string | null = localStorage.getItem("hs_token");

export function setToken(token: string | null) {
  authToken = token;
  if (token) localStorage.setItem("hs_token", token);
  else localStorage.removeItem("hs_token");
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (authToken) headers["Authorization"] = `Bearer ${authToken}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || "Request failed");
  }
  if (res.status === 204) return null as T;
  return res.json();
}

export const api = {
  // Auth
  register: (data: { name: string; email: string; password: string }) =>
    request<{ user: User; token: string }>("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  login: (data: { email: string; password: string }) =>
    request<{ user: User; token: string }>("/auth/login", { method: "POST", body: JSON.stringify(data) }),
  logout: () => request<void>("/auth/logout", { method: "POST" }),
  me: () => request<User>("/auth/me"),

  // Users
  getUser: (id: number) => request<User>(`/users/${id}`),
  updateUser: (id: number, data: Partial<User>) =>
    request<User>(`/users/${id}`, { method: "PATCH", body: JSON.stringify(data) }),

  // Skills
  listSkills: (params?: { search?: string; category?: string; userId?: number }) => {
    const q = new URLSearchParams(params as Record<string, string>).toString();
    return request<Skill[]>(`/skills${q ? "?" + q : ""}`);
  },
  getSkill: (id: number) => request<Skill>(`/skills/${id}`),
  createSkill: (data: { title: string; description: string; category: string }) =>
    request<Skill>("/skills", { method: "POST", body: JSON.stringify(data) }),
  updateSkill: (id: number, data: Partial<{ title: string; description: string; category: string }>) =>
    request<Skill>(`/skills/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteSkill: (id: number) => request<void>(`/skills/${id}`, { method: "DELETE" }),
  listCategories: () => request<{ category: string; count: number }[]>("/skills/categories"),

  // Requests
  listRequests: (type: "received" | "sent") => request<ExchangeRequest[]>(`/requests?type=${type}`),
  createRequest: (data: { receiverId: number; skillId?: number; message?: string }) =>
    request<ExchangeRequest>("/requests", { method: "POST", body: JSON.stringify(data) }),
  updateRequest: (id: number, status: "accepted" | "rejected") =>
    request<ExchangeRequest>(`/requests/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }),

  // Messages
  listConversations: () => request<Conversation[]>("/messages"),
  getMessages: (userId: number) => request<Message[]>(`/messages/${userId}`),
  sendMessage: (userId: number, content: string) =>
    request<Message>(`/messages/${userId}`, { method: "POST", body: JSON.stringify({ content }) }),

  // Dashboard
  stats: () => request<DashboardStats>("/dashboard/stats"),
  recentActivity: () => request<ActivityItem[]>("/dashboard/recent-activity"),
  featuredSkills: () => request<Skill[]>("/dashboard/featured-skills"),
};

// Types
export interface User {
  id: number; name: string; email: string; bio?: string; address?: string;
  profilePhoto?: string; skills: string[]; rating?: number; isVerified: boolean; createdAt: string;
}
export interface Skill {
  id: number; title: string; description: string; category: string;
  userId: number; userName?: string; userPhoto?: string; userRating?: number; createdAt: string;
}
export interface ExchangeRequest {
  id: number; senderId: number; receiverId: number; skillId?: number;
  message?: string; status: string; createdAt: string;
  senderName?: string; receiverName?: string; skillTitle?: string;
}
export interface Message {
  id: number; senderId: number; receiverId: number; content: string; createdAt: string;
}
export interface Conversation {
  userId: number; userName: string; lastMessage: string; unreadCount: number; updatedAt: string;
}
export interface DashboardStats {
  totalSkills: number; pendingRequests: number; acceptedRequests: number; unreadMessages: number;
}
export interface ActivityItem {
  id: number; message: string; createdAt: string;
}
