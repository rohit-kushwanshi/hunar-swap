import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function Register() {
  const { register } = useAuth();
  const [, setLocation] = useLocation();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  function validate() {
    const e: typeof errors = {};
    if (form.name.length < 2) e.name = "Min 2 characters";
    if (!form.email.includes("@")) e.email = "Valid email required";
    if (form.password.length < 6) e.password = "Min 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    try {
      setIsLoading(true);
      await register({ name: form.name, email: form.email, password: form.password });
      toast.success("Account created!");
      setLocation("/dashboard");
    } catch {
      toast.error("Could not create account. Try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const field = (key: keyof typeof form, label: string, type = "text", placeholder = "") => (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      <input
        type={type} value={form[key]}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-lg bg-background/50 border border-white/10 focus:border-secondary/50 focus:outline-none text-sm transition-colors"
      />
      {errors[key] && <p className="text-destructive text-xs mt-1">{errors[key]}</p>}
    </div>
  );

  return (
    <div className="min-h-screen w-full flex bg-background text-foreground relative overflow-hidden">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-[100px]" />
      </div>

      <div className="flex-1 flex flex-col justify-center items-center p-6 z-10">
        <Link href="/" className="flex items-center gap-3 mb-8">
          <img src="/hunarswap_logo.png" alt="Hunar Swap" className="h-12 w-12 object-contain" />
          <span className="text-2xl font-bold text-gradient">Hunar Swap</span>
        </Link>

        <div className="w-full max-w-md glass-panel rounded-2xl p-8 shadow-2xl relative">
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-secondary/50 to-transparent" />
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Join the Hub</h1>
            <p className="text-muted-foreground">Skill for skill. No money involved.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {field("name", "Full Name", "text", "Aryan Kumar")}
            {field("email", "Email", "email", "you@university.edu")}
            {field("password", "Password", "password", "••••••••")}
            <button type="submit" disabled={isLoading}
              className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 py-3 rounded-lg font-semibold text-base transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
              {isLoading ? "Creating..." : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-secondary hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
