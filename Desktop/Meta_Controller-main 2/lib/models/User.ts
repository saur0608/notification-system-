import { ObjectId } from 'mongodb';

export interface IUser {
  _id?: ObjectId;
  companyId: string; // Multi-tenancy support
  email: string;
  name: string;
  image?: string;
  role: 'admin' | 'engineer' | 'operator' | 'viewer'|'Guest-User';
  department?: string;
  passwordHash?: string; // For credential-based auth
  googleId?: string; // For OAuth
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  loginAttempts: number;
  lockedUntil?: Date;
  preferences?: {
    notifications: boolean;
    theme: 'light' | 'dark';
    language: string;
  };
}

export interface IMachine {
  _id?: ObjectId;
  companyId: string; // Multi-tenancy support
  machineId: string;
  name: string;
  type: 'CNC' | 'Lathe' | 'Press' | 'Pump' | 'Compressor' | 'Motor' | 'Conveyor';
  status: 'running' | 'idle' | 'maintenance' | 'fault';
  location: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  installDate?: Date;
  sensorData: {
    rpm: number;
    vibration: number;
    temperature: number;
    current: number;
    load: number;
    timestamp: Date;
  };
  predictions?: {
    anomalyScore: number;
    healthScore: number;
    predictedFailure?: Date;
    maintenanceRecommendation?: string;
    updatedAt: Date;
  };
  maintenanceHistory: Array<{
    date: Date;
    type: 'preventive' | 'corrective' | 'inspection';
    description: string;
    performedBy: string;
    cost?: number;
    parts?: string[];
  }>;
  createdAt: Date;
  updatedAt: Date;
  createdBy: ObjectId;
  updatedBy: ObjectId;
}

export interface IAuditLog {
  _id?: ObjectId;
  timestamp: Date;
  userId?: ObjectId;
  action: string;
  resource: string;
  method?: string;
  ip: string;
  userAgent: string;
  status: 'success' | 'failure';
  details?: string;
  requestBody?: any;
  responseCode?: number;
}

export interface ISession {
  _id?: ObjectId;
  userId: ObjectId;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  ip: string;
  userAgent: string;
}

export interface IAlert {
  _id?: ObjectId;
  machineId: ObjectId;
  type: 'fault' | 'warning' | 'maintenance' | 'anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  status: 'active' | 'acknowledged' | 'resolved';
  createdAt: Date;
  acknowledgedAt?: Date;
  acknowledgedBy?: ObjectId;
  resolvedAt?: Date;
  resolvedBy?: ObjectId;
  resolution?: string;
}
