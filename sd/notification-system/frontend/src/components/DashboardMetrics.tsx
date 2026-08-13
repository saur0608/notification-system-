'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, Users, Send, CheckCircle, XCircle, Clock, Mail, Smartphone, MessageSquare, Activity, DollarSign, RefreshCw, BarChart3, PieChart, ShieldAlert, AlertTriangle } from 'lucide-react';

export function DashboardMetrics() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(res => setData(res.metrics))
      .catch(console.error);
  }, []);

  const metrics = [
    { label: "Total Messages Sent (24h)", value: data?.messagesToday || "0", icon: Send, color: "text-blue-400", trend: "+12%" },
    { label: "Successful Deliveries", value: data?.delivered || "0", icon: CheckCircle, color: "text-green-400", trend: "+14%" },
    { label: "Failed Deliveries", value: data?.failed || "0", icon: XCircle, color: "text-red-400", trend: "-2%" },
    { label: "Queued Messages", value: data?.queued || "0", icon: Clock, color: "text-yellow-400" },
    { label: "Delivery Rate", value: (data?.deliveryRate || "0") + "%", icon: RefreshCw, color: "text-orange-400" },
    
    { label: "Email Delivery %", value: "98.9%", icon: Mail, color: "text-purple-400" },
    { label: "SMS Delivery %", value: "97.2%", icon: MessageSquare, color: "text-indigo-400" },
    { label: "Push Delivery %", value: "99.1%", icon: Smartphone, color: "text-pink-400" },
    { label: "WhatsApp Delivery %", value: "96.8%", icon: MessageSquare, color: "text-emerald-400" },
    { label: "In-App Delivery %", value: "99.9%", icon: ShieldAlert, color: "text-cyan-400" },
    
    { label: "Push Engagement", value: "42%", icon: Activity, color: "text-rose-400", trend: "+5%" },
    { label: "Open Rate (Email)", value: "38%", icon: BarChart3, color: "text-teal-400" },
    { label: "Click Rate", value: "14%", icon: PieChart, color: "text-fuchsia-400" },
    { label: "Bounce Rate", value: "1.1%", icon: AlertTriangle, color: "text-red-500", trend: "-0.5%" },
    { label: "Average Delivery Time", value: "1.2s", icon: Clock, color: "text-sky-400" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {metrics.map((m, i) => (
        <div key={i} className="glass-panel glass-panel-hover p-4 rounded-xl flex flex-col gap-2 relative overflow-hidden group">
          <div className={`absolute -right-6 -top-6 w-24 h-24 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity bg-current ${m.color}`}></div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{m.label}</span>
            <m.icon className={`w-4 h-4 ${m.color}`} />
          </div>
          
          <div className="flex items-end justify-between mt-2">
            {!data ? (
              <div className="h-8 w-24 bg-white/10 animate-pulse rounded"></div>
            ) : (
              <span className="text-2xl font-bold text-white">{m.value}</span>
            )}
            {m.trend && (
              <span className={`text-xs font-semibold ${m.trend.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                {m.trend}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
