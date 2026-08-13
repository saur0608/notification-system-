// Employee Management Types

export type EmployeeRole = 'admin' | 'engineer' | 'operator' | 'viewer';
export type EmployeeStatus = 'active' | 'inactive' | 'suspended';

export interface EmployeePermissions {
  canCreateMachine: boolean;
  canEditMachine: boolean;
  canDeleteMachine: boolean;
  canViewMachines: boolean;
  canCreateMaintenanceTask: boolean;
  canEditMaintenanceTask: boolean;
  canDeleteMaintenanceTask: boolean;
  canViewMaintenanceTasks: boolean;
  canViewReports: boolean;
  canManageEmployees: boolean;
  canViewAnalytics: boolean;
  canAccessSimulator: boolean;
}

export interface Employee {
  id: string;
  companyId: string; // Multi-tenancy support
  employeeId: string; // Unique employee identifier (e.g., EMP001)
  name: string;
  email: string;
  passwordHash?: string; // For credential-based login
  role: EmployeeRole;
  status: EmployeeStatus;
  department?: string;
  position?: string;
  phone?: string;
  hireDate: string;
  permissions: EmployeePermissions;
  lastLogin?: string;
  loginAttempts?: number;
  lockedUntil?: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export const defaultPermissions: Record<EmployeeRole, EmployeePermissions> = {
  admin: {
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
  },
  engineer: {
    canCreateMachine: true,
    canEditMachine: true,
    canDeleteMachine: false,
    canViewMachines: true,
    canCreateMaintenanceTask: true,
    canEditMaintenanceTask: true,
    canDeleteMaintenanceTask: false,
    canViewMaintenanceTasks: true,
    canViewReports: true,
    canManageEmployees: false,
    canViewAnalytics: true,
    canAccessSimulator: true,
  },
  operator: {
    canCreateMachine: false,
    canEditMachine: true,
    canDeleteMachine: false,
    canViewMachines: true,
    canCreateMaintenanceTask: true,
    canEditMaintenanceTask: true,
    canDeleteMaintenanceTask: false,
    canViewMaintenanceTasks: true,
    canViewReports: false,
    canManageEmployees: false,
    canViewAnalytics: false,
    canAccessSimulator: false,
  },
  viewer: {
    canCreateMachine: false,
    canEditMachine: false,
    canDeleteMachine: false,
    canViewMachines: true,
    canCreateMaintenanceTask: false,
    canEditMaintenanceTask: false,
    canDeleteMaintenanceTask: false,
    canViewMaintenanceTasks: true,
    canViewReports: true,
    canManageEmployees: false,
    canViewAnalytics: true,
    canAccessSimulator: false,
  },
};

export interface Shift {
  id: string;
  companyId: string;
  name: string;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  description?: string;
}

export interface ShiftAssignment {
  id: string;
  companyId: string;
  employeeId: string;
  shiftId: string;
  startDate: string;
  endDate?: string;
}

export interface PerformanceReview {
  id: string;
  companyId: string;
  employeeId: string;
  reviewerId: string;
  date: string;
  rating: number; // 1-5
  comments: string;
  goals?: string;
}

export interface PerformanceMetric {
  id: string;
  companyId: string;
  employeeId: string;
  metricName: string;
  value: number;
  unit: string;
  date: string;
}

  
