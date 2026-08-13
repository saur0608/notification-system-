'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import useEmployeePermissions from '@/hooks/useEmployeePermissions';
import {
  Activity,
  TrendingUp,
  Zap,
  AlertCircle,
  ArrowRight,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface DashboardStats {
  totalMachines: number;
  activeMachines: number;
  averageEfficiency: number;
  averageHealth: number;
  totalTasks: number;
  pendingTasks: number;
  completedTasks: number;
  overdueTasks: number;
  myAssignedTasks: number;
}

interface MaintenanceTask {
  id: string;
  title: string;
  machineName: string;
  priority: string;
  status: string;
  scheduledDate: string;
  assignedToName?: string;
}

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { hasPermission, loading: permissionsLoading } = useEmployeePermissions();
  
  const [stats, setStats] = useState<DashboardStats>({
    totalMachines: 0,
    activeMachines: 0,
    averageEfficiency: 0,
    averageHealth: 0,
    totalTasks: 0,
    pendingTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
    myAssignedTasks: 0,
  });
  const [recentTasks, setRecentTasks] = useState<MaintenanceTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      fetchDashboardData();
    }
  }, [status, router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch machines
      const machinesRes = await fetch('/api/machines');
      const machinesData = await machinesRes.json();
      
      // Fetch maintenance tasks
      const tasksRes = await fetch('/api/maintenance/tasks');
      const tasksData = await tasksRes.json();

      if (machinesData.success && tasksData.success) {
        const machines = machinesData.data || [];
        const tasks = tasksData.data || [];

        // Calculate machine statistics
        const activeMachines = machines.filter((m: any) => m.status === 'running' || m.status === 'idle').length;
        const totalEfficiency = machines.reduce((sum: number, m: any) => sum + (m.efficiency || 0), 0);
        const totalHealth = machines.reduce((sum: number, m: any) => sum + (m.health || 0), 0);

        // Calculate task statistics
        const now = new Date();
        const pendingTasks = tasks.filter((t: any) => t.status === 'pending').length;
        const completedTasks = tasks.filter((t: any) => t.status === 'completed').length;
        const overdueTasks = tasks.filter((t: any) => 
          t.status !== 'completed' && 
          t.status !== 'cancelled' && 
          new Date(t.scheduledDate) < now
        ).length;

        // Filter tasks assigned to current user
        const myTasks = tasks.filter((t: any) => 
          t.assignedTo === session?.user?.email || 
          t.assignedTo === session?.user?.id
        );

        setStats({
          totalMachines: machines.length,
          activeMachines,
          averageEfficiency: machines.length > 0 ? Math.round(totalEfficiency / machines.length * 10) / 10 : 0,
          averageHealth: machines.length > 0 ? Math.round(totalHealth / machines.length * 10) / 10 : 0,
          totalTasks: tasks.length,
          pendingTasks,
          completedTasks,
          overdueTasks,
          myAssignedTasks: myTasks.length,
        });

        // Get recent tasks (last 5, prioritize assigned to user)
        const sortedTasks = [...tasks]
          .sort((a: any, b: any) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime());
        
        const userTasks = sortedTasks.filter((t: any) => 
          t.assignedTo === session?.user?.email || t.assignedTo === session?.user?.id
        ).slice(0, 3);
        
        const otherTasks = sortedTasks
          .filter((t: any) => t.assignedTo !== session?.user?.email && t.assignedTo !== session?.user?.id)
          .slice(0, 5 - userTasks.length);

        setRecentTasks([...userTasks, ...otherTasks].slice(0, 5));
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'in-progress': return 'text-blue-600';
      case 'pending': return 'text-yellow-600';
      case 'overdue': return 'text-red-600';
      case 'cancelled': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in-progress': return <Clock className="w-4 h-4 text-blue-600" />;
      case 'overdue': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      high: 'bg-red-100 text-red-700',
      medium: 'bg-yellow-100 text-yellow-700',
      low: 'bg-green-100 text-green-700',
    };
    return colors[priority] || 'bg-gray-100 text-gray-700';
  };

  if (status === 'loading' || loading || permissionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const canViewMachines = hasPermission('canViewMachines');
  const canCreateMachine = hasPermission('canCreateMachine');
  const canCreateMaintenanceTask = hasPermission('canCreateMaintenanceTask');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Sidebar - Profile & Company Info */}
        <div className="w-full lg:w-80 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-3xl font-bold text-purple-600">
                  {session?.user?.name?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <h2 className="text-xl font-bold text-gray-900">{session?.user?.name || 'User'}</h2>
              <p className="text-sm text-gray-500">{session?.user?.email}</p>
              <div className="mt-3 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium capitalize">
                {session?.user?.role || 'Employee'}
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Company Info</h3>
              <div className="space-y-3">
                <div className="flex items-center text-gray-600">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="font-bold text-gray-700">M</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">MetaController</p>
                    <p className="text-xs text-gray-500">Industrial Solutions</p>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <p className="mb-1"><span className="font-medium">Department:</span> Operations</p>
                  <p className="mb-1"><span className="font-medium">Location:</span> Main Plant</p>
                  <p><span className="font-medium">Shift:</span> Day Shift</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="font-semibold text-gray-900">Platform Navigation</h3>
            </div>
            <div className="p-2">
              <Link href="/machines" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-purple-600 rounded-lg transition-colors">
                <Activity className="w-5 h-5 mr-3" />
                <span className="font-medium">Machines</span>
                <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100" />
              </Link>
              <Link href="/maintenance" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-purple-600 rounded-lg transition-colors">
                <Clock className="w-5 h-5 mr-3" />
                <span className="font-medium">Maintenance</span>
              </Link>
              <Link href="/employees" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-purple-600 rounded-lg transition-colors">
                <CheckCircle className="w-5 h-5 mr-3" />
                <span className="font-medium">Employees</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard Overview
            </h1>
            <p className="text-gray-600 mt-1">Real-time insights and operational metrics</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-purple-600" />
                </div>
                {stats.totalMachines > 0 && (
                  <span className="text-sm text-gray-600 font-medium">
                    {stats.activeMachines} active
                  </span>
                )}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.totalMachines}</h3>
              <p className="text-sm text-gray-600">Total Machines</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                {stats.averageEfficiency > 0 && (
                  <span className={`text-sm font-medium ${stats.averageEfficiency >= 90 ? 'text-green-600' : 'text-orange-600'}`}>
                    {stats.averageEfficiency >= 90 ? 'Good' : 'Fair'}
                  </span>
                )}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.averageEfficiency}%</h3>
              <p className="text-sm text-gray-600">Average Efficiency</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Zap className="w-6 h-6 text-green-600" />
                </div>
                {stats.averageHealth > 0 && (
                  <span className={`text-sm font-medium ${stats.averageHealth >= 85 ? 'text-green-600' : 'text-orange-600'}`}>
                    {stats.averageHealth >= 85 ? 'Healthy' : 'Monitor'}
                  </span>
                )}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.averageHealth}%</h3>
              <p className="text-sm text-gray-600">System Health</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-orange-600" />
                </div>
                {stats.overdueTasks > 0 && (
                  <span className="text-sm text-red-600 font-medium">{stats.overdueTasks} overdue</span>
                )}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.totalTasks}</h3>
              <p className="text-sm text-gray-600">Maintenance Tasks</p>
              {stats.myAssignedTasks > 0 && (
                <p className="text-xs text-purple-600 mt-1 font-medium">{stats.myAssignedTasks} assigned to you</p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {canCreateMachine && (
                <Link
                  href="/machines/new"
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:border-purple-300 hover:shadow-md transition-all group"
                >
                  <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-purple-600">Add New Machine</h3>
                  <p className="text-sm text-gray-600 mb-4">Register a new machine in your inventory</p>
                  <div className="flex items-center text-purple-600 text-sm font-medium">
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              )}

              {canCreateMaintenanceTask && (
                <Link
                  href="/maintenance/create"
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:border-purple-300 hover:shadow-md transition-all group"
                >
                  <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-purple-600">Schedule Maintenance</h3>
                  <p className="text-sm text-gray-600 mb-4">Create a new maintenance task</p>
                  <div className="flex items-center text-purple-600 text-sm font-medium">
                    <span>Create Task</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              )}

              {canViewMachines && (
                <Link
                  href="/machines"
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:border-purple-300 hover:shadow-md transition-all group"
                >
                  <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-purple-600">View Machines</h3>
                  <p className="text-sm text-gray-600 mb-4">Manage your machine inventory</p>
                  <div className="flex items-center text-purple-600 text-sm font-medium">
                    <span>View All</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              )}
            </div>
          </div>

          {/* Recent Activity / Assigned Tasks */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Recent Maintenance Tasks</h2>
            </div>
            <div className="p-6">
              {recentTasks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="mb-2">No maintenance tasks yet</p>
                  {canCreateMaintenanceTask && (
                    <Link href="/maintenance/create" className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                      Create your first task
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {recentTasks.map((task) => (
                    <div key={task.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="mt-1">
                        {getStatusIcon(task.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="text-sm font-semibold text-gray-900 truncate">{task.title}</h4>
                          <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${getPriorityBadge(task.priority)}`}>
                            {task.priority}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">Machine: {task.machineName}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className={getStatusColor(task.status)}>{task.status}</span>
                          <span>Due: {new Date(task.scheduledDate).toLocaleDateString()}</span>
                          {task.assignedToName && (
                            <span>Assigned to: {task.assignedToName}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
