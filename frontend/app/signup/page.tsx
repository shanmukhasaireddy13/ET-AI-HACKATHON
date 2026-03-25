"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowRight, CheckCircle2, Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { TypingQuote } from "@/components/ui/typing-quote";
import { PasswordStrength } from "@/components/ui/password-strength";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { signup } from "@/app/actions/auth";

// Zod Schema
const signupSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  company: z.string().min(1, "Company name is required"),
  role: z.string().min(1, "Please select a role"),
  terms: z.boolean().refine(val => val === true, "You must agree to the terms")
});

type SignupFormValues = z.infer<typeof signupSchema>;

const SIGNUP_QUOTES = [
  {
    text: "Our post-meeting Jira grooming used to take 45 minutes. Now it's automatic.",
    author: "Marcus T.",
    role: "VP Engineering",
    company: "Vercel"
  },
  {
    text: "I opened Jira and the tickets were already there. I thought someone on the team did it.",
    author: "Priya S.",
    role: "Head of Product",
    company: "Linear"
  },
  {
    text: "Every decision from our planning call was extracted perfectly. Zero missed items.",
    author: "David L.",
    role: "Engineering Manager",
    company: "Notion"
  },
  {
    text: "The approval queue gives me just enough control without micromanaging the AI.",
    author: "Anika R.",
    role: "HR Director",
    company: "Stripe"
  }
];

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors, isValid }, watch, setValue } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    mode: "onChange",
    defaultValues: {
      terms: false,
      role: ""
    }
  });

  const passwordValue = watch("password");

  const onSubmit = async (data: SignupFormValues) => {
    setIsLoading(true);
    
    const formData = new FormData();
    formData.append('email', data.email);
    formData.append('password', data.password);
    formData.append('firstName', data.firstName);
    formData.append('lastName', data.lastName);

    const result = await signup(formData);

    setIsLoading(false);
    
    if (result && !result.success) {
      console.error(result.error);
    } else {
      setIsSuccess(true);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="bg-white p-12 rounded-xl shadow-lg border border-border-custom text-center max-w-md">
          <div className="w-16 h-16 bg-green-light rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold font-sans text-black mb-4">Account Created!</h2>
          <p className="text-body mb-8">Please check your email to verify your account and start your 14-day free trial.</p>
          <Link href="/login">
            <Button className="w-full bg-blue hover:bg-blue-hover text-white">Continue to Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans">
      {/* LEFT PANEL */}
      <div className="hidden md:flex md:w-1/2 relative bg-gradient-to-br from-[#1E3A8A] via-[#2563EB] to-[#1D4ED8] p-12 flex-col justify-between overflow-hidden">
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
          <TypingQuote quotes={SIGNUP_QUOTES} />
        </div>

        {/* Bottom Trust Pills */}
        <div className="relative z-10 flex flex-wrap gap-3">
          {["✓ SOC 2 Compliant", "✓ GDPR Ready", "✓ 99.9% Uptime"].map((trustBadge) => (
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
              <span className="text-sm text-muted-text mr-2">Already have an account?</span>
              <Link href="/login" className="text-sm text-blue font-medium hover:underline">Sign in &rarr;</Link>
            </div>
          </div>

          <div className="mb-6 mt-4 md:mt-0">
            <h1 className="text-[26px] font-bold text-black mb-1.5">Create your account</h1>
            <p className="text-[14px] text-muted-text">Start your 14-day free trial. No credit card required.</p>
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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Input placeholder="First Name" className={`h-11 ${errors.firstName ? 'border-red-500 bg-red-50 focus-visible:ring-red-500' : 'focus-visible:ring-blue'}`} {...register("firstName")} />
                {errors.firstName && <span className="text-red-500 text-xs block">{errors.firstName.message}</span>}
              </div>
              <div className="space-y-1.5">
                <Input placeholder="Last Name" className={`h-11 ${errors.lastName ? 'border-red-500 bg-red-50 focus-visible:ring-red-500' : 'focus-visible:ring-blue'}`} {...register("lastName")} />
                {errors.lastName && <span className="text-red-500 text-xs block">{errors.lastName.message}</span>}
              </div>
            </div>

            <div className="space-y-1.5">
              <Input type="email" placeholder="Work Email (e.g. sarah@company.com)" className={`h-11 ${errors.email ? 'border-red-500 bg-red-50 focus-visible:ring-red-500' : 'focus-visible:ring-blue'}`} {...register("email")} />
              {errors.email ? (
                <span className="text-red-500 text-xs block">{errors.email.message}</span>
              ) : (
                <span className="text-slate-400 text-[12px] block">Use your work email for team features</span>
              )}
            </div>

            <div className="space-y-1.5 relative">
              <div className="relative">
                <Input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Create a password" 
                  className={`h-11 pr-10 ${errors.password ? 'border-red-500 bg-red-50 focus-visible:ring-red-500' : 'focus-visible:ring-blue'}`} 
                  {...register("password")} 
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-text hover:text-black transition-colors" tabIndex={-1}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <PasswordStrength password={passwordValue} />
              {errors.password && <span className="text-red-500 text-xs block">{errors.password.message}</span>}
            </div>

            <div className="space-y-1.5">
              <Input placeholder="Company Name (e.g. Acme Inc.)" className={`h-11 ${errors.company ? 'border-red-500 bg-red-50 focus-visible:ring-red-500' : 'focus-visible:ring-blue'}`} {...register("company")} />
              {errors.company && <span className="text-red-500 text-xs block">{errors.company.message}</span>}
            </div>

            <div className="space-y-1.5">
              <Select onValueChange={(val: string | null) => val && setValue("role", val, { shouldValidate: true })}>
                <SelectTrigger className={`h-11 text-body ${errors.role ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'focus:ring-blue'}`}>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Engineering Manager">Engineering Manager</SelectItem>
                  <SelectItem value="Product Manager">Product Manager</SelectItem>
                  <SelectItem value="HR Manager">HR Manager</SelectItem>
                  <SelectItem value="Team Lead">Team Lead</SelectItem>
                  <SelectItem value="Director / VP">Director / VP</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && <span className="text-red-500 text-xs block">{errors.role.message}</span>}
            </div>

            <div className="flex items-start gap-3 mt-6">
              <Checkbox 
                id="terms" 
                className="mt-1 data-[state=checked]:bg-blue data-[state=checked]:border-blue" 
                onCheckedChange={(checked) => setValue("terms", checked as boolean, { shouldValidate: true })}
              />
              <label htmlFor="terms" className="text-[13px] leading-relaxed text-muted-text cursor-pointer select-none">
                I agree to the <Link href="/terms" className="text-blue hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-blue hover:underline">Privacy Policy</Link>
              </label>
            </div>
            {errors.terms && <span className="text-red-500 text-xs block ml-7">{errors.terms.message}</span>}

            <Button 
              type="submit" 
              disabled={isLoading || !isValid} 
              className={`w-full h-11 mt-4 bg-primary hover:bg-blue-hover text-white text-[15px] font-semibold tracking-wide transition-all group ${!isValid && "opacity-50 cursor-not-allowed"}`}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>Create Account <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" /></>
              )}
            </Button>

          </form>

          <div className="mt-6 flex items-center justify-center gap-2 text-[12px] text-slate-400">
            <Lock className="w-3.5 h-3.5" />
            Your data is encrypted and never sold.
          </div>

        </div>
      </div>
    </div>
  );
}
