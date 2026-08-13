import { Key, Plus, Copy, Eye, EyeOff, RefreshCcw, Trash2, ShieldAlert } from "lucide-react";

const apiKeys = [
  { id: 1, name: "Production Backend", key: "sk_live_98f...39a", created: "Oct 12, 2025", lastUsed: "Just now", scopes: ["Send Messages", "Read Analytics"] },
  { id: 2, name: "Staging Environment", key: "sk_test_41b...88c", created: "Jan 04, 2026", lastUsed: "2 hours ago", scopes: ["Send Messages"] },
  { id: 3, name: "Marketing Automation Tool", key: "sk_live_12c...99z", created: "Mar 15, 2026", lastUsed: "1 day ago", scopes: ["Manage Campaigns", "Read Analytics"] },
];

export default function ApiKeys() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">API Management</h1>
          <p className="text-zinc-400">Manage API keys, webhooks, and rate limits for your integrations.</p>
        </div>
        <button className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all flex items-center gap-2 shrink-0">
          <Plus className="w-5 h-5" /> Generate New Key
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* API Keys List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-xl">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Key className="w-5 h-5 text-purple-400" /> Active API Keys
            </h3>
            
            <div className="space-y-4">
              {apiKeys.map(key => (
                <div key={key.id} className="p-4 rounded-lg border border-[var(--card-border)] bg-black/20 hover:bg-black/40 transition-colors group">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-bold text-white text-base">{key.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-mono text-sm text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">{key.key}</span>
                        <button className="text-zinc-400 hover:text-white transition-colors" title="Copy Key"><Copy className="w-4 h-4"/></button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 rounded bg-black/40 hover:bg-white/10 text-zinc-300" title="Revoke & Roll"><RefreshCcw className="w-4 h-4"/></button>
                      <button className="p-1.5 rounded bg-black/40 hover:bg-red-500/20 text-red-400" title="Delete"><Trash2 className="w-4 h-4"/></button>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs mt-4 border-t border-[var(--card-border)] pt-3">
                    <div className="text-zinc-400">Created: <span className="text-zinc-200">{key.created}</span></div>
                    <div className="text-zinc-400">Last Used: <span className="text-zinc-200">{key.lastUsed}</span></div>
                    <div className="flex items-center gap-1.5 ml-auto">
                      {key.scopes.map(s => <span key={s} className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-zinc-300 text-[10px] uppercase tracking-wider">{s}</span>)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel p-6 rounded-xl">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-orange-400" /> Webhook Configuration
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-zinc-300 mb-1.5 block">Endpoint URL</label>
                <div className="flex gap-2">
                  <input type="text" defaultValue="https://api.yourcompany.com/webhooks/nexus" className="flex-1 bg-black/40 border border-[var(--card-border)] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500/50 text-white font-mono" />
                  <button className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm font-medium hover:bg-white/10 transition-colors">Update</button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-300 mb-1.5 block">Webhook Secret (for signature verification)</label>
                <div className="flex items-center gap-2 p-2.5 bg-black/40 border border-[var(--card-border)] rounded-lg">
                  <span className="flex-1 font-mono text-sm text-zinc-400 tracking-widest">••••••••••••••••••••••••••••••••</span>
                  <button className="text-zinc-400 hover:text-white transition-colors" title="Reveal"><Eye className="w-4 h-4"/></button>
                  <button className="text-zinc-400 hover:text-white transition-colors" title="Copy"><Copy className="w-4 h-4"/></button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rate Limits */}
        <div className="lg:col-span-1">
          <div className="glass-panel p-6 rounded-xl h-full">
            <h3 className="text-lg font-semibold mb-6 border-b border-[var(--card-border)] pb-3">Current Rate Limits</h3>
            
            <div className="space-y-6">
              {[
                { label: "Send Messages API", limit: "10,000 / min", used: 45, color: "bg-purple-500" },
                { label: "Bulk Messages API", limit: "50 / min", used: 12, color: "bg-blue-500" },
                { label: "Reporting API", limit: "100 / min", used: 85, color: "bg-orange-500" },
                { label: "User Management API", limit: "500 / min", used: 5, color: "bg-green-500" },
              ].map((limit, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-zinc-300">{limit.label}</span>
                    <span className="text-zinc-400">{limit.used}%</span>
                  </div>
                  <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-[var(--card-border)]">
                    <div className={`h-full ${limit.color} rounded-full`} style={{ width: `${limit.used}%` }}></div>
                  </div>
                  <div className="text-xs text-zinc-500 mt-1 text-right">Limit: {limit.limit}</div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 rounded-lg bg-purple-500/10 border border-purple-500/20 text-sm text-purple-200">
              Need higher limits? <a href="#" className="font-bold underline hover:text-white">Contact Sales</a> to upgrade your Enterprise plan.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
