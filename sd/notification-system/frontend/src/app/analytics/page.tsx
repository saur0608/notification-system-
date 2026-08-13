"use client";

import { DashboardCharts } from "@/components/DashboardCharts";
import { ArrowUpRight, ArrowDownRight, DollarSign, Users, Activity, BarChart3 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const revenueData = [
  { name: 'Mon', value: 1200 },
  { name: 'Tue', value: 1900 },
  { name: 'Wed', value: 1500 },
  { name: 'Thu', value: 2400 },
  { name: 'Fri', value: 3200 },
  { name: 'Sat', value: 2800 },
  { name: 'Sun', value: 4100 },
];

export default function Analytics() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Advanced Analytics</h1>
        <p className="text-zinc-400">Deep dive into your notification performance and user engagement metrics.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Messages This Month", value: "48.2M", change: "+12.5%", positive: true, icon: BarChart3 },
          { label: "Cost Per Message (Avg)", value: "$0.0012", change: "-4.2%", positive: true, icon: DollarSign },
          { label: "User Growth (30d)", value: "+124k", change: "+18.1%", positive: true, icon: Users },
          { label: "Revenue Attributed", value: "$124,500", change: "+8.4%", positive: true, icon: Activity },
        ].map((stat, i) => (
          <div key={i} className="glass-panel p-5 rounded-xl flex flex-col justify-between h-32 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-400">{stat.label}</span>
              <div className="p-2 rounded-lg bg-white/5 group-hover:bg-purple-500/10 transition-colors">
                <stat.icon className="w-4 h-4 text-zinc-400 group-hover:text-purple-400" />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold text-white">{stat.value}</span>
              <span className={`text-xs font-bold flex items-center gap-1 ${stat.positive ? 'text-emerald-400' : 'text-red-400'}`}>
                {stat.positive ? <ArrowUpRight className="w-3 h-3"/> : <ArrowDownRight className="w-3 h-3"/>}
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Trend Chart */}
      <div className="glass-panel p-6 rounded-xl mt-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          Attributed Revenue Trend
        </h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                itemStyle={{ color: '#10b981' }}
              />
              <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="opacity-90">
        <DashboardCharts />
      </div>

    </div>
  );
}
