import { DashboardMetrics } from "@/components/DashboardMetrics";
import { DashboardCharts } from "@/components/DashboardCharts";
import { LiveActivityTable } from "@/components/LiveActivityTable";
import { Server, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">System Overview</h1>
          <p className="text-zinc-400 max-w-3xl leading-relaxed">
            Monitor every notification in real time, including message delivery, failures, engagement, 
            queue processing, API performance, campaign analytics, and messaging activity across 
            <span className="text-purple-400 font-medium"> Email, SMS, Push, WhatsApp, and In-App Messaging.</span>
          </p>
        </div>
        
        <div className="flex items-center gap-4 shrink-0 glass-panel px-4 py-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
          <div className="flex items-center gap-3">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </div>
            <div>
              <div className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">System Status</div>
              <div className="text-sm font-medium text-white">All Systems Operational</div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-[var(--card-border)] to-transparent my-6"></div>

      {/* Real-time connection indicator */}
      <div className="flex items-center gap-6 text-xs font-medium text-zinc-500 mb-6">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" />
          WebSocket Connected
        </div>
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4 text-blue-500" />
          API Latency: 24ms
        </div>
      </div>

      {/* Top Metric Cards */}
      <DashboardMetrics />

      {/* Analytics Section */}
      <DashboardCharts />

      {/* Live Activity Table */}
      <LiveActivityTable />

    </div>
  );
}
