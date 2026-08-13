// MongoDB database operations
// Replaced in-memory storage with persistent MongoDB

import { Machine } from './types';
import { MaintenanceTask, MaintenanceSchedule, MaintenanceReport } from './types-maintenance';
import { Employee } from './types-employee';
import { getDatabase } from './mongodb';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';

// CRUD operations
export const db = {
  machines: {
    getAll: async (companyId?: string) => {
      try {
        // Security: If no companyId provided, return empty array to prevent data leakage
        if (!companyId) return [];

        const database = await getDatabase();
        const collection = database.collection('machines');
        const query = { companyId };
        const machines = await collection.find(query).toArray();
        return machines.map(doc => {
          const { _id, ...rest } = doc;
          return {
            id: _id.toString(),
            companyId: rest.companyId || 'default-company', // Fallback
            name: rest.name || '',
            type: rest.type || 'Motor',
            location: rest.location || '',
            manufacturer: rest.manufacturer,
            model: rest.model,
            serialNumber: rest.serialNumber,
            status: rest.status || 'idle',
            health: rest.health || 100,
            efficiency: rest.efficiency || 100,
            specifications: rest.specifications || {
              maxRPM: 1500,
              maxLoad: 25,
              maxTemp: 70,
              powerRating: 7.5
            },
            sensorData: rest.sensorData,
            predictions: rest.predictions,
            createdAt: rest.createdAt || new Date().toISOString(),
            updatedAt: rest.updatedAt || new Date().toISOString()
          } as Machine;
        });
      } catch (error) {
        console.error('Error in getAll:', error);
        throw error;
      }
    },
    
    getById: async (id: string) => {
      const database = await getDatabase();
      const collection = database.collection('machines');
      const machine = await collection.findOne({ _id: new ObjectId(id) });
      if (!machine) return null;
      const { _id, ...rest } = machine;
      return {
        ...rest,
        id: _id.toString(),
        companyId: rest.companyId || 'default-company'
      } as Machine;
    },
    
    create: async (machine: Omit<Machine, 'id' | 'createdAt' | 'updatedAt'>) => {
      const database = await getDatabase();
      const collection = database.collection('machines');
      const now = new Date().toISOString();
      const newMachine = {
        ...machine,
        createdAt: now,
        updatedAt: now
      };
      const result = await collection.insertOne(newMachine);
      return {
        ...newMachine,
        id: result.insertedId.toString()
      } as Machine;
    },
    
    update: async (id: string, updates: Partial<Machine>) => {
      const database = await getDatabase();
      const collection = database.collection('machines');
      const { id: _id, ...updateData } = updates as any;
      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { 
          $set: { 
            ...updateData,
            updatedAt: new Date().toISOString()
          } 
        },
        { returnDocument: 'after' }
      );
      if (!result) return null;
      const { _id: docId, ...rest } = result;
      return {
        ...rest,
        id: docId.toString()
      } as Machine;
    },
    
    delete: async (id: string) => {
      const database = await getDatabase();
      const collection = database.collection('machines');
      const result = await collection.deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount > 0;
    }
  },

  maintenanceTasks: {
    getAll: async (companyId?: string) => {
      // Security: If no companyId provided, return empty array
      if (!companyId) return [];

      const database = await getDatabase();
      const collection = database.collection('maintenance_tasks');
      const query = { companyId };
      const tasks = await collection.find(query).toArray();
      return tasks.map(doc => {
        const { _id, ...rest } = doc;
        return { 
          ...rest, 
          id: _id.toString(),
          companyId: rest.companyId || 'default-company'
        } as MaintenanceTask;
      });
    },

    getById: async (id: string) => {
      const database = await getDatabase();
      const collection = database.collection('maintenance_tasks');
      const task = await collection.findOne({ _id: new ObjectId(id) });
      if (!task) return null;
      const { _id, ...rest } = task;
      return { ...rest, id: _id.toString() } as MaintenanceTask;
    },

    getByMachine: async (machineId: string, companyId?: string) => {
      const database = await getDatabase();
      const collection = database.collection('maintenance_tasks');
      const query: any = { machineId };
      if (companyId) {
        query.companyId = companyId;
      }
      const tasks = await collection.find(query).toArray();
      return tasks.map(doc => {
        const { _id, ...rest } = doc;
        return { 
          ...rest, 
          id: _id.toString(),
          companyId: rest.companyId || 'default-company'
        } as MaintenanceTask;
      });
    },

    create: async (task: Omit<MaintenanceTask, 'id' | 'createdAt' | 'updatedAt'>) => {
      const database = await getDatabase();
      const collection = database.collection('maintenance_tasks');
      const now = new Date().toISOString();
      const newTask = { ...task, createdAt: now, updatedAt: now };
      const result = await collection.insertOne(newTask);
      return { ...newTask, id: result.insertedId.toString() } as MaintenanceTask;
    },

    update: async (id: string, updates: Partial<MaintenanceTask>) => {
      const database = await getDatabase();
      const collection = database.collection('maintenance_tasks');
      const { id: _id, ...updateData } = updates as any;
      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { ...updateData, updatedAt: new Date().toISOString() } },
        { returnDocument: 'after' }
      );
      if (!result) return null;
      const { _id: docId, ...rest } = result;
      return { ...rest, id: docId.toString() } as MaintenanceTask;
    },

    delete: async (id: string) => {
      const database = await getDatabase();
      const collection = database.collection('maintenance_tasks');
      const result = await collection.deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount > 0;
    }
  },

  maintenanceSchedules: {
    getAll: async (companyId?: string) => {
      // Security: If no companyId provided, return empty array
      if (!companyId) return [];

      const database = await getDatabase();
      const collection = database.collection('maintenance_schedules');
      const query = { companyId };
      const schedules = await collection.find(query).toArray();
      return schedules.map(doc => {
        const { _id, ...rest } = doc;
        return { 
          ...rest, 
          id: _id.toString(),
          companyId: rest.companyId || 'default-company'
        } as MaintenanceSchedule;
      });
    },

    getByMachine: async (machineId: string, companyId?: string) => {
      const database = await getDatabase();
      const collection = database.collection('maintenance_schedules');
      const query: any = { machineId };
      if (companyId) {
        query.companyId = companyId;
      }
      const schedules = await collection.find(query).toArray();
      return schedules.map(doc => {
        const { _id, ...rest } = doc;
        return { 
          ...rest, 
          id: _id.toString(),
          companyId: rest.companyId || 'default-company'
        } as MaintenanceSchedule;
      });
    },

    create: async (schedule: Omit<MaintenanceSchedule, 'id' | 'createdAt' | 'updatedAt'>) => {
      const database = await getDatabase();
      const collection = database.collection('maintenance_schedules');
      const now = new Date().toISOString();
      const newSchedule = { ...schedule, createdAt: now, updatedAt: now };
      const result = await collection.insertOne(newSchedule);
      return { ...newSchedule, id: result.insertedId.toString() } as MaintenanceSchedule;
    },

    update: async (id: string, updates: Partial<MaintenanceSchedule>) => {
      const database = await getDatabase();
      const collection = database.collection('maintenance_schedules');
      const { id: _id, ...updateData } = updates as any;
      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { ...updateData, updatedAt: new Date().toISOString() } },
        { returnDocument: 'after' }
      );
      if (!result) return null;
      const { _id: docId, ...rest } = result;
      return { ...rest, id: docId.toString() } as MaintenanceSchedule;
    },

    delete: async (id: string) => {
      const database = await getDatabase();
      const collection = database.collection('maintenance_schedules');
      const result = await collection.deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount > 0;
    }
  },

  employees: {
    getAll: async (companyId?: string) => {
      // Security: If no companyId provided, return empty array
      if (!companyId) return [];

      const database = await getDatabase();
      const collection = database.collection('employees');
      const query = { companyId };
      const employees = await collection.find(query).toArray();
      return employees.map(doc => {
        const { _id, ...rest } = doc;
        return { 
          ...rest, 
          id: _id.toString(),
          companyId: rest.companyId || 'default-company'
        } as Employee;
      });
    },

    getById: async (id: string) => {
      const database = await getDatabase();
      const collection = database.collection('employees');
      const employee = await collection.findOne({ _id: new ObjectId(id) });
      if (!employee) return null;
      const { _id, ...rest } = employee;
      return { 
        ...rest, 
        id: _id.toString(),
        companyId: rest.companyId || 'default-company'
      } as Employee;
    },

    getByEmployeeId: async (employeeId: string) => {
      const database = await getDatabase();
      const collection = database.collection('employees');
      const employee = await collection.findOne({ employeeId });
      if (!employee) return null;
      const { _id, ...rest } = employee;
      return { ...rest, id: _id.toString() } as Employee;
    },

    getByEmail: async (email: string) => {
      const database = await getDatabase();
      const collection = database.collection('employees');
      const employee = await collection.findOne({ email });
      if (!employee) return null;
      const { _id, ...rest } = employee;
      return { 
        ...rest, 
        id: _id.toString(),
        companyId: rest.companyId || 'default-company'
      } as Employee;
    },

    create: async (employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) => {
      const database = await getDatabase();
      const collection = database.collection('employees');
      const now = new Date().toISOString();
      
      // Hash password if provided
      let employeeData: any = { ...employee };
      console.log('🆕 Creating employee, has password:', !!employeeData.password);
      if (employeeData.password) {
        console.log('🔐 Hashing password...');
        employeeData.passwordHash = await bcrypt.hash(employeeData.password, 10);
        console.log('✅ Password hashed, length:', employeeData.passwordHash.length);
        delete employeeData.password;
      }
      
      const newEmployee = { ...employeeData, createdAt: now, updatedAt: now, loginAttempts: 0, lockedUntil: null };
      console.log('💾 Inserting employee with passwordHash:', !!newEmployee.passwordHash);
      const result = await collection.insertOne(newEmployee);
      return { ...newEmployee, id: result.insertedId.toString() } as Employee;
    },

    update: async (id: string, updates: Partial<Employee>) => {
      const database = await getDatabase();
      const collection = database.collection('employees');
      const { id: _id, ...updateData } = updates as any;
      
      // Hash password if provided
      if (updateData.password) {
        updateData.passwordHash = await bcrypt.hash(updateData.password, 10);
        delete updateData.password;
      }
      
      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { ...updateData, updatedAt: new Date().toISOString() } },
        { returnDocument: 'after' }
      );
      if (!result) return null;
      const { _id: docId, ...rest } = result;
      return { ...rest, id: docId.toString() } as Employee;
    },

    delete: async (id: string) => {
      const database = await getDatabase();
      const collection = database.collection('employees');
      const result = await collection.deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount > 0;
    },

    generateEmployeeId: async () => {
      const database = await getDatabase();
      const collection = database.collection('employees');
      const lastEmployee = await collection
        .find({})
        .sort({ employeeId: -1 })
        .limit(1)
        .toArray();
      
      if (lastEmployee.length === 0) {
        return 'EMP001';
      }
      
      const lastId = lastEmployee[0].employeeId;
      const numMatch = lastId.match(/\d+$/);
      if (!numMatch) return 'EMP001';
      
      const nextNum = parseInt(numMatch[0]) + 1;
      return `EMP${nextNum.toString().padStart(3, '0')}`;
    }
  },

  sensorData: {
    getHistory: async (machineId?: string, limit: number = 100, startTime?: string) => {
      const database = await getDatabase();
      const collection = database.collection('sensor_data');
      
      const query: any = {};
      if (machineId) query.machineId = machineId;
      if (startTime) query.timestamp = { $gte: startTime };

      const data = await collection
        .find(query)
        .sort({ timestamp: -1 })
        .limit(limit)
        .toArray();
        
      return data.map(doc => {
        const { _id, ...rest } = doc;
        return { ...rest, id: _id.toString() };
      });
    },
    
    add: async (data: any) => {
        const database = await getDatabase();
        const collection = database.collection('sensor_data');
        await collection.insertOne(data);
    }
  }
};
