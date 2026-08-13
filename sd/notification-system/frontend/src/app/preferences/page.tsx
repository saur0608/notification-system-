"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Mail, MessageSquare, Smartphone, Bell, ShieldCheck } from "lucide-react";

export default function Preferences() {
  const [channels, setChannels] = useState({
    email: true,
    sms: false,
    push: true,
    inapp: true
  });

  const toggleChannel = (key: keyof typeof channels) => {
    setChannels(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">User Preferences</h1>
        <p className="text-gray-400">Manage how and when you receive notifications.</p>
      </header>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-[var(--card)] border border-[var(--card-border)] backdrop-blur-md p-8 shadow-xl"
      >
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-[var(--card-border)]">
          <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Delivery Channels</h2>
            <p className="text-sm text-gray-400">Opt in or out of specific communication methods.</p>
          </div>
        </div>

        <div className="space-y-6">
          <ChannelToggle 
            icon={Mail} 
            title="Email Notifications" 
            description="Newsletters, marketing, and account alerts." 
            active={channels.email} 
            onClick={() => toggleChannel("email")} 
          />
          <ChannelToggle 
            icon={MessageSquare} 
            title="SMS Text Messages" 
            description="Critical alerts and OTP verifications." 
            active={channels.sms} 
            onClick={() => toggleChannel("sms")} 
          />
          <ChannelToggle 
            icon={Smartphone} 
            title="Mobile Push" 
            description="Instant delivery to your iOS and Android devices." 
            active={channels.push} 
            onClick={() => toggleChannel("push")} 
          />
          <ChannelToggle 
            icon={Bell} 
            title="In-App Updates" 
            description="Silent notifications that appear inside the application." 
            active={channels.inapp} 
            onClick={() => toggleChannel("inapp")} 
          />
        </div>
        
        <div className="mt-10 pt-6 border-t border-[var(--card-border)] flex justify-end">
          <button className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-xl transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)]">
            Save Preferences
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function ChannelToggle({ icon: Icon, title, description, active, onClick }: { icon: any, title: string, description: string, active: boolean, onClick: () => void }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-800/30 transition-colors cursor-pointer" onClick={onClick}>
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl transition-colors ${active ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-800 text-slate-400'}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-medium text-white">{title}</h3>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
      </div>
      
      <button 
        className={`w-14 h-8 rounded-full p-1 transition-colors relative flex items-center ${active ? 'bg-purple-600' : 'bg-slate-700'}`}
      >
        <motion.div 
          layout
          className="w-6 h-6 bg-white rounded-full shadow-md"
          animate={{ x: active ? 24 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  );
}
