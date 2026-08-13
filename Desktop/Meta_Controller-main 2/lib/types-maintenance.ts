// Maintenance Task Types and Interfaces

export type MaintenanceTaskStatus = 'pending' | 'in-progress' | 'completed' | 'overdue' | 'cancelled';
export type MaintenanceTaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type MaintenanceTaskType = 
  | 'preventive' 
  | 'corrective' 
  | 'predictive' 
  | 'inspection' 
  | 'calibration' 
  | 'repair' 
  | 'replacement';

export interface MaintenanceTask {
  id: string;
  companyId: string;
  machineId: string;
  machineName: string;
  title: string;
  description: string;
  type: MaintenanceTaskType;
  priority: MaintenanceTaskPriority;
  status: MaintenanceTaskStatus;
  assignedTo?: string;
  assignedToName?: string;
  scheduledDate: string;
  completedDate?: string;
  estimatedDuration: number; // in hours
  actualDuration?: number; // in hours
  cost?: number;
  parts?: MaintenancePart[];
  notes?: string;
  attachments?: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenancePart {
  name: string;
  quantity: number;
  cost: number;
  supplier?: string;
}

export interface MaintenanceReport {
  id: string;
  companyId: string;
  machineId: string;
  machineName: string;
  reportDate: string;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  totalCost: number;
  totalDowntime: number; // in hours
  mtbf: number; // Mean Time Between Failures (hours)
  mttr: number; // Mean Time To Repair (hours)
  availability: number; // percentage
  tasksByType: Record<MaintenanceTaskType, number>;
  tasksByPriority: Record<MaintenanceTaskPriority, number>;
  trends: MaintenanceTrend[];
}

export interface MaintenanceTrend {
  date: string;
  tasksCompleted: number;
  downtime: number;
  cost: number;
}

export interface MaintenanceSchedule {
  id: string;
  companyId: string;
  machineId: string;
  machineName: string;
  taskType: MaintenanceTaskType;
  title: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  interval: number; // number of frequency units
  lastPerformed?: string;
  nextDue: string;
  estimatedDuration: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
