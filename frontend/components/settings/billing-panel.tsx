"use client";

import { CreditCard, Zap, CheckCircle2, AlertTriangle, FileText, Download, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const usage = [
  { label: "Meetings This Month", current: 23, limit: 50, unit: "meetings" },
  { label: "Tasks Extracted", current: 412, limit: 500, unit: "tasks" },
  { label: "API Calls", current: 8902, limit: 10000, unit: "calls" },
  { label: "Storage Used", current: 1.8, limit: 2.0, unit: "GB" },
];

const invoices = [
  { id: "1", date: "Mar 21, 2026", desc: "Pro Plan - Monthly", amount: "$29.00", status: "Paid" },
  { id: "2", date: "Feb 21, 2026", desc: "Pro Plan - Monthly", amount: "$29.00", status: "Paid" },
  { id: "3", date: "Jan 21, 2026", desc: "Pro Plan - Monthly", amount: "$29.00", status: "Paid" },
];

export function BillingPanel() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      {/* Panel Header */}
      <div className="px-6 py-5 border-b border-slate-100">
        <h2 className="text-[15px] font-bold text-slate-900 leading-none">Billing & Plan</h2>
        <p className="text-[13px] text-slate-500 mt-1.5">Manage your subscription, monitor usage, and view your billing history.</p>
      </div>

      <div className="px-6">
        {/* Current Plan Card */}
        <div className="py-6 border-b border-slate-100">
          <div className="bg-blue-light/10 border border-blue/20 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group">
            <div className="absolute right-[-20px] top-[-20px] opacity-5 group-hover:scale-110 transition-transform">
               <Zap className="w-32 h-32 text-blue fill-blue" />
            </div>
            
            <div className="relative flex flex-col gap-1 text-center md:text-left">
               <div className="flex items-center justify-center md:justify-start gap-2">
                 <h3 className="text-[18px] font-extrabold text-slate-900">Pro Plan</h3>
                 <Badge className="bg-blue text-white text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full">Active</Badge>
               </div>
               <p className="text-[15px] font-bold text-blue">$29<span className="text-[13px] font-medium text-slate-400">/month</span></p>
               <p className="text-[12px] text-slate-500 font-medium flex items-center gap-1.5 justify-center md:justify-start">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue" />
                  Next billing cycle on <span className="text-slate-900 font-bold">Apr 21, 2026</span>
               </p>
            </div>
            
            <div className="relative flex gap-3">
               <Button variant="outline" className="h-10 px-6 border-slate-200 text-[13px] font-bold bg-white/50 backdrop-blur-sm">
                  Cancel Plan
               </Button>
               <Button className="h-10 px-6 bg-blue hover:bg-blue-hover text-white text-[13px] font-bold shadow-lg shadow-blue/10 flex items-center gap-2">
                  Upgrade to Enterprise
                  <ArrowUpRight className="w-4 h-4" />
               </Button>
            </div>
          </div>
        </div>

        {/* Usage Meters */}
        <div className="py-6 border-b border-slate-100">
          <h3 className="text-[13px] font-bold text-slate-900 mb-6 uppercase tracking-widest">Usage Meters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            {usage.map((item) => {
              const percent = (item.current / item.limit) * 100;
              const isWarning = percent >= 80 && percent < 100;
              const isDanger = percent >= 100;
              
              return (
                <div key={item.label} className="space-y-2.5">
                  <div className="flex justify-between items-end">
                    <span className="text-[13px] font-bold text-slate-900">{item.label}</span>
                    <span className={cn(
                      "text-[12px] font-mono font-bold",
                      isDanger ? "text-error" : isWarning ? "text-orange" : "text-slate-500"
                    )}>
                       {item.current} / {item.limit} {item.unit}
                    </span>
                  </div>
                  <div className="relative h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "absolute left-0 top-0 h-full rounded-full transition-all duration-500",
                        isDanger ? "bg-error" : isWarning ? "bg-orange" : "bg-blue"
                      )}
                      style={{ width: `${Math.min(percent, 100)}%` }}
                    />
                  </div>
                  {isDanger && (
                    <p className="text-[11px] text-error font-bold flex items-center gap-1.5 pt-0.5">
                       <AlertTriangle className="w-3.5 h-3.5" />
                       Limit reached — <button className="text-blue hover:underline">Upgrade plan</button> to continue.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Method */}
        <div className="py-6 border-b border-slate-100">
           <div className="flex items-center justify-between mb-4">
              <h3 className="text-[13px] font-bold text-slate-900 uppercase tracking-widest">Payment Method</h3>
              <button className="text-[12px] font-bold text-blue hover:underline">Update method</button>
           </div>
           <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/30 w-fit pr-12">
              <div className="w-12 h-8 rounded bg-white border border-slate-100 flex items-center justify-center">
                 <CreditCard className="w-6 h-6 text-slate-400" />
              </div>
              <div className="flex flex-col leading-tight">
                 <span className="text-[13px] font-bold text-slate-900">Visa ending in 4242</span>
                 <span className="text-[11px] text-slate-400 font-medium">Expires 12/27</span>
              </div>
           </div>
        </div>

        {/* Billing History */}
        <div className="py-6 pb-12">
           <h3 className="text-[13px] font-bold text-slate-900 mb-6 uppercase tracking-widest">Billing History</h3>
           <div className="overflow-hidden border border-slate-100 rounded-xl">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="bg-slate-50/50 h-9 border-b border-slate-100">
                       <th className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-4">Date</th>
                       <th className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Description</th>
                       <th className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount</th>
                       <th className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                       <th className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pr-4 text-right">Invoice</th>
                    </tr>
                 </thead>
                 <tbody>
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="h-12 border-b border-slate-50 last:border-0 hover:bg-slate-50/30 transition-colors">
                        <td className="pl-4 text-[13px] font-medium text-slate-500">{inv.date}</td>
                        <td className="text-[13px] font-bold text-slate-900">{inv.desc}</td>
                        <td className="text-[13px] font-mono font-bold text-slate-900">{inv.amount}</td>
                        <td>
                           <Badge className="bg-green/10 text-green border-green/10 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              {inv.status}
                           </Badge>
                        </td>
                        <td className="pr-4 text-right">
                           <button className="flex items-center gap-1.5 ml-auto text-[12px] font-bold text-blue hover:text-blue-hover">
                              <Download className="w-3.5 h-3.5" />
                              PDF
                           </button>
                        </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      </div>
    </div>
  );
}
