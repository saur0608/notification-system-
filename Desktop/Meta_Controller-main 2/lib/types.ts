// Type definitions for the MetaController platform

export interface Company {
  id: string;
  name: string;
  domain?: string; // For auto-detection during login
  subscriptionPlan: 'free' | 'pro' | 'enterprise';
  maxEmployees: number;
  maxMachines: number;
  createdAt: string;
  updatedAt: string;
}

export interface Machine {
  id: string;
  companyId: string; // Multi-tenancy support
  name: string;
  type: 'CNC' | 'Pump' | 'Compressor' | 'Motor' | 'Conveyor' | 'Press' | 'Other';
  location: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  status: 'running' | 'idle' | 'maintenance' | 'fault';
  health: number; // 0-100
  efficiency: number; // 0-100
  specifications: {
    maxRPM: number;
    maxLoad: number;
    maxTemp: number;
    powerRating: number;
  };
  sensorData?: SensorReading;
  predictions?: MachinePredictions;
  createdAt: string;
  updatedAt: string;
}

export interface SensorReading {
  timestamp: string;
  rpm: number;
  vibration: number;
  temperature: number;
  current: number;
  load: number;
}

export interface MachinePredictions {
  anomalyScore: number;
  isAnomaly: boolean;
  nextState: {
    rpm: number;
    vibration: number;
    temperature: number;
    current: number;
  };
  loadForecast: number[];
  recommendedAction: 'decrease' | 'hold' | 'increase';
  confidence: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
