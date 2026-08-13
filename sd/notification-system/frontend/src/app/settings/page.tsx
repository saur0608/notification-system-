import { Mail, Smartphone, MessageSquare, Save, Settings as SettingsIcon, Server, Shield, Bell } from "lucide-react";

export default function Settings() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Platform Settings</h1>
          <p className="text-zinc-400">Configure provider integrations and system preferences.</p>
        </div>
        <button className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all flex items-center gap-2 shrink-0">
          <Save className="w-5 h-5" /> Save Changes
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Settings Nav */}
        <div className="lg:w-64 shrink-0 space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white font-medium">
            <Server className="w-4 h-4" /> Providers
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-colors">
            <Shield className="w-4 h-4" /> Security
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-colors">
            <Bell className="w-4 h-4" /> System Alerts
          </button>
        </div>

        {/* Settings Content */}
        <div className="flex-1 space-y-6">
          
          <div className="glass-panel p-6 rounded-xl space-y-6">
            <h3 className="text-lg font-semibold border-b border-[var(--card-border)] pb-3 flex items-center gap-2">
              <Mail className="w-5 h-5 text-purple-400" /> SMTP Configuration
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-zinc-300 mb-1.5 block">Provider</label>
                <select className="w-full bg-black/40 border border-[var(--card-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500/50 text-white">
                  <option>SendGrid</option>
                  <option>AWS SES</option>
                  <option>Mailgun</option>
                  <option>Custom SMTP</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-300 mb-1.5 block">API Key</label>
                <input type="password" defaultValue="sk_live_123456789" className="w-full bg-black/40 border border-[var(--card-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500/50 text-white font-mono" />
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-300 mb-1.5 block">From Email</label>
                <input type="email" defaultValue="notifications@nexus.com" className="w-full bg-black/40 border border-[var(--card-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500/50 text-white" />
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-300 mb-1.5 block">From Name</label>
                <input type="text" defaultValue="Nexus Notifications" className="w-full bg-black/40 border border-[var(--card-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500/50 text-white" />
              </div>
            </div>
            
            <div className="pt-2">
              <button className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm font-medium hover:bg-white/10 transition-colors">Test Connection</button>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-xl space-y-6">
            <h3 className="text-lg font-semibold border-b border-[var(--card-border)] pb-3 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-blue-400" /> Firebase Cloud Messaging (Push)
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-zinc-300 mb-1.5 block">Service Account JSON</label>
                <textarea 
                  className="w-full min-h-[120px] bg-black/40 border border-[var(--card-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500/50 text-white font-mono placeholder:text-zinc-600"
                  placeholder='{ "type": "service_account", "project_id": "nexus-prod-123" ... }'
                ></textarea>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-xl space-y-6">
            <h3 className="text-lg font-semibold border-b border-[var(--card-border)] pb-3 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-green-400" /> WhatsApp API Integration
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-zinc-300 mb-1.5 block">Provider</label>
                <select className="w-full bg-black/40 border border-[var(--card-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500/50 text-white">
                  <option>Twilio</option>
                  <option>Meta Official API</option>
                  <option>MessageBird</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-300 mb-1.5 block">Phone Number ID</label>
                <input type="text" defaultValue="129483019283" className="w-full bg-black/40 border border-[var(--card-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500/50 text-white font-mono" />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-zinc-300 mb-1.5 block">Access Token</label>
                <input type="password" defaultValue="EAAB2x...9xZ" className="w-full bg-black/40 border border-[var(--card-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500/50 text-white font-mono" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
