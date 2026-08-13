'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Home,
  Package,
  Factory,
  Wrench,
  ClipboardCheck,
  BarChart3,
  FileText,
  ChevronRight,
  Settings,
  Cpu,
  Users,
  Clock,
  Shield,
  Activity,
  Play,
  Sliders,
  PlusCircle
} from 'lucide-react';

interface SidebarProps {
  className?: string;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  children?: NavItem[];
}

const defaultNavigation: NavItem[] = [
  {
    name: 'Home',
    href: '/',
    icon: Home,
  },
  {
    name: 'Inventory',
    href: '/inventory',
    icon: Package,
  },
  {
    name: 'Production',
    href: '/production',
    icon: Factory,
  },
  {
    name: 'Maintenance',
    href: '/maintenance',
    icon: Wrench,
    children: [
      {
        name: 'Machine Listing',
        href: '/machines',
        icon: Settings,
      },
      {
        name: 'Create Task',
        href: '/maintenance/create',
        icon: ClipboardCheck,
      },
      {
        name: 'View Tasks',
        href: '/maintenance/tasks',
        icon: ClipboardCheck,
      },
      {
        name: 'Reports',
        href: '/maintenance/reports',
        icon: FileText,
      },
    ],
  },
  {
    name: 'Quality',
    href: '/quality',
    icon: ClipboardCheck,
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: BarChart3,
  },
  {
    name: 'Employees',
    href: '/employees',
    icon: Users,
  }
];

const machineNavigation: NavItem[] = [
  { name: 'Back to Dashboard', href: '/', icon: Home },
  { 
    name: 'Machines', 
    href: '/machines', 
    icon: Factory,
    children: [
      { name: 'Overview', href: '/machines', icon: Factory },
      { name: 'Add Machine', href: '/machines/new', icon: PlusCircle },
      { name: 'Configuration', href: '/machines/settings', icon: Settings }
    ]
  },
  {
    name: 'Maintenance',
    href: '/maintenance',
    icon: Wrench,
    children: [
      { name: 'Create Task', href: '/maintenance/create', icon: ClipboardCheck },
      { name: 'View Tasks', href: '/maintenance/tasks', icon: ClipboardCheck },
      { name: 'Reports', href: '/maintenance/reports', icon: FileText },
    ],
  },
];

const employeeNavigation: NavItem[] = [
  { name: 'Back to Dashboard', href: '/', icon: Home },
  { name: 'Employee Directory', href: '/employees', icon: Users },
  { name: 'Shift Management', href: '/employees/shifts', icon: Clock },
  { name: 'Access Control', href: '/employees/permissions', icon: Shield },
  { name: 'Performance', href: '/employees/performance', icon: Activity },
];

export default function Sidebar({ className = '' }: SidebarProps) {
  const pathname = usePathname();

  // Don't show sidebar on auth pages, home page, or MetaController
  if (pathname?.startsWith('/auth') || pathname === '/' || pathname?.startsWith('/controller')) {
    return null;
  }

  const getNavigation = () => {
    if (pathname?.startsWith('/machines') || pathname?.startsWith('/maintenance')) return machineNavigation;
    if (pathname?.startsWith('/employees')) return employeeNavigation;
    return defaultNavigation;
  };

  const navigation = getNavigation();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname?.startsWith(href) || false;
  };

  return (
    <aside className={`w-64 bg-white border-r border-gray-200 min-h-screen ${className}`}>
      <div className="flex flex-col h-full">
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {navigation.map((item) => (
              <li key={item.name}>
                {item.children ? (
                  <div className="space-y-1">
                    <div className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md">
                      <item.icon className="w-5 h-5 mr-3 text-gray-400" />
                      <span className="flex-1">{item.name}</span>
                    </div>
                    <ul className="pl-11 space-y-1">
                      {item.children.map((child) => (
                        <li key={child.name}>
                          <Link
                            href={child.href}
                            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                              isActive(child.href)
                                ? 'bg-purple-50 text-purple-600'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                          >
                            {child.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive(item.href)
                        ? 'bg-purple-50 text-purple-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon
                      className={`w-5 h-5 mr-3 ${
                        isActive(item.href) ? 'text-purple-600' : 'text-gray-400'
                      }`}
                    />
                    {item.name}
                    {isActive(item.href) && (
                      <ChevronRight className="w-4 h-4 ml-auto text-purple-600" />
                    )}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <Settings className="w-4 h-4 text-gray-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">Settings</p>
              <p className="text-xs text-gray-500 truncate">Platform preferences</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
