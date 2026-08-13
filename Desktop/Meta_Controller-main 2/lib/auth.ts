// Authentication configuration and role-based access control

export type UserRole = 'admin' | 'engineer' | 'operator' | 'viewer';

export interface UserProfile {
  id: string;
  companyId: string;
  name: string;
  email: string;
  image?: string;
  role: UserRole;
  department?: string;
  createdAt: string;
}

export interface RolePermissions {
  canViewMachines: boolean;
  canEditMachines: boolean;
  canDeleteMachines: boolean;
  canRunAnalysis: boolean;
  canDownloadReports: boolean;
  canManageUsers: boolean;
  canAccessAPI: boolean;
  canRunSimulator: boolean;
}

// Role-based permissions matrix
export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  admin: {
    canViewMachines: true,
    canEditMachines: true,
    canDeleteMachines: true,
    canRunAnalysis: true,
    canDownloadReports: true,
    canManageUsers: true,
    canAccessAPI: true,
    canRunSimulator: true
  },
  engineer: {
    canViewMachines: true,
    canEditMachines: true,
    canDeleteMachines: false,
    canRunAnalysis: true,
    canDownloadReports: true,
    canManageUsers: false,
    canAccessAPI: true,
    canRunSimulator: true
  },
  operator: {
    canViewMachines: true,
    canEditMachines: true,
    canDeleteMachines: false,
    canRunSimulator: true,
    canDownloadReports: false, // Fixed typo from canRunnloadReports
    canManageUsers: false,
    canAccessAPI: false,
    canRunAnalysis: false // Added missing property
  },
  viewer: {
    canViewMachines: true,
    canEditMachines: false,
    canDeleteMachines: false,
    canRunSimulator: false,
    canDownloadReports: false, // Fixed typo from canRunnloadReports
    canManageUsers: false,
    canAccessAPI: false,
    canRunAnalysis: false // Added missing property
  }
};

export function hasPermission(user: UserProfile | null, permission: keyof RolePermissions): boolean {
  if (!user) return false;
  return ROLE_PERMISSIONS[user.role][permission];
}

export function canAccessRoute(user: UserProfile | null, route: string): boolean {
  if (!user) return false;

  const permissions = ROLE_PERMISSIONS[user.role];

  // Route-based access control
  if (route.startsWith('/machines') && !permissions.canViewMachines) {
    return false;
  }

  if (route.startsWith('/simulator') && !permissions.canRunSimulator) {
    return false;
  }

  if (route.startsWith('/api/machines') && route.includes('DELETE') && !permissions.canDeleteMachines) {
    return false;
  }

  return true;
}
