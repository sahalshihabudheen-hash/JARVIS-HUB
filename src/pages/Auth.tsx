import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowLeft, ShieldCheck, Zap, Activity } from "lucide-react";
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
        // Admin bypass — skip Firebase Auth entirely
        const isHardAdmin = (email.toLowerCase() === "admin@gmail.com" || email.toLowerCase() === "superadmin@gmail.com") && 
                            (password === "jarvisadmin" || password === "admin123");
        if (isHardAdmin) {
          await login(email.toLowerCase(), password, false, "Admin", undefined);
          toast.success("JARVIS ADMIN ACCESS GRANTED", { description: "Welcome back, Commander." });
          navigate("/");
          return;
        }

        // Regular Login flow via Firebase Auth
        try {
          const result = await signInWithEmailAndPassword(auth, email, password);
          await login(result.user.email || email, undefined, true, result.user.displayName || undefined, result.user.photoURL || undefined);
          toast.success("Welcome back to JARVIS HUB!");
          navigate("/");
        } catch (err: any) {
          if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
            toast.error("Invalid credentials. Please verify your ID and Key.");
          } else {
            throw err;
          }
        }
      } else {
        // Sign up flow
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(result.user);
        await login(result.user.email || email, undefined, true);
        
        toast.success("Protocol Initialized!", {
          description: "A verification link has been sent to your email. Please verify to access all features."
        });
        navigate("/");
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      toast.error(error.message || "Protocol failure: Unable to establish secure session.");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async () => {
    if (socialLoading) return; // prevent double-click
    setSocialLoading(true);
    try {
      const { signInWithPopup } = await import("firebase/auth");
      const { auth, googleProvider } = await import("@/lib/firebase");
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      await login(user.email || "unknown@google.com", undefined, true, user.displayName || undefined, user.photoURL || undefined);
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
    <div className="min-h-screen bg-[#020202] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* ── Dynamic Atmospheric Background ── */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        {/* Animated Glow Orbs */}
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-blue-600/10 rounded-full blur-[150px] animate-pulse pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-purple-600/10 rounded-full blur-[150px] animate-pulse pointer-events-none" style={{ animationDelay: '2s' }} />
        
        {/* Floating Particles/Shapes */}
        <div className="absolute top-[20%] left-[15%] w-32 h-32 border border-white/5 rounded-full animate-float-slow pointer-events-none" />
        <div className="absolute bottom-[30%] right-[15%] w-48 h-48 border border-white/5 rounded-full animate-float pointer-events-none" />
        
        {/* Scanline Effect */}
        <div className="absolute inset-0 bg-scanline pointer-events-none opacity-[0.03]" />
        
        {/* Grainy Noise */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04] mix-blend-overlay pointer-events-none" />
        
        {/* Perspective Grid */}
        <div className="absolute inset-0 grid-overlay opacity-[0.05] pointer-events-none" />
      </div>

      <div className="w-full max-w-[440px] relative z-10 animate-fade-in-up">
        {/* Back Link */}
        <button
          onClick={() => navigate("/")}
          className="group mb-10 flex items-center gap-3 text-white/40 hover:text-white transition-all duration-500"
        >
          <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:border-white/30 transition-all">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.4em]">Abort Authentication</span>
        </button>

        {/* ── Premium Auth Container ── */}
        <div className="relative group/card">
          {/* Dynamic Rainbow Glow Outline */}
          <div className="absolute -inset-[2px] bg-gradient-to-r from-blue-500/30 via-cyan-400/30 to-purple-500/30 rounded-[3rem] blur-md opacity-20 group-hover/card:opacity-60 transition-opacity duration-1000" />
          
          <div className="relative bg-[#080b13]/80 backdrop-blur-3xl border border-white/10 p-10 md:p-14 rounded-[3rem] shadow-[0_40px_120px_rgba(0,0,0,0.9)] overflow-hidden">
            
            {/* Top Scanning Accent */}
            <div className="absolute top-0 left-0 right-0 h-[2px] w-full bg-gradient-to-r from-transparent via-blue-500/50 to-transparent scanning-line" />

            <div className="relative z-10">
              <div className="text-center mb-12">
                <div className="relative inline-block mb-8 group/avatar">
                  <div className="absolute inset-0 bg-blue-500/30 blur-[40px] rounded-full animate-pulse group-hover/avatar:blur-[60px] transition-all" />
                  <div className="relative w-24 h-24 rounded-3xl border-2 border-white/10 p-1.5 bg-black/40 backdrop-blur-2xl shadow-2xl rotate-3 group-hover/avatar:rotate-0 transition-all duration-700 overflow-hidden">
                    <img 
                      src="/JARVIS2.gif" 
                      alt="JARVIS CORE" 
                      className="w-full h-full object-cover rounded-2xl brightness-110 contrast-125"
                    />
                    {/* Status Dot */}
                    <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-black shadow-[0_0_10px_#22c55e]" />
                  </div>
                </div>
                
                <h1 className="text-5xl font-display font-black tracking-tighter text-white mb-3 italic">
                  JARVIS <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 animate-gradient-x">HUB</span>
                </h1>
                
                <div className="flex items-center justify-center gap-4 text-white/20">
                   <div className="flex items-center gap-1.5">
                     <Activity className="w-3 h-3 text-blue-500" />
                     <span className="text-[9px] font-black uppercase tracking-[0.4em]">Link Ready</span>
                   </div>
                   <div className="w-1 h-1 rounded-full bg-white/10" />
                   <div className="flex items-center gap-1.5">
                     <ShieldCheck className="w-3 h-3 text-cyan-500" />
                     <span className="text-[9px] font-black uppercase tracking-[0.4em]">Secure</span>
                   </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="group/input relative">
                    <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                      <Mail className="w-4 h-4 text-white/10 group-focus-within/input:text-blue-400 transition-colors" />
                    </div>
                    <Input
                      type="email"
                      placeholder="Neural Address (Email)"
                      className="h-16 pl-14 bg-white/[0.03] border-white/10 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all rounded-2xl font-bold text-[13px] placeholder:text-white/5 text-white"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="group/input relative">
                    <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                      <Lock className="w-4 h-4 text-white/10 group-focus-within/input:text-blue-400 transition-colors" />
                    </div>
                    <Input
                      type="password"
                      placeholder="Encryption Key (Password)"
                      className="h-16 pl-14 bg-white/[0.03] border-white/10 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all rounded-2xl font-bold text-[13px] placeholder:text-white/5 text-white"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full h-16 rounded-2xl font-black uppercase tracking-[0.3em] text-xs bg-white text-black hover:bg-blue-600 hover:text-white transition-all duration-700 shadow-[0_20px_40px_rgba(0,0,0,0.4)] disabled:opacity-50 active:scale-[0.98]"
                >
                  {loading ? "Establishing Neural Link..." : (isLogin ? "Authenticate →" : "Register Node →")}
                </Button>
              </form>

              <div className="relative my-12">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/5"></span>
                </div>
                <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.5em]">
                  <span className="bg-[#080f1a] px-5 text-white/10">Access Gateway</span>
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleSocialLogin}
                  disabled={socialLoading}
                  className="w-full flex items-center justify-center gap-4 bg-white text-zinc-900 h-16 rounded-2xl font-bold uppercase tracking-widest text-[11px] shadow-2xl transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 group"
                >
                  <div className="transition-transform group-hover:scale-110 duration-500">
                    <GoogleIcon />
                  </div>
                  <span>
                    {socialLoading ? "Synchronizing..." : "Sign up with Google"}
                  </span>
                </button>
              </div>

              <div className="mt-12 text-center">
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="group inline-flex items-center gap-3 text-white/20 hover:text-cyan-400 transition-all duration-500"
                >
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                    {isLogin ? "Missing Identity? Construct Profile" : "Existing Identity? Initiate Sync"}
                  </span>
                  <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-cyan-500/20 group-hover:rotate-45 transition-all">
                    <Zap className="w-3 h-3 text-white/40 group-hover:text-cyan-400" />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer info */}
        <div className="mt-14 flex flex-col items-center gap-4">
           <div className="h-[1px] w-12 bg-white/10" />
           <p className="text-[9px] font-black uppercase tracking-[0.6em] text-white/5 text-center">
             Neural Authentication System v8.4 <br/>
             © 2026 JARVIS HUB ENTERPRISE
           </p>
        </div>
      </div>
      
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(30px) rotate(-10deg); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 10s ease-in-out infinite; }
        
        @keyframes scanning {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        .scanning-line {
          animation: scanning 3s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Auth;
