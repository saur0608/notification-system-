'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { Wrench, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function MaintenancePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Maintenance Management</h1>
            <p className="text-gray-600 mt-1">Manage maintenance tasks, schedules, and reports</p>
          </div>

          {/* Quick Links Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link
              href="/machines"
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:border-purple-300 hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Wrench className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-purple-600">Machine Listing</h3>
              <p className="text-sm text-gray-600 mb-4">View and manage all machines in your facility</p>
              <div className="flex items-center text-purple-600 text-sm font-medium">
                <span>View Machines</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              href="/maintenance/create"
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:border-purple-300 hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Wrench className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600">Create Task</h3>
              <p className="text-sm text-gray-600 mb-4">Schedule a new maintenance task</p>
              <div className="flex items-center text-blue-600 text-sm font-medium">
                <span>Create New</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              href="/maintenance/tasks"
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:border-purple-300 hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Wrench className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-green-600">View Tasks</h3>
              <p className="text-sm text-gray-600 mb-4">Track all maintenance activities</p>
              <div className="flex items-center text-green-600 text-sm font-medium">
                <span>View All</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              href="/maintenance/reports"
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:border-purple-300 hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Wrench className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-orange-600">Reports</h3>
              <p className="text-sm text-gray-600 mb-4">View maintenance analytics and reports</p>
              <div className="flex items-center text-orange-600 text-sm font-medium">
                <span>View Reports</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
  );
}
