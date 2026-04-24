// Auth page — sign in / sign up tabs.
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function Auth() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && session) navigate("/", { replace: true });
  }, [session, loading, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { name: name || email.split("@")[0] },
          },
        });
        if (error) throw error;
        toast.success("Account created — you're signed in!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
      }
      navigate("/", { replace: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Authentication failed";
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen agileo-shell flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-5xl bg-card rounded-[20px] shadow-shell overflow-hidden grid md:grid-cols-2 min-h-[560px]">
        {/* Brand panel */}
        <div className="hidden md:flex flex-col justify-between p-10 bg-gradient-to-br from-violet via-violet to-blue text-white">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center font-bold text-xl">
              A
            </div>
            <span className="font-bold text-xl tracking-tight">AGILEO</span>
          </div>
          <div>
            <h1 className="text-4xl font-bold leading-tight tracking-tight mb-3">
              Ship sprints,<br />not surprises.
            </h1>
            <p className="text-white/80 text-sm leading-relaxed max-w-sm">
              The minimalist Scrum dashboard for teams who care about flow. Boards, sprints, and
              clear ownership — without the bloat.
            </p>
          </div>
          <div className="text-xs text-white/60">© AGILEO 2026</div>
        </div>

        {/* Form panel */}
        <div className="p-8 sm:p-10 flex flex-col justify-center">
          <h2 className="text-2xl font-bold mb-1">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            {mode === "signin" ? "Sign in to continue to AGILEO." : "Free forever for small teams."}
          </p>

          <Tabs value={mode} onValueChange={(v) => setMode(v as "signin" | "signup")} className="mb-6">
            <TabsList className="grid grid-cols-2 w-full bg-muted rounded-full p-1 h-11">
              <TabsTrigger value="signin" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Sign In
              </TabsTrigger>
              <TabsTrigger value="signup" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Sign Up
              </TabsTrigger>
            </TabsList>
            <TabsContent value="signin" />
            <TabsContent value="signup" />
          </Tabs>

          <form onSubmit={submit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Alice Martin" required className="h-11 rounded-xl" />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@team.com" required className="h-11 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} className="h-11 rounded-xl" />
            </div>
            <Button type="submit" disabled={busy} className="w-full h-11 rounded-full">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : mode === "signin" ? "Sign In" : "Create account"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
