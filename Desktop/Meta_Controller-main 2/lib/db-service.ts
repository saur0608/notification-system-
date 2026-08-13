import { ObjectId } from 'mongodb';
import { getCollection } from './mongodb';
import { IUser, IMachine, IAuditLog, IAlert } from './models/User';
import bcrypt from 'bcryptjs';

// ==================== USER OPERATIONS ====================

export async function createUser(userData: Omit<IUser, '_id' | 'createdAt' | 'updatedAt' | 'loginAttempts' | 'isActive'>): Promise<IUser> {
  const users = await getCollection('users');
  
  // Ensure companyId is present, if not generate one or use default
  const { companyId, ...rest } = userData;
  const user: IUser = {
    companyId: companyId || 'default-company', // Fallback for existing code
    ...rest,
    isActive: true,
    loginAttempts: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const result = await users.insertOne(user);
  return { ...user, _id: result.insertedId };
}

export async function getUserByEmail(email: string): Promise<IUser | null> {
  return findUserByEmail(email);
}

export async function findUserByEmail(email: string): Promise<IUser | null> {
  const users = await getCollection('users');
  return users.findOne({ email }) as Promise<IUser | null>;
}

export async function findUserById(id: string | ObjectId): Promise<IUser | null> {
  const users = await getCollection('users');
  const objectId = typeof id === 'string' ? new ObjectId(id) : id;
  return users.findOne({ _id: objectId }) as Promise<IUser | null>;
}

export async function updateUser(id: string | ObjectId, updates: Partial<IUser>): Promise<boolean> {
  const users = await getCollection('users');
  const objectId = typeof id === 'string' ? new ObjectId(id) : id;
  
  const result = await users.updateOne(
    { _id: objectId },
    { 
      $set: { 
        ...updates, 
        updatedAt: new Date() 
      } 
    }
  );
  
  return result.modifiedCount > 0;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function incrementLoginAttempts(userId: ObjectId): Promise<void> {
  const users = await getCollection('users');
  
  await users.updateOne(
    { _id: userId },
    { 
      $inc: { loginAttempts: 1 },
      $set: { updatedAt: new Date() }
    }
  );
  
  // Lock account after 5 failed attempts
  const user = await findUserById(userId);
  if (user && user.loginAttempts >= 5) {
    await users.updateOne(
      { _id: userId },
      { 
        $set: { 
          lockedUntil: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
          updatedAt: new Date()
        }
      }
    );
  }
}

export async function resetLoginAttempts(userId: ObjectId): Promise<void> {
  const users = await getCollection('users');
  await users.updateOne(
    { _id: userId },
    { 
      $set: { 
        loginAttempts: 0,
        lockedUntil: null,
        lastLogin: new Date(),
        updatedAt: new Date()
      }
    }
  );
}

// ==================== MACHINE OPERATIONS ====================

export async function createMachine(machineData: Omit<IMachine, '_id' | 'createdAt' | 'updatedAt'>): Promise<IMachine> {
  const machines = await getCollection('machines');
  
  const machine: IMachine = {
    ...machineData,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const result = await machines.insertOne(machine);
  return { ...machine, _id: result.insertedId };
}

export async function findMachineById(id: string): Promise<IMachine | null> {
  const machines = await getCollection('machines');
  return machines.findOne({ machineId: id }) as Promise<IMachine | null>;
}

export async function findAllMachines(filter?: Partial<IMachine>): Promise<IMachine[]> {
  const machines = await getCollection('machines');
  return machines.find(filter || {}).toArray() as Promise<IMachine[]>;
}

export async function updateMachine(id: string, updates: Partial<IMachine>): Promise<boolean> {
  const machines = await getCollection('machines');
  
  const result = await machines.updateOne(
    { machineId: id },
    { 
      $set: { 
        ...updates, 
        updatedAt: new Date() 
      } 
    }
  );
  
  return result.modifiedCount > 0;
}

export async function deleteMachine(id: string): Promise<boolean> {
  const machines = await getCollection('machines');
  const result = await machines.deleteOne({ machineId: id });
  return result.deletedCount > 0;
}

export async function updateMachineSensorData(id: string, sensorData: IMachine['sensorData']): Promise<boolean> {
  const machines = await getCollection('machines');
  
  const result = await machines.updateOne(
    { machineId: id },
    { 
      $set: { 
        sensorData: {
          ...sensorData,
          timestamp: new Date()
        },
        updatedAt: new Date()
      } 
    }
  );
  
  return result.modifiedCount > 0;
}

export async function addMaintenanceRecord(
  machineId: string, 
  record: IMachine['maintenanceHistory'][0]
): Promise<boolean> {
  const machines = await getCollection('machines');
  
  const result = await machines.updateOne(
    { machineId },
    { 
      $push: { maintenanceHistory: record } as any,
      $set: { updatedAt: new Date() }
    }
  );
  
  return result.modifiedCount > 0;
}

// ==================== AUDIT LOG OPERATIONS ====================

export async function createAuditLog(logData: Omit<IAuditLog, '_id' | 'timestamp'>): Promise<void> {
  const logs = await getCollection('audit_logs');
  
  const log: IAuditLog = {
    ...logData,
    timestamp: new Date()
  };

  await logs.insertOne(log);
}

export async function getAuditLogs(
  filter?: Partial<IAuditLog>,
  limit: number = 100
): Promise<IAuditLog[]> {
  const logs = await getCollection('audit_logs');
  return logs
    .find(filter || {})
    .sort({ timestamp: -1 })
    .limit(limit)
    .toArray() as Promise<IAuditLog[]>;
}

// ==================== ALERT OPERATIONS ====================

export async function createAlert(alertData: Omit<IAlert, '_id' | 'createdAt'>): Promise<IAlert> {
  const alerts = await getCollection('alerts');
  
  const alert: IAlert = {
    ...alertData,
    createdAt: new Date()
  };

  const result = await alerts.insertOne(alert);
  return { ...alert, _id: result.insertedId };
}

export async function getActiveAlerts(machineId?: string): Promise<IAlert[]> {
  const alerts = await getCollection('alerts');
  const filter: any = { status: 'active' };
  
  if (machineId) {
    filter.machineId = new ObjectId(machineId);
  }
  
  return alerts
    .find(filter)
    .sort({ createdAt: -1 })
    .toArray() as Promise<IAlert[]>;
}

export async function acknowledgeAlert(
  alertId: string | ObjectId, 
  userId: string | ObjectId
): Promise<boolean> {
  const alerts = await getCollection('alerts');
  const alertObjectId = typeof alertId === 'string' ? new ObjectId(alertId) : alertId;
  const userObjectId = typeof userId === 'string' ? new ObjectId(userId) : userId;
  
  const result = await alerts.updateOne(
    { _id: alertObjectId },
    { 
      $set: { 
        status: 'acknowledged',
        acknowledgedAt: new Date(),
        acknowledgedBy: userObjectId
      } 
    }
  );
  
  return result.modifiedCount > 0;
}

export async function resolveAlert(
  alertId: string | ObjectId,
  userId: string | ObjectId,
  resolution: string
): Promise<boolean> {
  const alerts = await getCollection('alerts');
  const alertObjectId = typeof alertId === 'string' ? new ObjectId(alertId) : alertId;
  const userObjectId = typeof userId === 'string' ? new ObjectId(userId) : userId;
  
  const result = await alerts.updateOne(
    { _id: alertObjectId },
    { 
      $set: { 
        status: 'resolved',
        resolvedAt: new Date(),
        resolvedBy: userObjectId,
        resolution
      } 
    }
  );
  
  return result.modifiedCount > 0;
}

// ==================== STATISTICS & ANALYTICS ====================

export async function getMachineStatistics(): Promise<{
  total: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  recentAlerts: number;
}> {
  const machines = await getCollection('machines');
  const alerts = await getCollection('alerts');
  
  const allMachines = await machines.find({}).toArray() as IMachine[];
  
  const byStatus: Record<string, number> = {};
  const byType: Record<string, number> = {};
  
  allMachines.forEach(machine => {
    byStatus[machine.status] = (byStatus[machine.status] || 0) + 1;
    byType[machine.type] = (byType[machine.type] || 0) + 1;
  });
  
  const recentAlerts = await alerts.countDocuments({
    status: 'active',
    createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
  });
  
  return {
    total: allMachines.length,
    byStatus,
    byType,
    recentAlerts
  };
}
