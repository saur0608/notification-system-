import { Activity, Play, Pause, MoreVertical, Search, Filter } from "lucide-react";

const campaigns = [
  { id: 1, name: "Summer Mega Sale 2026", status: "Active", audience: "Premium Users", channel: "Email, Push", sent: "45,210", delivered: "98%", openRate: "42%", clickRate: "12%" },
  { id: 2, name: "Weekly Newsletter (W24)", status: "Scheduled", audience: "All Subscribers", channel: "Email", sent: "-", delivered: "-", openRate: "-", clickRate: "-" },
  { id: 3, name: "App Update V3.4", status: "Completed", audience: "iOS Users", channel: "In-App, Push", sent: "128,491", delivered: "99%", openRate: "68%", clickRate: "34%" },
  { id: 4, name: "Cart Abandonment Series", status: "Active", audience: "Custom Segment", channel: "Email, SMS", sent: "1,204", delivered: "95%", openRate: "55%", clickRate: "22%" },
  { id: 5, name: "Welcome Onboarding", status: "Active", audience: "New Users", channel: "Email", sent: "8,432", delivered: "99%", openRate: "71%", clickRate: "45%" },
];

export default function Campaigns() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Campaigns</h1>
          <p className="text-zinc-400">Manage, track, and optimize your notification campaigns.</p>
        </div>
        <button className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all shrink-0">
          + Create Campaign
        </button>
      </div>

      <div className="glass-panel rounded-xl overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-[var(--card-border)] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input type="text" placeholder="Search campaigns..." className="pl-9 pr-4 py-2 bg-black/20 border border-[var(--card-border)] rounded-lg text-sm text-white focus:outline-none focus:border-purple-500/50 w-64" />
            </div>
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--card-border)] bg-black/20 text-sm font-medium text-zinc-300 hover:bg-white/5 transition-colors">
              <Filter className="w-4 h-4" /> Filter
            </button>
          </div>
          <div className="flex gap-2 text-sm text-zinc-400">
            <span className="px-3 py-1 bg-white/5 rounded-full border border-white/5">All (124)</span>
            <span className="px-3 py-1 hover:bg-white/5 rounded-full cursor-pointer transition-colors">Active (3)</span>
            <span className="px-3 py-1 hover:bg-white/5 rounded-full cursor-pointer transition-colors">Scheduled (12)</span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-400 uppercase bg-black/20 border-b border-[var(--card-border)]">
              <tr>
                <th className="px-6 py-4 font-semibold">Campaign Name</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Audience</th>
                <th className="px-6 py-4 font-semibold">Channel</th>
                <th className="px-6 py-4 font-semibold text-right">Sent</th>
                <th className="px-6 py-4 font-semibold text-center">Delivery</th>
                <th className="px-6 py-4 font-semibold text-center">Open Rate</th>
                <th className="px-6 py-4 font-semibold text-center">Click Rate</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--card-border)]">
              {campaigns.map((camp) => (
                <tr key={camp.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-white">{camp.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 w-fit
                      ${camp.status === 'Active' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                        camp.status === 'Scheduled' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                        'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
                      }
                    `}>
                      {camp.status === 'Active' && <Activity className="w-3 h-3 animate-pulse" />}
                      {camp.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-zinc-300 text-xs">{camp.audience}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-zinc-400 text-xs">{camp.channel}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-mono text-xs">{camp.sent}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center font-semibold text-green-400">{camp.delivered}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center font-semibold text-blue-400">{camp.openRate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center font-semibold text-purple-400">{camp.clickRate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {camp.status === 'Active' ? (
                        <button className="p-1.5 rounded-md hover:bg-white/10 text-yellow-400 tooltip" title="Pause"><Pause className="w-4 h-4"/></button>
                      ) : (
                        <button className="p-1.5 rounded-md hover:bg-white/10 text-green-400 tooltip" title="Start"><Play className="w-4 h-4"/></button>
                      )}
                      <button className="p-1.5 rounded-md hover:bg-white/10 text-zinc-400"><MoreVertical className="w-4 h-4"/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
