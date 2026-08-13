'use client';

import React, { useState, useEffect } from 'react';
import { Shift, ShiftAssignment, Employee } from '@/lib/types-employee';
import { Plus, Calendar, Clock, User, Trash2, Edit2 } from 'lucide-react';

// Mock data for initial development
const MOCK_SHIFTS: Shift[] = [
  { id: '1', companyId: 'mock-company', name: 'Morning Shift', startTime: '06:00', endTime: '14:00', description: 'Standard morning shift' },
  { id: '2', companyId: 'mock-company', name: 'Evening Shift', startTime: '14:00', endTime: '22:00', description: 'Standard evening shift' },
  { id: '3', companyId: 'mock-company', name: 'Night Shift', startTime: '22:00', endTime: '06:00', description: 'Overnight shift' },
];

export default function ShiftManagementPage() {
  const [shifts, setShifts] = useState<Shift[]>(MOCK_SHIFTS);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [assignments, setAssignments] = useState<ShiftAssignment[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentShift, setCurrentShift] = useState<Partial<Shift>>({});
  const [assignedEmployeeIds, setAssignedEmployeeIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch employees
    fetch('/api/employees')
      .then(res => res.json())
      .then(data => {
        if (data.success) setEmployees(data.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch employees', err);
        setLoading(false);
      });
  }, []);

  const openModal = (shift?: Shift) => {
    if (shift) {
      setCurrentShift(shift);
      const currentAssignments = assignments
        .filter(a => a.shiftId === shift.id)
        .map(a => a.employeeId);
      setAssignedEmployeeIds(currentAssignments);
    } else {
      setCurrentShift({});
      setAssignedEmployeeIds([]);
    }
    setIsModalOpen(true);
  };

  const handleSaveShift = () => {
    if (!currentShift.name || !currentShift.startTime || !currentShift.endTime) return;

    let shiftId = currentShift.id;

    if (shiftId) {
      // Update
      setShifts(shifts.map(s => s.id === shiftId ? { ...s, ...currentShift } as Shift : s));
    } else {
      // Create
      shiftId = Math.random().toString(36).substr(2, 9);
      const newShift: Shift = {
        ...currentShift as Shift,
        id: shiftId,
        companyId: 'mock-company',
      };
      setShifts([...shifts, newShift]);
    }

    // Update assignments
    const otherAssignments = assignments.filter(a => a.shiftId !== shiftId);
    const newAssignments = assignedEmployeeIds.map(empId => ({
      id: Math.random().toString(36).substr(2, 9),
      companyId: 'mock-company',
      employeeId: empId,
      shiftId: shiftId!,
      startDate: new Date().toISOString().split('T')[0],
    }));

    setAssignments([...otherAssignments, ...newAssignments]);
    setIsModalOpen(false);
    setCurrentShift({});
    setAssignedEmployeeIds([]);
  };

  const handleDeleteShift = (id: string) => {
    if (confirm('Are you sure you want to delete this shift?')) {
      setShifts(shifts.filter(s => s.id !== id));
      setAssignments(assignments.filter(a => a.shiftId !== id));
    }
  };

  const getShiftEmployees = (shiftId: string) => {
    const empIds = assignments.filter(a => a.shiftId === shiftId).map(a => a.employeeId);
    return employees.filter(e => empIds.includes(e.id));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shift Management</h1>
          <p className="text-gray-600">Manage work shifts and schedules</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Shift
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shifts.map(shift => {
          const shiftEmployees = getShiftEmployees(shift.id);
          return (
            <div key={shift.id} className="bg-white p-6 rounded-xl border border-gray-300 shadow-md hover:shadow-lg transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg mr-3">
                    <Clock className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{shift.name}</h3>
                    <p className="text-sm text-gray-500 font-medium">{shift.startTime} - {shift.endTime}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => openModal(shift)}
                    className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteShift(shift.id)}
                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-4 min-h-[3rem]">{shift.description || 'No description provided.'}</p>
              
              <div className="border-t border-gray-100 pt-4">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Assigned Employees ({shiftEmployees.length})</h4>
                <div className="flex -space-x-2 overflow-hidden items-center h-8">
                  {shiftEmployees.slice(0, 5).map((emp) => (
                    <div key={emp.id} className="w-8 h-8 rounded-full bg-purple-100 border-2 border-white flex items-center justify-center text-xs font-medium text-purple-700" title={emp.name}>
                      {emp.name.charAt(0)}
                    </div>
                  ))}
                  {shiftEmployees.length > 5 && (
                    <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs text-gray-500">
                      +{shiftEmployees.length - 5}
                    </div>
                  )}
                  {shiftEmployees.length === 0 && (
                    <span className="text-sm text-gray-400 italic pl-2">No employees assigned</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{currentShift.id ? 'Edit Shift' : 'New Shift'}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shift Name</label>
                <input
                  type="text"
                  value={currentShift.name || ''}
                  onChange={e => setCurrentShift({ ...currentShift, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Morning Shift"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={currentShift.startTime || ''}
                    onChange={e => setCurrentShift({ ...currentShift, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={currentShift.endTime || ''}
                    onChange={e => setCurrentShift({ ...currentShift, endTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={currentShift.description || ''}
                  onChange={e => setCurrentShift({ ...currentShift, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assign Employees</label>
                <div className="border border-gray-300 rounded-lg max-h-48 overflow-y-auto p-2 space-y-1 bg-gray-50">
                  {employees.map(emp => (
                    <label key={emp.id} className="flex items-center p-2 hover:bg-white rounded cursor-pointer transition-colors border border-transparent hover:border-gray-200">
                      <input
                        type="checkbox"
                        checked={assignedEmployeeIds.includes(emp.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAssignedEmployeeIds([...assignedEmployeeIds, emp.id]);
                          } else {
                            setAssignedEmployeeIds(assignedEmployeeIds.filter(id => id !== emp.id));
                          }
                        }}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 mr-3 h-4 w-4"
                      />
                      <span className="text-sm text-gray-700 font-medium">{emp.name}</span>
                      <span className="text-xs text-gray-500 ml-auto bg-gray-200 px-2 py-0.5 rounded-full capitalize">{emp.role}</span>
                    </label>
                  ))}
                  {employees.length === 0 && <div className="text-sm text-gray-500 text-center py-2">No employees found</div>}
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveShift}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Save Shift
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
