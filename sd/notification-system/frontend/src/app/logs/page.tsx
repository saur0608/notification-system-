import { FileText, RefreshCw, Download, Search, Filter, AlertCircle, CheckCircle2 } from "lucide-react";

const logs = [
  { id: "req_98a72b", timestamp: "2026-08-05 14:12:05.123", user: "system", endpoint: "POST /v1/messages/send", channel: "Email", status: 200, time: "45ms", error: "-" },
  { id: "req_98a72c", timestamp: "2026-08-05 14:12:05.145", user: "api_key_49x", endpoint: "POST /v1/messages/bulk", channel: "Push", status: 202, time: "12ms", error: "-" },
  { id: "req_98a72d", timestamp: "2026-08-05 14:12:06.001", user: "system", endpoint: "GET /v1/webhooks/status", channel: "-", status: 500, time: "1205ms", error: "ERR_TIMEOUT" },
  { id: "req_98a72e", timestamp: "2026-08-05 14:12:07.442", user: "api_key_11z", endpoint: "POST /v1/messages/send", channel: "WhatsApp", status: 429, time: "5ms", error: "RATE_LIMIT_EXCEEDED" },
  { id: "req_98a72f", timestamp: "2026-08-05 14:12:08.192", user: "system", endpoint: "POST /v1/messages/send", channel: "SMS", status: 200, time: "89ms", error: "-" },
  { id: "req_98a730", timestamp: "2026-08-05 14:12:09.911", user: "system", endpoint: "GET /v1/users/lookup", channel: "-", status: 404, time: "15ms", error: "USER_NOT_FOUND" },
  { id: "req_98a731", timestamp: "2026-08-05 14:12:10.005", user: "api_key_49x", endpoint: "POST /v1/messages/send", channel: "In-App", status: 200, time: "22ms", error: "-" },
];

export default function Logs() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">System Logs</h1>
          <p className="text-zinc-400">Real-time API and messaging activity logs for debugging and auditing.</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button className="px-4 py-2 rounded-lg bg-black/20 border border-[var(--card-border)] text-zinc-300 font-medium hover:bg-white/5 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" /> Export
          </button>
          <button className="px-4 py-2 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400 font-medium hover:bg-purple-500/20 transition-colors flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      <div className="glass-panel rounded-xl flex-1 flex flex-col min-h-0">
        {/* Toolbar */}
        <div className="p-4 border-b border-[var(--card-border)] flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input type="text" placeholder="Search Request ID, Endpoint..." className="pl-9 pr-4 py-2 bg-black/20 border border-[var(--card-border)] rounded-lg text-sm text-white focus:outline-none focus:border-purple-500/50 w-72" />
            </div>
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--card-border)] bg-black/20 text-sm font-medium text-zinc-300 hover:bg-white/5 transition-colors">
              <Filter className="w-4 h-4" /> Filter
            </button>
          </div>
          <div className="flex items-center gap-4 text-sm text-zinc-400">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded bg-black border-[var(--card-border)] text-purple-500" />
              Errors Only
            </label>
            <div className="w-px h-4 bg-[var(--card-border)]"></div>
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> Live Tail
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-400 uppercase bg-black/40 sticky top-0 backdrop-blur-md">
              <tr>
                <th className="px-6 py-3 font-semibold">Timestamp</th>
                <th className="px-6 py-3 font-semibold">Request ID</th>
                <th className="px-6 py-3 font-semibold">Endpoint</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold">Latency</th>
                <th className="px-6 py-3 font-semibold">Error Code</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--card-border)] font-mono text-xs">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-white/5 transition-colors group cursor-pointer">
                  <td className="px-6 py-3 whitespace-nowrap text-zinc-500">{log.timestamp}</td>
                  <td className="px-6 py-3 whitespace-nowrap text-purple-400">{log.id}</td>
                  <td className="px-6 py-3 whitespace-nowrap text-zinc-300">
                    <span className={`mr-2 font-bold ${log.endpoint.startsWith('GET') ? 'text-blue-400' : 'text-green-400'}`}>
                      {log.endpoint.split(' ')[0]}
                    </span>
                    {log.endpoint.split(' ')[1]}
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap">
                    <span className={`flex items-center gap-1.5 font-semibold
                      ${log.status >= 200 && log.status < 300 ? 'text-green-400' : 
                        log.status >= 400 && log.status < 500 ? 'text-yellow-400' : 'text-red-400'}
                    `}>
                      {log.status >= 200 && log.status < 300 ? <CheckCircle2 className="w-3.5 h-3.5"/> : <AlertCircle className="w-3.5 h-3.5"/>}
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap text-zinc-400">{log.time}</td>
                  <td className="px-6 py-3 whitespace-nowrap text-red-400">{log.error}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
