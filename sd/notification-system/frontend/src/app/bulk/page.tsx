import { Users, Filter, Globe, MapPin, Smartphone, Calendar, Send, CalendarClock, Eye, Calculator } from "lucide-react";

export default function BulkMessages() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Bulk Messages</h1>
        <p className="text-zinc-400">Target specific user segments and launch mass notification campaigns.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Targeting */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-6 rounded-xl space-y-5">
            <h3 className="text-lg font-semibold border-b border-[var(--card-border)] pb-3 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" /> Audience Targeting
            </h3>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Base Segment</label>
              <select className="w-full bg-black/40 border border-[var(--card-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500/50 text-white">
                <option>All Users</option>
                <option>Premium Users</option>
                <option>Active Users</option>
                <option>Inactive Users (30d+)</option>
                <option>New Users</option>
                <option>Custom Segment</option>
              </select>
            </div>

            <div className="space-y-4 pt-4 border-t border-[var(--card-border)]">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                  <Filter className="w-4 h-4 text-zinc-400" /> Additional Filters
                </label>
                <button className="text-xs text-blue-400 hover:text-blue-300 font-medium">+ Add Filter</button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-zinc-500" />
                  <select className="flex-1 bg-black/40 border border-[var(--card-border)] rounded-lg px-3 py-1.5 text-sm focus:outline-none text-zinc-300">
                    <option>Any Country</option>
                    <option>United States</option>
                    <option>United Kingdom</option>
                    <option>India</option>
                  </select>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-zinc-500" />
                  <input type="text" placeholder="City or Region" className="flex-1 bg-black/40 border border-[var(--card-border)] rounded-lg px-3 py-1.5 text-sm focus:outline-none text-white placeholder:text-zinc-600" />
                </div>
                <div className="flex items-center gap-3">
                  <Smartphone className="w-4 h-4 text-zinc-500" />
                  <select className="flex-1 bg-black/40 border border-[var(--card-border)] rounded-lg px-3 py-1.5 text-sm focus:outline-none text-zinc-300">
                    <option>Any Platform</option>
                    <option>iOS</option>
                    <option>Android</option>
                    <option>Web</option>
                  </select>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-zinc-500" />
                  <select className="flex-1 bg-black/40 border border-[var(--card-border)] rounded-lg px-3 py-1.5 text-sm focus:outline-none text-zinc-300">
                    <option>Any Registration Date</option>
                    <option>Last 7 Days</option>
                    <option>Last 30 Days</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Estimator */}
            <div className="mt-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-3 flex items-center gap-1"><Calculator className="w-4 h-4"/> Audience Estimate</h4>
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-2xl font-bold text-white">124,592</div>
                  <div className="text-xs text-blue-200/70">Matching Users</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-400">~$49.50</div>
                  <div className="text-xs text-blue-200/70">Est. Cost</div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Campaign Setup */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-xl flex flex-col h-full">
            <h3 className="text-lg font-semibold border-b border-[var(--card-border)] pb-3 mb-5 flex items-center gap-2">
              <Send className="w-5 h-5 text-purple-400" /> Campaign Setup
            </h3>
            
            <div className="space-y-6 flex-1">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-zinc-300 mb-1.5 block">Campaign Name</label>
                  <input type="text" placeholder="e.g. Black Friday 2026" className="w-full bg-black/40 border border-[var(--card-border)] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500/50 text-white placeholder:text-zinc-600" />
                </div>
                <div>
                  <label className="text-sm font-medium text-zinc-300 mb-1.5 block">Message Template</label>
                  <select className="w-full bg-black/40 border border-[var(--card-border)] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500/50 text-white">
                    <option>Select a template...</option>
                    <option>Marketing - Holiday Sale</option>
                    <option>Announcement - Feature Update</option>
                    <option>Custom Message</option>
                  </select>
                </div>
              </div>

              {/* Delivery Settings */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-zinc-300 block border-b border-[var(--card-border)] pb-2">Delivery Settings</label>
                
                <label className="flex items-center gap-3 p-3 rounded-lg border border-[var(--card-border)] bg-black/20 cursor-pointer hover:bg-white/5 transition-colors">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded bg-black border-[var(--card-border)] text-purple-500 focus:ring-purple-500/50" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">Enable Tracking</div>
                    <div className="text-xs text-zinc-400">Track open rates and link clicks via our analytics pixel.</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-lg border border-[var(--card-border)] bg-black/20 cursor-pointer hover:bg-white/5 transition-colors">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded bg-black border-[var(--card-border)] text-purple-500 focus:ring-purple-500/50" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">Smart Retries</div>
                    <div className="text-xs text-zinc-400">Automatically retry failed messages on secondary channels.</div>
                  </div>
                </label>
              </div>

            </div>

            {/* Actions */}
            <div className="mt-8 pt-5 border-t border-[var(--card-border)] flex flex-wrap items-center justify-between gap-4">
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm font-medium hover:bg-white/10 transition-colors">
                <Eye className="w-4 h-4" /> Preview Campaign
              </button>
              
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm font-medium hover:bg-blue-500/20 transition-colors">
                  <CalendarClock className="w-4 h-4" /> Schedule Campaign
                </button>
                <button className="flex items-center gap-2 px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)] text-sm font-bold hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] transition-all">
                  <Send className="w-4 h-4" /> Launch Campaign
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
