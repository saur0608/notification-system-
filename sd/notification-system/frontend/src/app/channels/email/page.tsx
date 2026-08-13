import { Mail, Settings, Activity } from "lucide-react";

export default function EmailChannel() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
          <Mail className="w-8 h-8 text-purple-400" /> Email Channel
        </h1>
        <p className="text-zinc-400">Manage your email sending reputation, templates, and analytics.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-xl flex flex-col items-center justify-center h-48">
          <Activity className="w-8 h-8 text-emerald-400 mb-3" />
          <h3 className="text-lg font-bold text-white">99.2% Delivery Rate</h3>
          <p className="text-zinc-400 text-sm mt-1">Excellent sender reputation</p>
        </div>
        <div className="glass-panel p-6 rounded-xl flex flex-col items-center justify-center h-48">
          <Settings className="w-8 h-8 text-blue-400 mb-3" />
          <h3 className="text-lg font-bold text-white">SMTP Configured</h3>
          <p className="text-zinc-400 text-sm mt-1">Using SendGrid backend</p>
        </div>
      </div>
    </div>
  );
}
