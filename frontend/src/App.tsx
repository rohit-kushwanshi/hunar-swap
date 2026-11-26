// src/App.tsx
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/protected-route";
import Home from "@/pages/home";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import Skills from "@/pages/skills";
import SkillDetail from "@/pages/skill-detail";
import Profile from "@/pages/profile";
import Requests from "@/pages/requests";
import Chat from "@/pages/chat";

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 30000 } } });

function NotFound() {
  return <div className="min-h-screen flex items-center justify-center text-foreground bg-background"><div className="text-center"><h1 className="text-4xl font-bold mb-2">404</h1><p className="text-muted-foreground">Page not found</p></div></div>;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/skills" component={Skills} />
      <Route path="/skills/:id" component={SkillDetail} />
      <Route path="/profile/:id" component={Profile} />
      <Route path="/dashboard"><ProtectedRoute><Dashboard /></ProtectedRoute></Route>
      <Route path="/requests"><ProtectedRoute><Requests /></ProtectedRoute></Route>
      <Route path="/chat"><ProtectedRoute><Chat /></ProtectedRoute></Route>
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster richColors position="top-right" />
      </AuthProvider>
    </QueryClientProvider>
  );
}
