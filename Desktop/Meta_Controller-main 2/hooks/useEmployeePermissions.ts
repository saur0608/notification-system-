'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { EmployeePermissions } from '@/lib/types-employee';

export default function useEmployeePermissions() {
  const { data: session } = useSession();
  const [permissions, setPermissions] = useState<EmployeePermissions | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPermissions() {
      if (!session?.user?.email) {
        setLoading(false);
        return;
      }

      // Admin has all permissions
      if (session.user.role === 'admin') {
        setPermissions({
          canCreateMachine: true,
          canEditMachine: true,
          canDeleteMachine: true,
          canViewMachines: true,
          canCreateMaintenanceTask: true,
          canEditMaintenanceTask: true,
          canDeleteMaintenanceTask: true,
          canViewMaintenanceTasks: true,
          canViewReports: true,
          canManageEmployees: true,
          canViewAnalytics: true,
          canAccessSimulator: true,
        });
        setLoading(false);
        return;
      }

      try {
        // Fetch employee permissions
        const response = await fetch(`/api/employees?email=${session.user.email}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data.length > 0) {
            setPermissions(data.data[0].permissions);
          }
        }
      } catch (error) {
        console.error('Error fetching permissions:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPermissions();
  }, [session]);

  const hasPermission = (permission: keyof EmployeePermissions): boolean => {
    if (!permissions) return false;
    return permissions[permission] === true;
  };

  const hasAnyPermission = (permissionKeys: (keyof EmployeePermissions)[]): boolean => {
    return permissionKeys.some(key => hasPermission(key));
  };

  const hasAllPermissions = (permissionKeys: (keyof EmployeePermissions)[]): boolean => {
    return permissionKeys.every(key => hasPermission(key));
  };

  return {
    permissions,
    loading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin: session?.user?.role === 'admin',
  };
}
