"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resetPassword } from "@/app/actions/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setErrorMsg("");
    
    const formData = new FormData();
    formData.append("email", email);
    
    const result = await resetPassword(formData);
    
    setIsLoading(false);
    if (result && !result.success) {
      setErrorMsg(result.error as string);
    } else {
      setIsSuccess(true);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface font-sans">
        <div className="bg-white p-10 rounded-xl shadow-sm border border-border-custom text-center max-w-[400px] w-full mx-4">
          <div className="w-14 h-14 bg-blue/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-6 h-6 text-blue" />
          </div>
          <h2 className="text-[22px] font-bold text-black mb-3">Check your email</h2>
          <p className="text-[14px] text-muted-text mb-8">
            We've sent a password reset link to <span className="font-medium text-black">{email}</span>.
          </p>
          <Link href="/login">
            <Button variant="outline" className="w-full">Return to log in</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface font-sans">
      <div className="bg-white p-10 rounded-xl shadow-sm border border-border-custom w-full max-w-[400px] mx-4 relative">
        <div className="mb-8">
          <h1 className="text-[24px] font-bold text-black mb-2">Forgot password?</h1>
          <p className="text-[14px] text-muted-text">No worries, we'll send you reset instructions.</p>
        </div>

        {errorMsg && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-3 text-[13px] text-red-600">
            {errorMsg}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[14px] font-medium text-black">Email</label>
            <Input 
              type="email" 
              placeholder="Enter your email" 
              className="h-11 focus-visible:ring-blue"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <Button 
            type="submit" 
            disabled={isLoading || !email} 
            className="w-full h-11 bg-primary hover:bg-blue-hover text-white text-[15px] font-semibold tracking-wide"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Reset password"
            )}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <Link href="/login" className="text-[14px] text-muted-text hover:text-black flex items-center justify-center gap-2">
            <ArrowRight className="w-4 h-4 rotate-180" /> Back to log in
          </Link>
        </div>
      </div>
    </div>
  );
}
