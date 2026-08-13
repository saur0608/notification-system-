'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { ApiResponse } from '@/lib/types';
import { MaintenanceTask } from '@/lib/types-maintenance';
import { 
  ArrowLeft, 
  Calendar,
  Clock,
  User,
  Wrench,
  FileText,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function MaintenanceTaskDetail({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [task, setTask] = useState<MaintenanceTask | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      fetchTask();
    }
  }, [status, router, params.id]);

  const fetchTask = async () => {
    try {
      const response = await fetch(`/api/maintenance/tasks/${params.id}`);
      const data: ApiResponse<MaintenanceTask> = await response.json();
      if (data.success && data.data) {
        setTask(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch task:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: MaintenanceTask['status']) => {
    setUpdating(true);
    try {
      const response = await fetch(`/api/maintenance/tasks/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: newStatus,
          completedDate: newStatus === 'completed' ? new Date().toISOString() : undefined
        }),
      });

      if (response.ok) {
        await fetchTask();
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setUpdating(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Task Not Found</h2>
            <Link href="/maintenance/tasks" className="text-purple-600 hover:text-purple-700">
              Back to Tasks
            </Link>
          </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-6">
            <Link
              href="/maintenance/tasks"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Tasks</span>
            </Link>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{task.title}</h1>
                <p className="text-gray-600 mt-1">Task ID: {task.id}</p>
              </div>
              <div className="flex gap-2">
                {task.status !== 'completed' && task.status !== 'cancelled' && (
                  <>
                    {task.status === 'pending' && (
                      <button
                        onClick={() => updateStatus('in-progress')}
                        disabled={updating}
                        className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50"
                      >
                        Start Task
                      </button>
                    )}
                    {task.status === 'in-progress' && (
                      <button
                        onClick={() => updateStatus('completed')}
                        disabled={updating}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        Mark Complete
                      </button>
                    )}
                    <button
                      onClick={() => updateStatus('cancelled')}
                      disabled={updating}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      Cancel Task
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Description
                </h2>
                <p className="text-gray-700">{task.description || 'No description provided'}</p>
              </div>

              {/* Notes */}
              {task.notes && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
                  <p className="text-gray-700 whitespace-pre-wrap">{task.notes}</p>
                </div>
              )}

              {/* Parts */}
              {task.parts && task.parts.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Required Parts</h2>
                  <div className="space-y-3">
                    {task.parts.map((part, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{part.name}</p>
                          <p className="text-sm text-gray-600">Quantity: {part.quantity}</p>
                        </div>
                        <p className="font-semibold text-gray-900">${part.cost.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Status Card */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Details</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      task.status === 'completed' ? 'bg-green-100 text-green-800' :
                      task.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                      task.status === 'overdue' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {task.status.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Priority</p>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      task.priority === 'critical' ? 'bg-red-100 text-red-800' :
                      task.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                      task.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Type</p>
                    <p className="text-gray-900 capitalize">{task.type}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Machine</p>
                      <p className="text-gray-900">{task.machineName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Scheduled</p>
                      <p className="text-gray-900">
                        {new Date(task.scheduledDate).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Duration</p>
                      <p className="text-gray-900">{task.estimatedDuration} hours</p>
                    </div>
                  </div>

                  {task.assignedToName && (
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Assigned To</p>
                        <p className="text-gray-900">{task.assignedToName}</p>
                        {task.assignedTo && (
                          <p className="text-xs text-gray-500">{task.assignedTo}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {task.cost && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Cost</p>
                      <p className="text-lg font-semibold text-gray-900">${task.cost.toFixed(2)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h2>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-600">Created</p>
                    <p className="text-gray-900">{new Date(task.createdAt).toLocaleString()}</p>
                  </div>
                  {task.completedDate && (
                    <div>
                      <p className="text-gray-600">Completed</p>
                      <p className="text-gray-900">{new Date(task.completedDate).toLocaleString()}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-gray-600">Last Updated</p>
                    <p className="text-gray-900">{new Date(task.updatedAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
  );
}
