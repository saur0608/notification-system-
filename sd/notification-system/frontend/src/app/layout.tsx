import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { 
  BellRing, LayoutDashboard, Settings, Mail, MessageSquare, 
  Smartphone, MessageCircle, AppWindow, Send, Users, 
  Key, FileText, LayoutTemplate, Activity, Search,
  Sun, Moon, Menu
} from "lucide-react";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nexus | Enterprise Notifications",
  description: "Enterprise Notification Management System",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}>
      <body className="min-h-full flex bg-[var(--background)] text-[var(--foreground)]">
        
        {/* Sidebar */}
        <aside className="w-64 border-r border-[var(--card-border)] bg-[rgba(9,9,11,0.8)] backdrop-blur-2xl flex flex-col hidden lg:flex shrink-0 relative z-20">
          <div className="h-16 flex items-center px-6 border-b border-[var(--card-border)]">
            <div className="flex items-center gap-3 text-purple-500">
              <div className="p-1.5 bg-purple-500/10 rounded-lg">
                <BellRing className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold tracking-wider text-white">NEXUS</span>
            </div>
          </div>
          
          <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-8">
            {/* Dashboard section */}
            <div>
              <div className="px-3 mb-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Dashboard</div>
              <div className="space-y-1">
                <NavItem href="/" icon={<LayoutDashboard className="w-4 h-4" />} label="System Overview" />
                <NavItem href="/analytics" icon={<Activity className="w-4 h-4" />} label="Analytics" />
              </div>
            </div>

            {/* Notifications section */}
            <div>
              <div className="px-3 mb-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Notifications</div>
              <div className="space-y-1">
                <NavItem href="/send" icon={<Send className="w-4 h-4" />} label="Send Message" />
                <NavItem href="/bulk" icon={<Users className="w-4 h-4" />} label="Bulk Messages" />
                <NavItem href="/campaigns" icon={<Activity className="w-4 h-4" />} label="Campaigns" />
                <NavItem href="/templates" icon={<LayoutTemplate className="w-4 h-4" />} label="Message Templates" />
              </div>
            </div>

            {/* Channels section */}
            <div>
              <div className="px-3 mb-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Channels</div>
              <div className="space-y-1">
                <NavItem href="/channels/email" icon={<Mail className="w-4 h-4" />} label="Email" />
                <NavItem href="/channels/sms" icon={<MessageSquare className="w-4 h-4" />} label="SMS" />
                <NavItem href="/channels/push" icon={<Smartphone className="w-4 h-4" />} label="Push Notifications" />
                <NavItem href="/channels/whatsapp" icon={<MessageCircle className="w-4 h-4" />} label="WhatsApp" />
                <NavItem href="/channels/in-app" icon={<AppWindow className="w-4 h-4" />} label="In-App" />
              </div>
            </div>

            {/* System section */}
            <div>
              <div className="px-3 mb-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">System</div>
              <div className="space-y-1">
                <NavItem href="/users" icon={<Users className="w-4 h-4" />} label="Users" />
                <NavItem href="/api-keys" icon={<Key className="w-4 h-4" />} label="API Keys" />
                <NavItem href="/logs" icon={<FileText className="w-4 h-4" />} label="Logs" />
                <NavItem href="/settings" icon={<Settings className="w-4 h-4" />} label="Settings" />
              </div>
            </div>
          </nav>

          <div className="p-4 border-t border-[var(--card-border)]">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center font-semibold">
                JD
              </div>
              <div className="flex-1 truncate">
                <div className="text-sm font-medium">John Doe</div>
                <div className="text-xs text-zinc-500 truncate">admin@nexus.com</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
          
          {/* Top Header */}
          <header className="h-16 shrink-0 glass-panel border-x-0 border-t-0 flex items-center justify-between px-6 relative z-10">
            <div className="flex items-center gap-4 lg:hidden">
              <button className="p-2 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-colors">
                <Menu className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 text-purple-500">
                <BellRing className="w-5 h-5" />
                <span className="font-bold">NEXUS</span>
              </div>
            </div>

            <div className="hidden lg:flex items-center w-96 relative">
              <Search className="w-4 h-4 absolute left-3 text-zinc-500" />
              <input 
                type="text" 
                placeholder="Search campaigns, users, or messages..." 
                className="w-full bg-black/20 border border-[var(--card-border)] rounded-full py-1.5 pl-9 pr-4 text-sm focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:text-zinc-600"
              />
            </div>

            <div className="flex items-center gap-3">
              <button className="p-2 rounded-full hover:bg-white/5 text-zinc-400 hover:text-white transition-colors relative">
                <BellRing className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-black"></span>
              </button>
              <button className="p-2 rounded-full hover:bg-white/5 text-zinc-400 hover:text-white transition-colors">
                <Sun className="w-5 h-5" />
              </button>
              <div className="w-px h-6 bg-[var(--card-border)] mx-1 lg:hidden"></div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center font-semibold lg:hidden">
                JD
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 scroll-smooth">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
        
        <Toaster theme="dark" position="top-right" richColors />
      </body>
    </html>
  );
}

function NavItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link 
      href={href} 
      className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all hover:bg-purple-500/10 hover:text-purple-300 text-zinc-400"
    >
      {icon}
      <span className="font-medium text-sm">{label}</span>
    </Link>
  );
}
