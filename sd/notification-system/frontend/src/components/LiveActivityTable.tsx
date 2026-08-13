'use client';

import { useEffect, useState } from 'react';
import { Mail, MessageSquare, Smartphone, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export function LiveActivityTable() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real implementation, this would connect to a WebSocket or poll an API
    // For now, we simulate fetching some recent activity
    const mockData = [
      { id: '1', channel: 'Email', status: 'DELIVERED', recipient: 'user@example.com', time: 'Just now' },
      { id: '2', channel: 'SMS', status: 'DELIVERED', recipient: '+1234567890', time: '1 min ago' },
      { id: '3', channel: 'Push', status: 'FAILED', recipient: 'Device_Token_XYZ', time: '3 mins ago' },
      { id: '4', channel: 'WhatsApp', status: 'PENDING', recipient: '+1987654321', time: '5 mins ago' },
      { id: '5', channel: 'Email', status: 'DELIVERED', recipient: 'admin@system.com', time: '10 mins ago' },
    ];
    
    setTimeout(() => {
      setActivities(mockData);
      setLoading(false);
    }, 1000);
  }, []);

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'Email': return <Mail className="w-4 h-4 text-blue-400" />;
      case 'SMS': return <MessageSquare className="w-4 h-4 text-indigo-400" />;
      case 'Push': return <Smartphone className="w-4 h-4 text-pink-400" />;
      case 'WhatsApp': return <MessageSquare className="w-4 h-4 text-emerald-400" />;
      default: return <Mail className="w-4 h-4 text-zinc-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED': 
        return <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full"><CheckCircle className="w-3 h-3" /> Delivered</span>;
      case 'FAILED': 
        return <span className="flex items-center gap-1.5 text-xs font-medium text-red-400 bg-red-400/10 px-2 py-1 rounded-full"><XCircle className="w-3 h-3" /> Failed</span>;
      case 'PENDING': 
        return <span className="flex items-center gap-1.5 text-xs font-medium text-amber-400 bg-amber-400/10 px-2 py-1 rounded-full"><Clock className="w-3 h-3" /> Pending</span>;
      default: 
        return <span className="text-xs font-medium text-zinc-400">{status}</span>;
    }
  };

  return (
    <div className="glass-panel p-6 rounded-xl mt-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-white">Live Activity Feed</h2>
        <span className="flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-zinc-400 uppercase bg-white/5">
            <tr>
              <th className="px-4 py-3 rounded-tl-lg font-medium">Channel</th>
              <th className="px-4 py-3 font-medium">Recipient</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 rounded-tr-lg font-medium">Time</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-white/5">
                  <td className="px-4 py-4"><div className="h-4 w-16 bg-white/10 animate-pulse rounded"></div></td>
                  <td className="px-4 py-4"><div className="h-4 w-32 bg-white/10 animate-pulse rounded"></div></td>
                  <td className="px-4 py-4"><div className="h-5 w-20 bg-white/10 animate-pulse rounded-full"></div></td>
                  <td className="px-4 py-4"><div className="h-4 w-16 bg-white/10 animate-pulse rounded"></div></td>
                </tr>
              ))
            ) : (
              activities.map((activity) => (
                <tr key={activity.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 font-medium text-white">
                      {getChannelIcon(activity.channel)}
                      {activity.channel}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-zinc-300 font-mono text-xs">{activity.recipient}</td>
                  <td className="px-4 py-4">
                    {getStatusBadge(activity.status)}
                  </td>
                  <td className="px-4 py-4 text-zinc-400 text-xs">
                    {activity.time}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
