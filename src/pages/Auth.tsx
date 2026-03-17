import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Chrome, ArrowLeft, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import Footer from "@/components/Footer";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [socialLoading, setSocialLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Custom admin logic
    if (email.toLowerCase() === "admin@gmail.com") {
      if (password !== "jarvisadmin") {
        toast.error("Access Denied: Invalid admin credentials");
        return;
      }
    }

    // Authenticate
    await login(email);
    toast.success(isLogin ? "Welcome back to MOVIE HUB!" : "Account created successfully!");
    navigate("/");
  };

  const handleSocialLogin = async () => {
    if (socialLoading) return; // prevent double-click
    setSocialLoading(true);
    try {
      const { signInWithPopup } = await import("firebase/auth");
      const { auth, googleProvider } = await import("@/lib/firebase");
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      await login(user.email || "unknown@google.com", user.displayName || undefined, user.photoURL || undefined);
      toast.success(`Welcome, ${user.displayName || "User"}!`);
      navigate("/");
    } catch (error: any) {
      if (error?.code === "auth/cancelled-popup-request" ||
          error?.code === "auth/popup-closed-by-user") {
        return;
      }
      console.error("Google login error:", error);
      toast.error("Google sign-in failed. Please try again.");
    } finally {
      setSocialLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px]" />

      <div className="w-full max-w-md animate-scale-in relative z-10">
        <Button
          variant="ghost"
          className="mb-8 text-muted-foreground hover:text-primary transition-colors"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Terminal
        </Button>

        <div className="glass border border-white/10 p-8 rounded-3xl shadow-2xl">
          <div className="text-center mb-8 flex flex-col items-center">
            <img 
              src="/JARVIS2.gif" 
              alt="JARVIS Logo" 
              className="w-16 h-16 object-cover rounded-full mb-4 shadow-[0_0_20px_hsl(var(--primary)/0.4)] animate-pulse"
            />
            <h1 className="text-3xl font-display font-bold tracking-tighter mb-2">
              MOVIE<span className="text-blue-500 ml-1">HUB</span>
            </h1>
            <p className="text-muted-foreground text-sm">
              {isLogin ? "Access your secure media hub" : "Initialize your viewer credentials"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Email Address"
                  className="pl-10 bg-white/5 border-white/10 focus:border-blue-500 transition-all rounded-xl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Security Key (Password)"
                  className="pl-10 bg-white/5 border-white/10 focus:border-blue-500 transition-all rounded-xl"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-12 rounded-xl font-semibold bg-blue-600 hover:bg-blue-500 text-white hover-glow transition-all">
              {isLogin ? "Initialize Access" : "Create Protocols"}
            </Button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">External Sign In</span>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleSocialLogin}
              disabled={socialLoading}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-white/90 text-zinc-800 h-12 rounded-full font-medium shadow-xl transition-all disabled:opacity-50 group px-6 border border-zinc-300"
            >
              <img 
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                alt="Google" 
                className="w-5 h-5" 
              />
              <span className="text-base">
                {socialLoading ? "Signing in..." : "Sign up with Google"}
              </span>
            </button>
          </div>

          <div className="mt-8 text-center text-sm">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-muted-foreground hover:text-blue-500 transition-colors underline underline-offset-4"
            >
              {isLogin ? "Need a new access ID?" : "Already have credentials? Access here"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
