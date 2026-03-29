"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Play, CheckCircle2, ChevronRight, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white selection:bg-primary-light selection:text-blue">
      {/* SECTION 1 — Navigation Bar */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 border-b border-border-custom bg-white/80 backdrop-blur-md ${
          scrolled ? "shadow-[0_1px_12px_rgba(0,0,0,0.08)]" : ""
        }`}
      >
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-primary-light text-blue flex items-center justify-center font-bold">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h4l3-9 5 18 3-9h5"/></svg>
            </div>
            <span className="font-sans font-semibold text-black text-xl tracking-tight">MeetingMind</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            {["Features", "How It Works", "Integrations", "Pricing", "Changelog"].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`} className="text-[14px] text-muted-text hover:text-blue font-medium transition-colors relative group">
                {item}
                <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-blue hover:bg-primary-light hover:text-blue-hover font-medium">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-primary hover:bg-primary-hover text-white shadow-sm">Start Free Trial</Button>
            </Link>
          </div>

          <button className="md:hidden text-black" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* SECTION 2 — Hero Section */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-32 px-6 flex flex-col items-center text-center overflow-hidden">
        <motion.div 
          initial="hidden" animate="visible" variants={staggerContainer}
          className="max-w-[800px] w-full flex flex-col items-center z-10"
        >
          <motion.div variants={fadeInUp} className="mb-8 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-mid bg-primary-light text-blue text-[13px] font-medium hover:border-blue transition-colors cursor-pointer">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            New — Jira & Slack Integration Now Live
            <ArrowRight className="w-3 h-3 ml-1" />
          </motion.div>

          <motion.h1 variants={fadeInUp} className="text-black text-[40px] md:text-[64px] font-sans font-bold leading-[1.1] tracking-tight mb-6">
            Turn Every Meeting Into<br />
            <span className="font-serif italic font-normal text-blue pr-2">Actionable Intelligence.</span>
          </motion.h1>

          <motion.p variants={fadeInUp} className="text-[18px] text-muted-text max-w-[560px] leading-[1.7] mb-10">
            Upload your meeting transcript. Our AI agents extract decisions, generate tasks, assign them to your team, and push to Jira — all in under 60 seconds.
          </motion.p>

          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 mb-6">
            <Link href="/signup">
              <Button className="bg-primary hover:bg-primary-hover text-white px-8 py-6 text-[16px] rounded-md shadow-[0_0_20px_rgba(37,99,235,0.4)] animate-pulse-glow group">
                Start Free Trial
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button variant="outline" className="px-8 py-6 text-[16px] text-body border-border-custom hover:bg-surface">
              <Play className="w-4 h-4 mr-2" fill="currentColor" /> Watch Demo
            </Button>
          </motion.div>

          <motion.p variants={fadeInUp} className="text-[13px] text-slate-400 mb-16">
            No credit card required · 14-day free trial · Cancel anytime
          </motion.p>

          <motion.div variants={fadeInUp} className="w-full flex flex-col items-center">
            <p className="text-[13px] text-muted-text mb-6">Trusted by teams at</p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-12 opacity-60 grayscale">
              {["Stripe", "Vercel", "Notion", "Linear", "Figma"].map(logo => (
                <span key={logo} className="text-xl font-bold text-slate-600 hover:text-black hover:grayscale-0 transition-all cursor-default">{logo}</span>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Hero Visual Mockup */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 1 }}
          className="w-full max-w-[1000px] mt-24 relative"
        >
          <div className="w-full aspect-[16/9] bg-surface rounded-xl border border-border-custom shadow-[0_24px_80px_rgba(0,0,0,0.12)] overflow-hidden relative">
            {/* Fake browser chrome */}
            <div className="h-10 border-b border-border-custom bg-white flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-orange-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
              <div className="mx-auto h-6 w-1/2 bg-surface rounded-md border border-border-custom"></div>
            </div>
            {/* Fake App content */}
            <div className="p-8 flex gap-6 h-full">
               <div className="w-64 h-full bg-white rounded-lg border border-border-custom flex flex-col gap-3 p-4">
                 <div className="h-8 w-1/2 bg-surface rounded"></div>
                 <div className="h-12 w-full bg-primary-light rounded border border-blue-mid"></div>
                 <div className="h-12 w-full bg-surface rounded"></div>
               </div>
               <div className="flex-1 flex flex-col gap-4">
                 <div className="h-32 w-full bg-white rounded-lg border border-border-custom p-6 flex flex-col gap-2">
                   <div className="h-6 w-1/3 bg-surface border-border-custom border"></div>
                   <div className="h-4 w-2/3 bg-surface border-border-custom border"></div>
                 </div>
                 <div className="h-48 w-full bg-white rounded-lg border border-border-custom relative overflow-hidden">
                    <div className="absolute top-4 right-4 text-xs font-mono text-blue bg-primary-light px-2 py-1 rounded">Agent active</div>
                 </div>
               </div>
            </div>
          </div>

          {/* Floating Badges */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.2 }}
            className="absolute -bottom-6 -left-6 bg-white border border-border-custom rounded-lg p-3 shadow-lg flex items-center gap-3 z-20"
          >
            <div className="bg-green-light p-1.5 rounded-full"><CheckCircle2 className="w-4 h-4 text-green-600" /></div>
            <span className="text-sm font-medium text-black">14 tasks created</span>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.4 }}
            className="absolute -bottom-10 right-10 bg-white border border-border-custom rounded-lg p-3 shadow-lg flex items-center gap-3 z-20"
          >
            <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center text-white text-xs font-bold">J</div>
            <span className="text-sm font-medium text-black">Pushed to Jira</span>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.6 }}
            className="absolute top-10 -right-8 bg-white border border-border-custom rounded-lg p-3 shadow-lg flex items-center gap-3 z-20"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-orange"></span>
            </span>
            <span className="text-sm font-medium text-black">3 agents running</span>
          </motion.div>
        </motion.div>
      </section>

      {/* SECTION 3 — Stats Bar */}
      <section className="bg-surface border-y border-border-custom py-20 px-6">
        <div className="max-w-[1000px] mx-auto flex flex-col md:flex-row justify-between gap-12 md:gap-6 text-center">
          {[
            { num: "12,000+", label: "Meetings Analysed" },
            { num: "98%", label: "Accuracy Rate" },
            { num: "60s", label: "Avg. Analysis Time" },
            { num: "50+", label: "Integrations Supported" }
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
              className={`flex-1 ${i !== 3 ? 'md:border-r border-border-custom' : ''}`}
            >
              <div className="text-[36px] font-bold text-black mb-1">{stat.num}</div>
              <div className="text-[14px] text-muted-text">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION 4 — How It Works */}
      <section id="how it works" className="py-24 px-6 max-w-[1200px] mx-auto">
        <div className="text-center mb-16">
          <p className="text-[11px] font-bold tracking-[0.1em] text-blue uppercase mb-4">How It Works</p>
          <h2 className="text-[38px] font-bold text-black max-w-[500px] mx-auto leading-tight">
            From transcript to task board in three steps.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connector dashed line for desktop */}
          <div className="hidden md:block absolute top-[48px] left-[15%] right-[15%] border-t border-dashed border-blue-mid z-0 h-1"></div>

          {[
            {
              id: "01",
              title: "Upload Your Transcript",
              body: "Paste or upload any meeting transcript — Zoom, Teams, Google Meet, .txt, .pdf, or .vtt caption files.",
              icon: <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center text-blue mb-6"><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg></div>
            },
            {
              id: "02",
              title: "AI Agents Analyse Everything",
              body: "Our multi-agent pipeline extracts decisions, action items, priorities, and assigns each task to the right person.",
              icon: <div className="w-10 h-10 bg-orange-light rounded-lg flex items-center justify-center text-orange mb-6"><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect width="18" height="10" x="3" y="11" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" x2="8" y1="16" y2="16"/><line x1="16" x2="16" y1="16" y2="16"/></svg></div>
            },
            {
              id: "03",
              title: "Auto-Push to Your Tools",
              body: "Tasks land in Jira, notifications go via Slack or email — your team is in motion before the meeting room empties.",
              icon: <div className="w-10 h-10 bg-green-light rounded-lg flex items-center justify-center text-green-600 mb-6"><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg></div>
            }
          ].map((step, i) => (
            <motion.div 
              key={step.id} 
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
              variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { delay: i * 0.2, duration: 0.6 } } }}
              className="bg-white border border-border-custom rounded-xl p-8 hover:border-blue-mid hover:shadow-[0_4px_24px_rgba(37,99,235,0.10)] transition-all z-10 relative group"
            >
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-primary-light text-blue font-bold rounded-lg flex items-center justify-center text-[14px]">
                {step.id}
              </div>
              {step.icon}
              <h3 className="text-[20px] font-bold text-black mb-3">{step.title}</h3>
              <p className="text-body leading-relaxed">{step.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION 5 — Feature Showcase */}
      <section id="features" className="py-24 px-6 overflow-hidden">
        <div className="max-w-[1200px] mx-auto flex flex-col gap-32">
          
          {/* Feature 1 */}
          <div className="flex flex-col md:flex-row items-center gap-16">
            <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex-1 w-full bg-surface rounded-2xl aspect-square border border-border-custom relative overflow-hidden flex items-center justify-center">
               <div className="w-[80%] h-[80%] bg-white rounded-xl shadow-sm border border-border-custom flex items-center justify-center">
                  <span className="text-muted-text">[Agent Pipeline Animation SVG]</span>
               </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex-1">
              <p className="text-[11px] font-bold tracking-[0.1em] text-blue uppercase mb-4">Multi-Agent AI</p>
              <h3 className="text-[36px] font-bold text-black mb-4">Watch agents work in real time</h3>
              <p className="text-[18px] text-body mb-8 leading-relaxed">
                Each agent has a specialised role — parsing, extracting, assigning, integrating. You see every step, and approve critical actions before they execute.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-body"><div className="w-2 h-2 rounded-full bg-primary"></div> Live agent status stream</li>
                <li className="flex items-center gap-3 text-body"><div className="w-2 h-2 rounded-full bg-green-500"></div> Approve / reject before critical push</li>
                <li className="flex items-center gap-3 text-body"><div className="w-2 h-2 rounded-full bg-orange"></div> Full activity log per agent</li>
              </ul>
            </motion.div>
          </div>

          {/* Feature 2 */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-16">
            <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex-1 w-full bg-surface rounded-2xl aspect-square border border-border-custom relative overflow-hidden flex items-center justify-center">
               <div className="w-[80%] h-[80%] bg-white rounded-xl shadow-sm border border-border-custom flex flex-col">
                  <div className="h-10 border-b border-border-custom px-4 flex items-center font-semibold text-sm">Task Board</div>
                  <div className="p-4 flex gap-4 h-full">
                    <div className="flex-1 bg-surface rounded p-2 h-full"><div className="bg-white p-3 shadow-sm rounded border border-border-custom mb-2 h-20"></div><div className="bg-white p-3 shadow-sm rounded border border-border-custom h-20"></div></div>
                    <div className="flex-1 bg-surface rounded p-2 h-full"><div className="bg-white p-3 shadow-sm rounded border border-border-custom h-24"></div></div>
                    <div className="flex-1 bg-surface rounded p-2 h-full"></div>
                  </div>
               </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex-1">
              <p className="text-[11px] font-bold tracking-[0.1em] text-blue uppercase mb-4">Task Management</p>
              <h3 className="text-[36px] font-bold text-black mb-4">Kanban, table, or calendar — your choice</h3>
              <p className="text-[18px] text-body mb-8 leading-relaxed">
                Every task extracted from a meeting is fully editable, assignable, and trackable. Jira ticket numbers sync back automatically.
              </p>
              <Link href="#" className="text-blue font-medium hover:underline inline-flex items-center group">
                Learn more <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>

          {/* Feature 3 */}
          <div className="flex flex-col md:flex-row items-center gap-16">
            <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex-1 w-full bg-surface rounded-2xl aspect-square border border-border-custom relative overflow-hidden flex items-center justify-center">
               <div className="w-[80%] bg-white rounded-xl shadow-sm border border-border-custom flex flex-col p-4 gap-4">
                  <div className="border border-border-custom rounded-lg p-4 bg-orange-light">
                     <p className="font-semibold text-sm mb-1 text-black">Approve Push to Jira</p>
                     <p className="text-xs text-muted-text mb-3">Agent wants to create 5 tickets in EPIC-39</p>
                     <div className="flex gap-2"><Button size="sm" className="bg-primary text-white w-full">Approve</Button><Button size="sm" variant="outline" className="w-full">Reject</Button></div>
                  </div>
               </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex-1">
              <p className="text-[11px] font-bold tracking-[0.1em] text-blue uppercase mb-4">Controls & Oversight</p>
              <h3 className="text-[36px] font-bold text-black mb-4">You stay in control. Always.</h3>
              <p className="text-[18px] text-body mb-8 leading-relaxed">
                Critical agent actions — creating epics, bulk-assigning work, sending external messages — require your approval first. No agent acts above your authority.
              </p>
            </motion.div>
          </div>

        </div>
      </section>

      {/* SECTION 6 — Integrations */}
      <section id="integrations" className="bg-surface py-24 px-6 border-y border-border-custom">
        <div className="max-w-[1000px] mx-auto text-center">
          <h2 className="text-[32px] md:text-[38px] font-bold text-black mb-16">
            Connects to the tools your team already uses.
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {["Jira", "Slack", "GitHub", "Notion", "Calendar", "Teams", "Linear", "Asana", "Email", "Zoom"].map((tool, i) => (
              <motion.div 
                key={tool}
                initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                className="bg-white border border-border-custom rounded-[10px] p-5 flex flex-col items-center justify-center gap-3 hover:border-blue hover:shadow-[0_4px_16px_rgba(37,99,235,0.1)] transition-all cursor-pointer"
              >
                <div className="w-10 h-10 bg-surface rounded flex items-center justify-center text-muted-text font-bold text-xs">{tool[0]}</div>
                <span className="text-[13px] text-muted-text">{tool}</span>
              </motion.div>
            ))}
          </div>
          <p className="text-[14px] text-muted-text">
            And <Link href="#" className="text-blue hover:underline">40+ more via API</Link>
          </p>
        </div>
      </section>

      {/* SECTION 7 — Testimonials */}
      <section className="py-24 px-6 max-w-[1200px] mx-auto">
        <div className="grid md:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-white border border-border-custom rounded-xl p-7 relative">
            <div className="flex gap-1 text-orange mb-6">★★★★★</div>
            <p className="text-[15px] italic text-body leading-[1.7] mb-8">
             &quot;We used to spend 30 minutes after every meeting manually distributing tasks. MeetingMind does it while the call is still ending.&quot;
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-mid flex items-center justify-center text-blue font-bold">SK</div>
              <div>
                <p className="text-[14px] font-bold text-black">Sarah K.</p>
                <p className="text-[13px] text-muted-text">Engineering Manager @ Stripe</p>
              </div>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="bg-white border border-border-custom rounded-xl p-7 relative">
            <div className="flex gap-1 text-orange mb-6">★★★★★</div>
            <p className="text-[15px] italic text-body leading-[1.7] mb-8">
             &quot;I opened Jira and the tickets were already there. I thought someone on the team did it. Unbelievable.&quot;
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-light border border-orange text-orange flex items-center justify-center font-bold">JL</div>
              <div>
                <p className="text-[14px] font-bold text-black">James L.</p>
                <p className="text-[13px] text-muted-text">Product Lead @ Vercel</p>
              </div>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }} className="bg-white border border-border-custom rounded-xl p-7 relative">
            <div className="flex gap-1 text-orange mb-6">★★★★★</div>
            <p className="text-[15px] italic text-body leading-[1.7] mb-8">
             &quot;The approval queue is the killer feature. I trust the AI, but it still asks my permission before writing to our repo issues.&quot;
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-light border border-green-600 text-green-700 flex items-center justify-center font-bold">MR</div>
              <div>
                <p className="text-[14px] font-bold text-black">Maria R.</p>
                <p className="text-[13px] text-muted-text">Director of Ops @ Linear</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 8 — Pricing */}
      <section id="pricing" className="py-24 px-6 max-w-[1200px] mx-auto text-center">
        <h2 className="text-[38px] font-bold text-black mb-16">Simple, transparent pricing.</h2>
        <div className="grid md:grid-cols-3 gap-8 text-left mb-10 max-w-[1000px] mx-auto">
          {/* Plan 1 */}
          <div className="border border-border-custom rounded-xl p-8 bg-white flex flex-col">
            <h3 className="text-[20px] font-bold text-black mb-2">Free</h3>
            <div className="text-[36px] font-bold text-black mb-6">$0<span className="text-[16px] text-muted-text font-normal">/mo</span></div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex gap-2 text-[14px] text-body"><CheckCircle2 className="w-4 h-4 text-blue mt-0.5" /> 5 meetings/mo</li>
              <li className="flex gap-2 text-[14px] text-body"><CheckCircle2 className="w-4 h-4 text-blue mt-0.5" /> 2 agents</li>
              <li className="flex gap-2 text-[14px] text-body"><CheckCircle2 className="w-4 h-4 text-blue mt-0.5" /> Basic integrations</li>
            </ul>
            <Button variant="outline" className="w-full">Get Started</Button>
          </div>
          {/* Plan 2 */}
          <div className="border-2 border-blue rounded-xl p-8 bg-white flex flex-col relative shadow-[0_8px_30px_rgba(37,99,235,0.12)] transform md:-translate-y-4 z-10">
            <div className="absolute top-0 right-8 -translate-y-1/2 bg-primary text-white text-[12px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">Popular</div>
            <h3 className="text-[20px] font-bold text-black mb-2">Pro ⭐</h3>
            <div className="text-[36px] font-bold text-black mb-6">$29<span className="text-[16px] text-muted-text font-normal">/mo</span></div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex gap-2 text-[14px] text-body"><CheckCircle2 className="w-4 h-4 text-blue mt-0.5" /> Unlimited meetings</li>
              <li className="flex gap-2 text-[14px] text-body"><CheckCircle2 className="w-4 h-4 text-blue mt-0.5" /> All 7 agents</li>
              <li className="flex gap-2 text-[14px] text-body"><CheckCircle2 className="w-4 h-4 text-blue mt-0.5" /> Jira + Slack + Email</li>
              <li className="flex gap-2 text-[14px] text-body"><CheckCircle2 className="w-4 h-4 text-blue mt-0.5" /> Priority support</li>
            </ul>
            <Button className="w-full bg-primary hover:bg-primary-hover text-white">Start Free Trial</Button>
          </div>
          {/* Plan 3 */}
          <div className="border border-border-custom rounded-xl p-8 bg-white flex flex-col">
            <h3 className="text-[20px] font-bold text-black mb-2">Enterprise</h3>
            <div className="text-[36px] font-bold text-black mb-6">Custom</div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex gap-2 text-[14px] text-body"><CheckCircle2 className="w-4 h-4 text-blue mt-0.5" /> Unlimited + SSO</li>
              <li className="flex gap-2 text-[14px] text-body"><CheckCircle2 className="w-4 h-4 text-blue mt-0.5" /> Custom agents</li>
              <li className="flex gap-2 text-[14px] text-body"><CheckCircle2 className="w-4 h-4 text-blue mt-0.5" /> All integrations + API</li>
              <li className="flex gap-2 text-[14px] text-body"><CheckCircle2 className="w-4 h-4 text-blue mt-0.5" /> Dedicated manager</li>
            </ul>
            <Button variant="outline" className="w-full">Contact Sales</Button>
          </div>
        </div>
        <p className="text-[14px] text-muted-text">All plans include 14-day free trial. No credit card required.</p>
      </section>

      {/* SECTION 9 — Final CTA */}
      <section className="bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] py-24 px-6 text-center text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-[700px] mx-auto relative z-10">
          <h2 className="text-[36px] md:text-[42px] font-bold mb-6 leading-tight">Ready to never write meeting notes again?</h2>
          <p className="text-[18px] text-white/75 mb-10">Start your free trial in 30 seconds.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/signup">
              <Button className="bg-white text-blue hover:bg-surface px-8 py-6 text-[16px] font-bold w-full sm:w-auto">Start Free Trial <ArrowRight className="w-4 h-4 ml-2" /></Button>
            </Link>
            <Button variant="outline" className="text-white border-white/30 hover:bg-white/10 px-8 py-6 text-[16px] w-full sm:w-auto">Talk to Sales</Button>
          </div>
        </motion.div>
      </section>

      {/* SECTION 10 — Footer */}
      <footer className="bg-[#0F172A] text-white pt-20 pb-8 px-6 text-sm">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-16">
            <div className="col-span-2 md:col-span-1 border-r border-white/10 pr-6">
              <div className="flex items-center gap-2 mb-4">
               <div className="w-6 h-6 rounded bg-primary text-white flex items-center justify-center font-bold text-xs">M</div>
               <span className="font-semibold text-lg">MeetingMind</span>
              </div>
              <p className="text-white/60 mb-6 leading-relaxed">Making meetings actionable with multi-agent AI.</p>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-white">Product</h4>
              <ul className="space-y-3 text-white/60">
                <li><Link href="#" className="hover:text-blue-mid transition-colors">Features</Link></li>
                <li><Link href="#" className="hover:text-blue-mid transition-colors">Changelog</Link></li>
                <li><Link href="#" className="hover:text-blue-mid transition-colors">Roadmap</Link></li>
                <li><Link href="#" className="hover:text-blue-mid transition-colors">Status</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-white">Resources</h4>
              <ul className="space-y-3 text-white/60">
                <li><Link href="#" className="hover:text-blue-mid transition-colors">Docs</Link></li>
                <li><Link href="#" className="hover:text-blue-mid transition-colors">API Reference</Link></li>
                <li><Link href="#" className="hover:text-blue-mid transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-blue-mid transition-colors">Community</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-white">Company</h4>
              <ul className="space-y-3 text-white/60">
                <li><Link href="#" className="hover:text-blue-mid transition-colors">About</Link></li>
                <li><Link href="#" className="hover:text-blue-mid transition-colors">Careers</Link></li>
                <li><Link href="#" className="hover:text-blue-mid transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-blue-mid transition-colors">Terms</Link></li>
              </ul>
            </div>
            <div className="col-span-2 md:col-span-1">
              <h4 className="font-bold mb-4 text-white">Get product updates</h4>
              <div className="flex bg-white/5 rounded p-1 mb-2 border border-white/10 focus-within:border-blue-mid transition-colors">
                <input type="email" placeholder="Email address" className="bg-transparent border-none outline-none text-white px-3 flex-1 w-full text-sm" />
                <Button size="sm" className="bg-primary hover:bg-primary-hover text-white">Subscribe</Button>
              </div>
            </div>
          </div>
          <div className="border-t border-[#1E293B] pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-white/50">
            <p>© 2025 MeetingMind Inc. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-white transition-colors">Terms</Link>
              <Link href="#" className="hover:text-white transition-colors">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
