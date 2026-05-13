import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const navigate = useNavigate();
  const { user, login } = useAuth();

  // Redirect if already logged in
  useState(() => {
    if (user && typeof window !== 'undefined') {
       navigate("/");
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    try {
      const { auth } = await import("@/lib/firebase");
      const { 
        signInWithEmailAndPassword, 
        createUserWithEmailAndPassword,
        sendEmailVerification
      } = await import("firebase/auth");

      if (isLogin) {
        // Admin bypass flow
        const isHardAdmin = (email.toLowerCase() === "admin@gmail.com" || email.toLowerCase() === "superadmin@gmail.com") && 
                            (password === "jarvisadmin" || password === "admin123");
        if (isHardAdmin) {
          await login(email.toLowerCase(), password, false, "Admin", undefined);
          toast.success("JARVIS ADMIN ACCESS GRANTED");
          navigate("/");
          return;
        }

        try {
          const result = await signInWithEmailAndPassword(auth, email, password);
          await login(result.user.email || email, undefined, true, result.user.displayName || undefined, result.user.photoURL || undefined);
          toast.success("Welcome back!");
          navigate("/");
        } catch (err: any) {
          toast.error("Invalid credentials.");
        }
      } else {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(result.user);
        await login(result.user.email || email, undefined, true);
        toast.success("Account created!");
        navigate("/");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async () => {
    if (socialLoading) return;
    setSocialLoading(true);
    try {
      const { signInWithPopup } = await import("firebase/auth");
      const { auth, googleProvider } = await import("@/lib/firebase");
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      await login(user.email || "", undefined, true, user.displayName || undefined, user.photoURL || undefined);
      toast.success(`Welcome, ${user.displayName}!`);
      navigate("/");
    } catch (error: any) {
      toast.error("Google login failed.");
    } finally {
      setSocialLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px]" />

      <div className="w-full max-w-md animate-scale-in relative z-10">
        <button
          onClick={() => navigate("/")}
          className="mb-8 flex items-center text-white/40 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span className="text-xs font-bold uppercase tracking-widest">Back to Home</span>
        </button>

        <div className="glass border border-white/10 p-8 md:p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <div className="text-center mb-10 flex flex-col items-center">
            <img 
              src="/JARVIS2.gif" 
              alt="JARVIS" 
              className="w-16 h-16 object-cover rounded-full mb-6 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
            />
            <h1 className="text-4xl font-bold tracking-tight mb-2 text-white italic">
              JARVIS<span className="text-blue-500 ml-1">HUB</span>
            </h1>
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest">
              {isLogin ? "Sign in to your account" : "Create your account"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <Input
                  type="email"
                  placeholder="Email"
                  className="h-12 pl-12 bg-white/5 border-white/10 focus:border-blue-500 transition-all rounded-2xl text-white font-medium"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <Input
                  type="password"
                  placeholder="Password"
                  className="h-12 pl-12 bg-white/5 border-white/10 focus:border-blue-500 transition-all rounded-2xl text-white font-medium"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-12 rounded-2xl font-bold bg-white text-black hover:bg-white/90 transition-all disabled:opacity-50"
            >
              {loading ? "Establishing Link..." : (isLogin ? "Sign In" : "Create Account")}
            </Button>
          </form>

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/5"></span>
            </div>
            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.2em]">
              <span className="bg-[#050505] px-4 text-white/20">OR</span>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleSocialLogin}
              disabled={socialLoading}
              className="w-full flex items-center justify-center gap-3 bg-white text-black h-12 rounded-2xl font-bold shadow-xl transition-all disabled:opacity-50 group px-6 border border-white/10"
            >
              <GoogleIcon />
              <span className="text-sm">
                {socialLoading ? "Connecting..." : "Sign up with Google"}
              </span>
            </button>
          </div>

          <div className="mt-10 text-center text-xs">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-white/30 hover:text-blue-400 transition-colors underline underline-offset-4 font-bold uppercase tracking-widest"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
