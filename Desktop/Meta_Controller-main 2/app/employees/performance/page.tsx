'use client';

import React, { useState, useEffect } from 'react';
import { Employee, PerformanceReview, PerformanceMetric } from '@/lib/types-employee';
import { Activity, Star, TrendingUp, Calendar, User, Plus } from 'lucide-react';

// Mock data
const MOCK_REVIEWS: PerformanceReview[] = [
  { id: '1', companyId: 'mock-company', employeeId: '1', reviewerId: 'admin', date: '2023-10-15', rating: 4, comments: 'Excellent work on the new machine setup.', goals: 'Improve documentation skills.' },
  { id: '2', companyId: 'mock-company', employeeId: '1', reviewerId: 'admin', date: '2023-11-20', rating: 5, comments: 'Outstanding problem solving during the outage.', goals: 'Mentor junior engineers.' },
];

const MOCK_METRICS: PerformanceMetric[] = [
  { id: '1', companyId: 'mock-company', employeeId: '1', metricName: 'Tasks Completed', value: 45, unit: 'tasks', date: '2023-11-01' },
  { id: '2', companyId: 'mock-company', employeeId: '1', metricName: 'Attendance', value: 98, unit: '%', date: '2023-11-01' },
  { id: '3', companyId: 'mock-company', employeeId: '1', metricName: 'Efficiency', value: 92, unit: '%', date: '2023-11-01' },
];

export default function PerformancePage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [reviews, setReviews] = useState<PerformanceReview[]>(MOCK_REVIEWS);
  const [metrics, setMetrics] = useState<PerformanceMetric[]>(MOCK_METRICS);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [newReview, setNewReview] = useState<Partial<PerformanceReview>>({ rating: 3 });

  useEffect(() => {
    fetch('/api/employees')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setEmployees(data.data);
          if (data.data.length > 0 && !selectedEmployeeId) {
            setSelectedEmployeeId(data.data[0].id);
          }
        }
      })
      .catch(err => console.error('Failed to fetch employees', err));
  }, []);

  const selectedEmployee = employees.find(e => e.id === selectedEmployeeId);
  const employeeReviews = reviews.filter(r => r.employeeId === selectedEmployeeId);
  const employeeMetrics = metrics.filter(m => m.employeeId === selectedEmployeeId);

  const handleAddReview = () => {
    if (!selectedEmployeeId || !newReview.comments) return;
    
    const review: PerformanceReview = {
      id: Math.random().toString(36).substr(2, 9),
      companyId: 'mock-company',
      employeeId: selectedEmployeeId,
      reviewerId: 'current-user', // In real app, get from session
      date: new Date().toISOString().split('T')[0],
      rating: newReview.rating || 3,
      comments: newReview.comments,
      goals: newReview.goals,
    };
    
    setReviews([review, ...reviews]);
    setIsReviewModalOpen(false);
    setNewReview({ rating: 3 });
  };

  return (
    <div className="p-6 space-y-6 h-[calc(100vh-4rem)] flex flex-col">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Performance</h1>
        <p className="text-gray-600">Employee performance metrics and reviews</p>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden">
        {/* Employee List */}
        <div className="w-1/3 bg-white rounded-xl border border-gray-300 shadow-md flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="font-semibold text-gray-900">Employees</h2>
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-1">
            {employees.map(employee => (
              <button
                key={employee.id}
                onClick={() => setSelectedEmployeeId(employee.id)}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors
                  ${selectedEmployeeId === employee.id 
                    ? 'bg-purple-50 border-purple-200 ring-1 ring-purple-200 shadow-sm' 
                    : 'hover:bg-gray-50 border border-transparent'}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium shadow-sm
                  ${selectedEmployeeId === employee.id ? 'bg-purple-600' : 'bg-gray-400'}`}>
                  {employee.name.charAt(0)}
                </div>
                <div>
                  <div className={`font-medium ${selectedEmployeeId === employee.id ? 'text-purple-900' : 'text-gray-900'}`}>
                    {employee.name}
                  </div>
                  <div className="text-xs text-gray-500">{employee.position || employee.role}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Details Panel */}
        <div className="flex-1 bg-white rounded-xl border border-gray-300 shadow-md flex flex-col overflow-hidden">
          {selectedEmployee ? (
            <div className="flex flex-col h-full">
              <div className="p-6 border-b border-gray-200 bg-gray-50 flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedEmployee.name}</h2>
                  <p className="text-gray-500">{selectedEmployee.position} • {selectedEmployee.department}</p>
                </div>
                <button
                  onClick={() => setIsReviewModalOpen(true)}
                  className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Review
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Metrics Cards */}
                <div className="grid grid-cols-3 gap-4">
                  {employeeMetrics.map(metric => (
                    <div key={metric.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="text-sm text-gray-500 mb-1">{metric.metricName}</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {metric.value} <span className="text-sm font-normal text-gray-500">{metric.unit}</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-2 flex items-center">
                        <Calendar className="w-3 h-3 mr-1" /> {metric.date}
                      </div>
                    </div>
                  ))}
                  {employeeMetrics.length === 0 && (
                    <div className="col-span-3 text-center py-4 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                      No metrics available
                    </div>
                  )}
                </div>

                {/* Reviews Timeline */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-purple-600" />
                    Performance Reviews
                  </h3>
                  <div className="space-y-4">
                    {employeeReviews.map(review => (
                      <div key={review.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:border-purple-200 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center space-x-2">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map(star => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                />
                              ))}
                            </div>
                            <span className="text-sm font-medium text-gray-900">{review.rating}/5</span>
                          </div>
                          <span className="text-sm text-gray-500">{review.date}</span>
                        </div>
                        <p className="text-gray-700 mb-3">{review.comments}</p>
                        {review.goals && (
                          <div className="bg-purple-50 p-3 rounded-lg text-sm border border-purple-100">
                            <span className="font-semibold text-purple-900">Goals: </span>
                            <span className="text-purple-800">{review.goals}</span>
                          </div>
                        )}
                      </div>
                    ))}
                    {employeeReviews.length === 0 && (
                      <div className="text-center py-8 text-gray-500">No reviews yet</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500 bg-gray-50">
              Select an employee to view performance details
            </div>
          )}
        </div>
      </div>

      {/* Add Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add Performance Review</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => setNewReview({ ...newReview, rating: star })}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 ${star <= (newReview.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comments</label>
                <textarea
                  value={newReview.comments || ''}
                  onChange={e => setNewReview({ ...newReview, comments: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={4}
                  placeholder="Enter review comments..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Goals</label>
                <textarea
                  value={newReview.goals || ''}
                  onChange={e => setNewReview({ ...newReview, goals: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={2}
                  placeholder="Set goals for next period..."
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddReview}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
