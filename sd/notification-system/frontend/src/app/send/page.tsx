'use client';

import { useState } from "react";
import { Send, CalendarClock, Eye, Save, Type, Tags, UploadCloud, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function SendMessage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: "Marketing",
    channels: [] as string[],
    audience: "Single User",
    recipient: "",
    priority: "Medium",
    subject: "",
    message: ""
  });
  const [previewTab, setPreviewTab] = useState("Email");
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const handleChannelToggle = (channel: string) => {
    setFormData(prev => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter(c => c !== channel)
        : [...prev.channels, channel]
    }));
  };

  const handlePrioritySelect = (priority: string) => {
    setFormData(prev => ({ ...prev, priority }));
  };

  const insertVariable = (variable: string) => {
    setFormData(prev => ({
      ...prev,
      message: prev.message + variable
    }));
  };

  const fetchUsers = async (q: string) => {
    setSearchQuery(q);
    if (q.length > 1) {
      try {
        const res = await fetch(`/api/users/search?q=${q}`);
        const data = await res.json();
        setSuggestions(data);
      } catch (e) {
        console.error(e);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSend = async (schedule: boolean) => {
    // Validation
    if (!formData.recipient) return toast.error("Recipient is missing.");
    if (!formData.subject) return toast.error("Subject is empty.");
    if (!formData.message) return toast.error("Message body is empty.");
    if (formData.channels.length === 0) return toast.error("Please select at least one delivery channel.");

    setLoading(true);
    try {
      const res = await fetch("/api/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, schedule })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        // Reset form on success
        setFormData({
          type: "Marketing", channels: [], audience: "Single User", recipient: "", priority: "Medium", subject: "", message: ""
        });
      } else {
        toast.error(data.error || "Failed to send message.");
      }
    } catch (e) {
      toast.error("An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Send Message</h1>
        <p className="text-zinc-400">Compose and send notifications across all available channels.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: Configuration */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-6 rounded-xl space-y-5">
            <h3 className="text-lg font-semibold border-b border-[var(--card-border)] pb-3">Configuration</h3>

            {/* Message Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Message Type</label>
              <select
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
                className="w-full bg-black/40 border border-[var(--card-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500/50 text-white">
                {['OTP', 'Marketing', 'Promotion', 'Reminder', 'Alert', 'Announcement', 'Invoice', 'Verification', 'Password Reset', 'Order Update', 'Shipment Update', 'Newsletter', 'Security Alert'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Delivery Channels */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Delivery Channels</label>
              <div className="flex flex-wrap gap-2">
                {['Email', 'SMS', 'Push Notification', 'WhatsApp', 'In-App'].map(c => (
                  <button
                    key={c}
                    onClick={() => handleChannelToggle(c)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${formData.channels.includes(c) ? 'bg-purple-500/30 border-purple-500 text-white' : 'border-[var(--card-border)] bg-black/20 hover:bg-purple-500/20 hover:border-purple-500/50 text-zinc-300'}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Audience */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Audience</label>
              <select
                value={formData.audience}
                onChange={e => setFormData({ ...formData, audience: e.target.value })}
                className="w-full bg-black/40 border border-[var(--card-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500/50 text-white">
                {['Single User', 'Multiple Users', 'User Group', 'All Users', 'Premium Users', 'Active Users', 'Inactive Users'].map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>

            {/* Recipient Search */}
            <div className="space-y-2 relative">
              <label className="text-sm font-medium text-zinc-300">Recipient</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => fetchUsers(e.target.value)}
                placeholder="Search by Name, Email, Phone, or ID"
                className="w-full bg-black/40 border border-[var(--card-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500/50 text-white placeholder:text-zinc-600"
              />
              {suggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-zinc-900 border border-[var(--card-border)] rounded-lg shadow-xl max-h-48 overflow-y-auto">
                  {suggestions.map((u: any) => (
                    <div
                      key={u.id}
                      className="p-2 hover:bg-white/10 cursor-pointer text-sm"
                      onClick={() => {
                        setFormData({ ...formData, recipient: u.email });
                        setSearchQuery(u.email);
                        setSuggestions([]);
                      }}
                    >
                      <div className="font-semibold">{u.name}</div>
                      <div className="text-xs text-zinc-400">{u.email} • {u.phone}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Priority</label>
              <div className="grid grid-cols-4 gap-2">
                {['Low', 'Medium', 'High', 'Critical'].map(p => (
                  <button
                    key={p}
                    onClick={() => handlePrioritySelect(p)}
                    className={`py-1.5 rounded-md border text-xs font-medium transition-colors ${formData.priority === p ? 'bg-purple-500/30 border-purple-500 text-white' : 'border-[var(--card-border)] bg-black/20 hover:bg-white/10 text-zinc-300'}`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Composer & Preview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-xl flex flex-col">
            <h3 className="text-lg font-semibold border-b border-[var(--card-border)] pb-3 mb-5">Message Composer</h3>

            <div className="space-y-4 flex-1">
              <div>
                <label className="text-sm font-medium text-zinc-300 mb-1.5 block">Subject / Title</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={e => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Enter message subject..."
                  className="w-full bg-black/40 border border-[var(--card-border)] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500/50 text-white placeholder:text-zinc-600"
                />
              </div>

              <div className="flex-1 flex flex-col">
                <label className="text-sm font-medium text-zinc-300 mb-1.5 flex items-center justify-between">
                  <span>Message Body</span>
                  <div className="flex gap-2">
                    <button className="text-xs text-purple-400 hover:text-purple-300 font-medium">Use Template</button>
                    <button className="text-xs text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1"><Type className="w-3 h-3" /> Rich Text</button>
                  </div>
                </label>

                {/* Editor Toolbar */}
                <div className="border border-[var(--card-border)] border-b-0 rounded-t-lg bg-black/60 p-2 flex gap-2 overflow-x-auto">
                  <button className="p-1.5 rounded hover:bg-white/10 text-zinc-400"><Type className="w-4 h-4" /></button>
                  <button className="p-1.5 rounded hover:bg-white/10 text-zinc-400 font-bold">B</button>
                  <button className="p-1.5 rounded hover:bg-white/10 text-zinc-400 italic font-serif">I</button>
                  <button className="p-1.5 rounded hover:bg-white/10 text-zinc-400 underline">U</button>
                  <div className="w-px bg-[var(--card-border)] mx-1"></div>
                  <button className="p-1.5 rounded hover:bg-white/10 text-zinc-400 text-xs">🔗</button>
                  <button className="p-1.5 rounded hover:bg-white/10 text-zinc-400 text-xs">😀</button>
                  <div className="w-px bg-[var(--card-border)] mx-1"></div>
                  <button className="flex items-center gap-1 p-1.5 rounded hover:bg-white/10 text-zinc-400 text-xs"><UploadCloud className="w-4 h-4" /> Attach</button>
                </div>

                <textarea
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  className="w-full flex-1 min-h-[150px] bg-black/40 border border-[var(--card-border)] rounded-b-lg px-4 py-3 text-sm focus:outline-none focus:border-purple-500/50 text-white placeholder:text-zinc-600 resize-y"
                  placeholder="Type your message here..."
                ></textarea>
              </div>

              {/* Variables */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-400 flex items-center gap-1"><Tags className="w-3 h-3" /> Click variable to insert</label>
                <div className="flex flex-wrap gap-2">
                  {['{{username}}', '{{otp}}', '{{order_id}}', '{{tracking_id}}', '{{date}}', '{{company}}'].map(v => (
                    <button
                      key={v}
                      onClick={() => insertVariable(v)}
                      className="px-2 py-1 rounded bg-purple-500/10 text-purple-300 text-xs font-mono hover:bg-purple-500/20 transition-colors border border-purple-500/20 cursor-pointer">
                      {v}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Live Preview Panel */}
          <div className="glass-panel p-6 rounded-xl flex flex-col">
            <div className="flex items-center justify-between border-b border-[var(--card-border)] pb-3 mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2"><Eye className="w-4 h-4" /> Live Preview</h3>
              <div className="flex gap-2 text-xs">
                {['Desktop', 'Mobile', 'Email', 'Push Notification', 'WhatsApp'].map(t => (
                  <button
                    key={t}
                    onClick={() => setPreviewTab(t)}
                    className={`px-2 py-1 rounded transition-colors ${previewTab === t ? 'bg-purple-500/20 text-purple-300' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >{t}</button>
                ))}
              </div>
            </div>

            <div className="bg-black/50 border border-[var(--card-border)] rounded-lg p-4 min-h-[150px] flex items-start justify-center">
              {/* Simple generic preview rendering */}
              <div className={`bg-white text-black p-4 rounded shadow-xl ${previewTab === 'Mobile' || previewTab === 'WhatsApp' ? 'w-64 max-w-full' : 'w-full max-w-md'} break-words`}>
                <div className="font-bold border-b pb-2 mb-2">{formData.subject || 'Subject Preview'}</div>
                <div className="text-sm whitespace-pre-wrap">{formData.message || 'Message content will appear here...'}</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm font-medium hover:bg-white/10 transition-colors">
                <Save className="w-4 h-4" /> Save Draft
              </button>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleSend(true)}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm font-medium hover:bg-blue-500/20 transition-colors disabled:opacity-50">
                <CalendarClock className="w-4 h-4" /> Schedule
              </button>
              <button
                onClick={() => handleSend(false)}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)] text-sm font-bold hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] transition-all disabled:opacity-50">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {loading ? 'Sending...' : 'Send Now'}
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
