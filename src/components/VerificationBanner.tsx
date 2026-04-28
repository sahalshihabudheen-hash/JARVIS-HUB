import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "./ui/button";
import { Mail, AlertCircle, RefreshCw, X } from "lucide-react";
import { toast } from "sonner";
import { sendEmailVerification } from "firebase/auth";
import { auth } from "@/lib/firebase";

const VerificationBanner = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Don't show if user is verified, not logged in, or banner dismissed
  if (!user || user.emailVerified || dismissed) return null;

  const handleResend = async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    try {
      await sendEmailVerification(auth.currentUser);
      toast.success("Verification protocol resent!", {
        description: "Check your inbox and spam folder for the secure link."
      });
    } catch (err: any) {
      console.error("Resend error:", err);
      toast.error("Protocol failed: " + (err.message || "Unable to send email."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] w-[90%] max-w-2xl animate-in slide-in-from-top-4 duration-500">
      <div className="glass border border-blue-500/30 bg-blue-500/10 backdrop-blur-xl p-4 rounded-2xl flex items-center justify-between gap-4 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0">
            <Mail className="w-5 h-5 text-blue-400" />
          </div>
          <div className="flex flex-col">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              Identity Verification Pending
              <AlertCircle className="w-3 h-3 text-blue-400" />
            </h4>
            <p className="text-xs text-white/60">
              Please verify your email to unlock all premium features and secure your account.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleResend}
            disabled={loading}
            className="h-9 rounded-full bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 text-[10px] font-bold uppercase tracking-widest px-4"
          >
            {loading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              "Resend Link"
            )}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setDismissed(true)}
            className="h-9 w-9 rounded-full text-white/20 hover:text-white/60 hover:bg-white/5"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VerificationBanner;
