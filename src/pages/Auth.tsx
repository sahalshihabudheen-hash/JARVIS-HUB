import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Chrome, ArrowLeft, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import Footer from "@/components/Footer";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [socialLoading, setSocialLoading] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [userInputOtp, setUserInputOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const generateAndSendOTP = async () => {
    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setVerificationCode(code);
    
    setIsVerifying(true);
    
    // JARVIS UI Simulation of sending
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: 'JARVIS: Dispatching Encrypted OTP to your email...',
        success: 'JARVIS: Verification Code sent to your terminal.',
        error: 'Failed to dispatch security code.',
      }
    );

    // LOG FOR TESTING (Since we don't have user's EmailJS keys yet)
    console.log("----------------------------");
    console.log(`JARVIS SECURITY CODE: ${code}`);
    console.log("----------------------------");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Custom admin logic
    if (email.toLowerCase() === "admin@gmail.com") {
      if (password !== "jarvisadmin") {
        toast.error("Access Denied: Invalid admin credentials");
        return;
      }
      // Admins bypass OTP
      await login(email);
      toast.success("Welcome back to JARVIS HUB!");
      navigate("/");
      return;
    }

    if (!isLogin && !otpStep) {
      // Start registration flow with OTP
      await generateAndSendOTP();
      setOtpStep(true);
      return;
    }

    // Authenticate (Login or finishing signup)
    await login(email);
    toast.success(isLogin ? "Welcome back to JARVIS HUB!" : "Account created successfully!");
    navigate("/");
  };

  const verifyOTPAndLogin = async () => {
    if (userInputOtp === verificationCode) {
      setIsVerifying(false);
      await login(email);
      toast.success("Identity Verified. Account Initialized.");
      navigate("/");
    } else {
      toast.error("Invalid Security Code. Please retry.");
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
      await login(user.email || "unknown@google.com", user.displayName || undefined, user.photoURL || undefined);
      toast.success(`Welcome, ${user.displayName || "User"}!`);
      navigate("/");
    } catch (error: any) {
      // Silently ignore when user closes the popup or clicks again
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
              className="w-16 h-16 object-cover rounded-full mb-4 shadow-[0_0_20px_rgba(34,211,238,0.3)] animate-pulse"
            />
            <h1 className="text-3xl font-display font-bold tracking-tighter mb-2">
              JARVIS<span className="text-primary ml-1">HUB</span>
            </h1>
            <p className="text-muted-foreground text-sm">
              {isLogin ? "Access your secure media hub" : "Initialize your viewer credentials"}
            </p>
          </div>

          {otpStep ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center">
                <h2 className="text-lg font-bold mb-2">VERIFY IDENTITY</h2>
                <p className="text-xs text-muted-foreground">
                  A 6-digit security code has been sent to <br/>
                  <span className="text-blue-400 font-bold">{email}</span>
                </p>
              </div>

              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={userInputOtp}
                  onChange={(value) => setUserInputOtp(value)}
                  pattern={REGEXP_ONLY_DIGITS}
                >
                  <InputOTPGroup className="gap-2">
                    <InputOTPSlot index={0} className="rounded-xl border-white/10 bg-white/5 w-11 h-12" />
                    <InputOTPSlot index={1} className="rounded-xl border-white/10 bg-white/5 w-11 h-12" />
                    <InputOTPSlot index={2} className="rounded-xl border-white/10 bg-white/5 w-11 h-12" />
                    <InputOTPSlot index={3} className="rounded-xl border-white/10 bg-white/5 w-11 h-12" />
                    <InputOTPSlot index={4} className="rounded-xl border-white/10 bg-white/5 w-11 h-12" />
                    <InputOTPSlot index={5} className="rounded-xl border-white/10 bg-white/5 w-11 h-12" />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={verifyOTPAndLogin}
                  className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold"
                  disabled={userInputOtp.length !== 6}
                >
                  Confirm Protocols
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => setOtpStep(false)}
                  className="w-full text-xs text-muted-foreground hover:text-white"
                >
                  Back to Registration
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Intelligence ID (Email)"
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
          )}

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">External Auth Protocols</span>
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              variant="outline"
              className="w-full bg-white/5 border-white/10 hover:bg-white/10 rounded-xl h-12 hover-glow transition-all disabled:opacity-50"
              onClick={handleSocialLogin}
              disabled={socialLoading}
            >
              <Chrome className="w-5 h-5 mr-3 text-blue-400" />
              {socialLoading ? "Signing in..." : "Continue with Google"}
            </Button>
          </div>

          <div className="mt-8 text-center text-sm">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-muted-foreground hover:text-primary transition-colors underline underline-offset-4"
            >
              {isLogin ? "Need a new access ID?" : "Already have credentials? Access here"}
            </button>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 w-full">
        <Footer />
      </div>
    </div>
  );
};

export default Auth;
