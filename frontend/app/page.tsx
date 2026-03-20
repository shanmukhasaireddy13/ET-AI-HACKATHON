"use client";

import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="landing-page">
      {/* ─── Navigation ─── */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white font-black text-sm">S</div>
            <span className="text-lg font-bold tracking-tight">SIDD</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-neutral-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#agents" className="hover:text-white transition-colors">Agents</a>
            <a href="#how" className="hover:text-white transition-colors">How it Works</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="px-4 py-2 text-sm text-neutral-300 hover:text-white transition-colors">
              Log in
            </Link>
            <Link href="/signup" className="px-5 py-2 text-sm font-semibold bg-white text-black rounded-full hover:bg-neutral-200 transition-all">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-violet-600/20 blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-pink-600/15 blur-[120px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[150px]" />
        </div>

        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            Agentic AI for Enterprise
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
            Autonomous Workflows,
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
              Zero Manual Effort
            </span>
          </h1>

          <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            SIDD deploys specialized AI agents that orchestrate, execute, and self-correct complex enterprise workflows — from meeting intelligence to procurement, with full audit trails.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="group px-8 py-3.5 bg-gradient-to-r from-violet-600 to-pink-600 text-white font-semibold rounded-full shadow-[0_0_30px_rgba(124,58,237,0.4)] hover:shadow-[0_0_50px_rgba(124,58,237,0.6)] transition-all hover:-translate-y-0.5 flex items-center gap-2"
            >
              Start Free
              <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </Link>
            <Link
              href="/dashboard"
              className="px-8 py-3.5 border border-white/10 text-neutral-300 font-medium rounded-full hover:bg-white/5 hover:border-white/20 transition-all"
            >
              View Dashboard →
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Not Automation. <span className="text-violet-400">Agentic Intelligence.</span></h2>
            <p className="text-neutral-400 max-w-2xl mx-auto">Our multi-agent system doesn&apos;t just follow scripts — it reasons, adapts, and self-corrects in real-time.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: "🧠", title: "Dynamic Orchestration", desc: "An orchestrator agent analyzes your input and spawns specialized sub-agents on-the-fly — no predefined pipelines." },
              { icon: "🔁", title: "Self-Healing Workflows", desc: "When something fails, recovery agents diagnose the issue and retry with corrected parameters automatically." },
              { icon: "🛡️", title: "Human-in-the-Loop", desc: "Critical actions like Jira ticket creation require explicit human approval before execution." },
              { icon: "📊", title: "Full Audit Trail", desc: "Every decision, every agent reasoning step, every action is logged and traceable for compliance." },
              { icon: "🔌", title: "OAuth Integrations", desc: "Connect your Jira, Slack, and Calendar accounts with secure OAuth 2.0 — no API tokens in config files." },
              { icon: "⚡", title: "Real-Time Dashboard", desc: "Monitor live agent execution, view reasoning chains, and approve pending actions from a single pane." },
            ].map((feature, i) => (
              <div key={i} className="group p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-all">
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Agents Section ─── */}
      <section id="agents" className="py-24 px-6 relative">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-violet-600/10 blur-[150px]" />
        </div>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Meet the <span className="text-pink-400">Agent Fleet</span></h2>
            <p className="text-neutral-400 max-w-2xl mx-auto">Specialized agents collaborate to complete complex enterprise tasks end-to-end.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "Orchestrator", color: "from-violet-500 to-violet-700" },
              { name: "Task Divider", color: "from-blue-500 to-blue-700" },
              { name: "Executor", color: "from-emerald-500 to-emerald-700" },
              { name: "Bug Tracker", color: "from-orange-500 to-orange-700" },
              { name: "Scheduler", color: "from-cyan-500 to-cyan-700" },
              { name: "Monitor", color: "from-yellow-500 to-yellow-700" },
              { name: "Recovery", color: "from-red-500 to-red-700" },
              { name: "Auditor", color: "from-pink-500 to-pink-700" },
            ].map((agent, i) => (
              <div key={i} className="text-center p-5 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-white/15 transition-all group">
                <div className={`w-12 h-12 mx-auto rounded-xl bg-gradient-to-br ${agent.color} flex items-center justify-center text-white font-bold text-lg mb-3 group-hover:scale-110 transition-transform`}>
                  {agent.name[0]}
                </div>
                <p className="text-sm font-medium">{agent.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How it Works ─── */}
      <section id="how" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How it <span className="text-violet-400">Works</span></h2>
          </div>

          <div className="space-y-8">
            {[
              { step: "01", title: "Paste a Transcript", desc: "Upload a meeting transcript or describe a workflow you want to automate." },
              { step: "02", title: "Agents Analyze & Plan", desc: "The orchestrator agent reads your input, reasons about the best approach, and creates a dynamic execution plan." },
              { step: "03", title: "Autonomous Execution", desc: "Specialized agents execute each step — creating Jira tickets, scheduling meetings, tracking bugs — while you watch." },
              { step: "04", title: "Human Approval Gates", desc: "Critical actions pause for your approval. You stay in control while agents handle the heavy lifting." },
            ].map((item, i) => (
              <div key={i} className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center text-white font-bold text-sm">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">{item.title}</h3>
                  <p className="text-neutral-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to automate your enterprise workflows?</h2>
          <p className="text-neutral-400 mb-10">Start with a free account. No credit card required.</p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-violet-600 to-pink-600 text-white font-semibold rounded-full shadow-[0_0_40px_rgba(124,58,237,0.4)] hover:shadow-[0_0_60px_rgba(124,58,237,0.6)] transition-all hover:-translate-y-0.5 text-lg"
          >
            Get Started Free
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </Link>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white font-black text-xs">S</div>
            <span className="text-sm font-bold">SIDD</span>
            <span className="text-xs text-neutral-500 ml-2">Agentic AI for Enterprise</span>
          </div>
          <p className="text-xs text-neutral-500">© 2026 SIDD. Built for the ET-AI Hackathon.</p>
        </div>
      </footer>
    </div>
  );
}
