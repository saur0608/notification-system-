import { Smartphone, Settings, Activity } from "lucide-react";

export default function PushChannel() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
          <Smartphone className="w-8 h-8 text-pink-400" /> Push Notifications
        </h1>
        <p className="text-zinc-400">Manage APNs, FCM certificates and mobile push analytics.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-xl flex flex-col items-center justify-center h-48">
          <Activity className="w-8 h-8 text-emerald-400 mb-3" />
          <h3 className="text-lg font-bold text-white">14.2% CTR</h3>
          <p className="text-zinc-400 text-sm mt-1">Highest engagement channel</p>
        </div>
        <div className="glass-panel p-6 rounded-xl flex flex-col items-center justify-center h-48">
          <Settings className="w-8 h-8 text-blue-400 mb-3" />
          <h3 className="text-lg font-bold text-white">FCM/APNs Active</h3>
          <p className="text-zinc-400 text-sm mt-1">Certificates expire in 214 days</p>
        </div>
      </div>
    </div>
  );
}
