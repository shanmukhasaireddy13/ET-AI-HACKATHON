"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowRight, Eye, EyeOff, Loader2, KeyRound, AlertTriangle } from "lucide-react";
import { TypingQuote } from "@/components/ui/typing-quote";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { login } from "@/app/actions/auth";

// Zod Schema
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LOGIN_QUOTES = [
  {
    text: "I check the task board before Slack now. Everything I need is already there.",
    author: "James P.",
    role: "Product Lead",
    company: "Figma"
  },
  {
    text: "Three months in — we've saved over 40 hours of manual follow-up work.",
    author: "Elena M.",
    role: "Operations Manager",
    company: "Loom"
  },
  {
    text: "My agents handle the boring parts. I handle the decisions.",
    author: "Rajan K.",
    role: "CTO",
    company: "Ditto"
  },
  {
    text: "The approval queue is the killer feature. I trust the AI, but it still asks first.",
    author: "Tara W.",
    role: "Director of Engineering",
    company: "Atlassian"
  }
];

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState(false);

  const { register, handleSubmit, formState: { errors, isValid } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: { rememberMe: false }
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setLoginError(false);
    
    const formData = new FormData();
    formData.append('email', data.email);
    formData.append('password', data.password);

    const result = await login(formData);
    
    if (result && !result.success) {
      setLoginError(true);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans">
      {/* LEFT PANEL */}
      <div className="hidden md:flex md:w-1/2 relative bg-gradient-to-br from-[#1E293B] via-[#1E3A8A] to-[#2563EB] p-12 flex-col justify-between overflow-hidden">
        {/* Subtle noise overlay */}
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')" }}></div>
        
        {/* Logo */}
        <div className="relative z-10 flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-white text-blue flex items-center justify-center font-bold">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h4l3-9 5 18 3-9h5"/></svg>
          </div>
          <span className="font-semibold text-white text-xl tracking-tight">MeetingMind</span>
        </div>

        {/* Center Auto-typing Quote */}
        <div className="relative z-10 my-auto pt-10">
          <TypingQuote quotes={LOGIN_QUOTES} />
        </div>

        {/* Bottom Trust Pills */}
        <div className="relative z-10 flex flex-wrap gap-3">
          {["⚡ 60s Avg Analysis", "🤖 7 Specialized Agents", "🔗 50+ Integrations"].map((trustBadge) => (
            <div key={trustBadge} className="border border-white/20 bg-white/5 rounded-[20px] text-white text-xs px-3.5 py-1.5 backdrop-blur-sm">
              {trustBadge}
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-full md:w-1/2 flex flex-col justify-center bg-white p-6 md:p-10 lg:p-16 overflow-y-auto h-[100dvh] relative">
        <div className="max-w-[440px] w-full mx-auto pb-6">
          
          <div className="flex justify-between items-center mb-6 md:absolute md:top-8 md:right-10 md:w-auto w-full md:mb-0">
            <div className="md:hidden flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-blue flex items-center justify-center font-bold text-white text-xs">M</div>
            </div>
            <div className="text-right">
              <span className="text-sm text-muted-text mr-2">Don&apos;t have an account?</span>
              <Link href="/signup" className="text-sm text-blue font-medium hover:underline">Start free trial &rarr;</Link>
            </div>
          </div>

          <div className="mb-6 mt-4 md:mt-0">
            <h1 className="text-[26px] font-bold text-black mb-1.5">Welcome back</h1>
            <p className="text-[14px] text-muted-text">Sign in to your MeetingMind workspace</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <Button variant="outline" className="flex-1 justify-center gap-2 h-10 bg-white hover:bg-surface border-border-custom font-normal text-sm">
              <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg"><g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)"><path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/><path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/><path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/><path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/></g></svg>
              Google
            </Button>
            <Button variant="outline" className="flex-1 justify-center gap-2 h-10 bg-white hover:bg-surface border-border-custom font-normal text-sm">
              <svg viewBox="0 0 21 21" width="16" height="16" xmlns="http://www.w3.org/2000/svg"><path d="m10 0h-10v10h10zm11 0h-10v10h10zm-11 11h-10v10h10zm11 0h-10v10h10z" fill="#f25022"/></svg>
              Microsoft
            </Button>
          </div>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-border-custom"></div>
            <span className="text-muted-text text-[12px] bg-white px-2">or</span>
            <div className="flex-1 h-px bg-border-custom"></div>
          </div>

          {/* Error Banner */}
          {loginError && (
            <div className="mb-6 bg-red-light border border-red-200 rounded-md p-3.5 flex items-start gap-3 animate-fade-in-up">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
              <p className="text-[14px] text-red-800 leading-snug">
                Incorrect email or password. Try again or reset your password.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <Input type="email" placeholder="you@company.com" className={`h-11 ${errors.email ? 'border-red-500 bg-red-50 focus-visible:ring-red-500' : 'focus-visible:ring-blue'}`} {...register("email")} />
              {errors.email && <span className="text-red-500 text-xs block">{errors.email.message}</span>}
            </div>

            <div className="space-y-1.5 relative">
              <div className="relative">
                <Input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Enter your password" 
                  className={`h-11 pr-10 ${errors.password ? 'border-red-500 bg-red-50 focus-visible:ring-red-500' : 'focus-visible:ring-blue'}`} 
                  {...register("password")} 
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-text hover:text-black transition-colors" tabIndex={-1}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <span className="text-red-500 text-xs block">{errors.password.message}</span>}
            </div>

            <div className="flex items-center justify-between mt-6">
              <div className="flex items-center gap-2">
                <Checkbox id="rememberMe" className="data-[state=checked]:bg-blue data-[state=checked]:border-blue" {...register("rememberMe")} />
                <label htmlFor="rememberMe" className="text-[13px] text-muted-text cursor-pointer select-none">Remember me for 30 days</label>
              </div>
              <Link href="/forgot-password" className="text-[13px] text-blue hover:underline">Forgot password?</Link>
            </div>

            <Button 
              type="submit" 
              disabled={isLoading || !isValid} 
              className={`w-full h-11 mt-4 bg-primary hover:bg-blue-hover text-white text-[15px] font-semibold tracking-wide transition-all group ${!isValid && "opacity-50 cursor-not-allowed"}`}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" /></>
              )}
            </Button>
          </form>

          {/* SSO / Enterprise Section */}
          <div className="mt-8 pt-8 border-t border-border-custom">
            <div className="relative flex items-center justify-center mb-6">
               <span className="bg-white px-2 text-[13px] text-muted-text absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 uppercase tracking-wide font-medium">For enterprise teams</span>
            </div>
            
            <Button variant="outline" className="w-full justify-center gap-2 h-11 bg-white hover:bg-surface border-border-custom font-medium text-body">
              <KeyRound className="w-4 h-4" /> Sign in with SSO
            </Button>
            <p className="text-center text-[12px] text-slate-400 mt-3">Using Okta, Azure AD, or Google Workspace?</p>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-[12px] text-slate-400">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            Secured with 256-bit encryption &middot; SOC 2 Type II
          </div>

        </div>
      </div>
    </div>
  );
}
