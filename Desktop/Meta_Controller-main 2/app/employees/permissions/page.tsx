'use client';

import React, { useState, useEffect } from 'react';
import { Employee, EmployeeRole, defaultPermissions, EmployeePermissions } from '@/lib/types-employee';
import { Shield, Check, X, AlertTriangle } from 'lucide-react';

export default function AccessControlPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<EmployeeRole>('admin');

  useEffect(() => {
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

  const handleRoleChange = async (employeeId: string, newRole: EmployeeRole) => {
    // Optimistic update
    const updatedEmployees = employees.map(emp => 
      emp.id === employeeId ? { ...emp, role: newRole, permissions: defaultPermissions[newRole] } : emp
    );
    setEmployees(updatedEmployees);

    // In a real app, we would call the API here
    // await fetch(`/api/employees/${employeeId}`, { method: 'PATCH', body: JSON.stringify({ role: newRole }) });
  };

  const permissionKeys = Object.keys(defaultPermissions.admin) as (keyof EmployeePermissions)[];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Access Control</h1>
        <p className="text-gray-600">Manage employee roles and permissions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Employee Role Management */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-300 shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Employee Roles</h2>
            <p className="text-sm text-gray-500">Assign roles to employees to control their access</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100 text-gray-700 font-semibold border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3">Employee</th>
                  <th className="px-6 py-3">Current Role</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {employees.map(employee => (
                  <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{employee.name}</div>
                      <div className="text-gray-500 text-xs">{employee.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                        ${employee.role === 'admin' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                          employee.role === 'engineer' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                          employee.role === 'operator' ? 'bg-green-100 text-green-800 border border-green-200' :
                          'bg-gray-100 text-gray-800 border border-gray-200'}`}>
                        {employee.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={employee.role}
                        onChange={(e) => handleRoleChange(employee.id, e.target.value as EmployeeRole)}
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md shadow-sm bg-white text-gray-900"
                      >
                        <option value="admin">Admin</option>
                        <option value="engineer">Engineer</option>
                        <option value="operator">Operator</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    </td>
                  </tr>
                ))}
                {employees.length === 0 && !loading && (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-gray-500">No employees found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Role Definitions */}
        <div className="bg-white rounded-xl border border-gray-300 shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Role Permissions</h2>
            <p className="text-sm text-gray-500">View what each role can do</p>
          </div>
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {(['admin', 'engineer', 'operator', 'viewer'] as EmployeeRole[]).map(role => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-colors
                    ${selectedRole === role 
                      ? 'bg-purple-600 text-white shadow-sm' 
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'}`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
          <div className="p-6 max-h-[600px] overflow-y-auto">
            <div className="space-y-3">
              {permissionKeys.map(key => (
                <div key={key} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <span className="text-sm text-gray-700 font-medium">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^can /, '').trim()}
                  </span>
                  {defaultPermissions[selectedRole][key] ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <X className="w-5 h-5 text-red-400" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
