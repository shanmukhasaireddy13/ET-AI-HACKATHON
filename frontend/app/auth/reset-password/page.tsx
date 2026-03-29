"use client";

import { useState } from "react";
import { ArrowRight, Eye, EyeOff, Loader2, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordStrength } from "@/components/ui/password-strength";
import { updatePassword } from "@/app/actions/auth";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 8) return;

    setIsLoading(true);
    setErrorMsg("");
    
    const formData = new FormData();
    formData.append("password", password);
    
    const result = await updatePassword(formData);
    
    if (result && !result.success) {
      setErrorMsg(result.error as string);
      setIsLoading(false);
    }
    // On success, updatePassword server action redirects to dashboard.
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface font-sans">
      <div className="bg-white p-10 rounded-xl shadow-sm border border-border-custom w-full max-w-[400px] mx-4 relative">
        <div className="mb-8">
          <div className="w-12 h-12 bg-blue/10 rounded-full flex items-center justify-center mb-5">
            <KeyRound className="w-5 h-5 text-blue" />
          </div>
          <h1 className="text-[24px] font-bold text-black mb-2">Set new password</h1>
          <p className="text-[14px] text-muted-text">Your new password must be securely formed.</p>
        </div>

        {errorMsg && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-3 text-[13px] text-red-600">
            {errorMsg}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-1.5 relative">
            <label className="text-[14px] font-medium text-black">New Password</label>
            <div className="relative">
              <Input 
                type={showPassword ? "text" : "password"} 
                placeholder="Must be at least 8 characters" 
                className="h-11 pr-10 focus-visible:ring-blue"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-text hover:text-black transition-colors" 
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="pt-2">
              <PasswordStrength password={password} />
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={isLoading || password.length < 8} 
            className="w-full h-11 bg-primary hover:bg-blue-hover text-white text-[15px] font-semibold tracking-wide"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Reset password"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
