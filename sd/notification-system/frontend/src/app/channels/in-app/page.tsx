import { AppWindow, Settings, Activity } from "lucide-react";

export default function InAppChannel() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
          <AppWindow className="w-8 h-8 text-cyan-400" /> In-App Notifications
        </h1>
        <p className="text-zinc-400">Manage bell notifications, modals, and tooltips inside your app.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-xl flex flex-col items-center justify-center h-48">
          <Activity className="w-8 h-8 text-emerald-400 mb-3" />
          <h3 className="text-lg font-bold text-white">1.2M Active Sockets</h3>
          <p className="text-zinc-400 text-sm mt-1">Real-time WebSocket connections</p>
        </div>
        <div className="glass-panel p-6 rounded-xl flex flex-col items-center justify-center h-48">
          <Settings className="w-8 h-8 text-blue-400 mb-3" />
          <h3 className="text-lg font-bold text-white">SDK Integrated</h3>
          <p className="text-zinc-400 text-sm mt-1">Latest React SDK v2.1.0</p>
        </div>
      </div>
    </div>
  );
}
