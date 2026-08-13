import { LayoutTemplate, Edit2, Copy, Trash2, Smartphone, Mail, Search, Plus } from "lucide-react";

const templates = [
  { id: 1, name: "OTP Verification", type: "Security", channel: "SMS", lastUpdated: "2 days ago", uses: "1.2M" },
  { id: 2, name: "Welcome Email", type: "Onboarding", channel: "Email", lastUpdated: "1 week ago", uses: "84k" },
  { id: 3, name: "Password Reset", type: "Security", channel: "Email", lastUpdated: "3 weeks ago", uses: "12k" },
  { id: 4, name: "Order Confirmation", type: "Transactional", channel: "Email, SMS", lastUpdated: "1 month ago", uses: "450k" },
  { id: 5, name: "Shipment Update", type: "Transactional", channel: "Push", lastUpdated: "5 days ago", uses: "890k" },
  { id: 6, name: "Festival Offer", type: "Marketing", channel: "Push, WhatsApp", lastUpdated: "Just now", uses: "0" },
];

export default function Templates() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Message Templates</h1>
          <p className="text-zinc-400">Create, manage, and reuse message templates across all channels.</p>
        </div>
        <button className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all flex items-center gap-2 shrink-0">
          <Plus className="w-5 h-5" /> New Template
        </button>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input type="text" placeholder="Search templates..." className="w-full pl-9 pr-4 py-2.5 bg-black/20 border border-[var(--card-border)] rounded-lg text-sm text-white focus:outline-none focus:border-purple-500/50" />
        </div>
        <select className="bg-black/20 border border-[var(--card-border)] rounded-lg px-4 py-2.5 text-sm focus:outline-none text-zinc-300">
          <option>All Types</option>
          <option>Security</option>
          <option>Transactional</option>
          <option>Marketing</option>
        </select>
        <select className="bg-black/20 border border-[var(--card-border)] rounded-lg px-4 py-2.5 text-sm focus:outline-none text-zinc-300">
          <option>All Channels</option>
          <option>Email</option>
          <option>SMS</option>
          <option>Push</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((tpl) => (
          <div key={tpl.id} className="glass-panel glass-panel-hover p-6 rounded-xl flex flex-col group relative overflow-hidden">
            
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
              <button className="p-1.5 rounded bg-black/40 hover:bg-white/10 text-zinc-300"><Edit2 className="w-4 h-4"/></button>
              <button className="p-1.5 rounded bg-black/40 hover:bg-white/10 text-zinc-300"><Copy className="w-4 h-4"/></button>
              <button className="p-1.5 rounded bg-black/40 hover:bg-red-500/20 text-red-400"><Trash2 className="w-4 h-4"/></button>
            </div>

            <div className="flex items-start justify-between mb-4">
              <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <LayoutTemplate className="w-6 h-6" />
              </div>
              <div className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/5 border border-[var(--card-border)] text-zinc-300">
                {tpl.type}
              </div>
            </div>

            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-purple-400 transition-colors">{tpl.name}</h3>
            
            <div className="flex items-center gap-3 mt-4 text-xs font-medium text-zinc-400">
              <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5"/> {tpl.channel}</span>
            </div>

            <div className="mt-auto pt-6 flex items-center justify-between text-xs text-zinc-500 font-medium">
              <span>{tpl.uses} uses</span>
              <span>Updated {tpl.lastUpdated}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
