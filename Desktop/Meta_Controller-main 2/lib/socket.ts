import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { NextApiResponse } from 'next';

export type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: HTTPServer & {
      io?: SocketIOServer;
    };
  };
};

export interface MachineUpdate {
  machineId: string;
  timestamp: string;
  sensorData: {
    rpm: number;
    load: number;
    current: number;
    temperature: number;
    vibration: number;
    torque: number;
    loadKw: number;
  };
  health: number;
  efficiency: number;
  status: string;
  predictions?: any;
}

export function initSocketIO(res: NextApiResponseWithSocket) {
  if (res.socket.server.io) {
    console.log('Socket.IO already initialized');
    return res.socket.server.io;
  }

  console.log('🔌 Initializing Socket.IO server...');
  
  const io = new SocketIOServer(res.socket.server, {
    path: '/api/socket',
    addTrailingSlash: false,
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log('✅ Client connected:', socket.id);

    // Join machine monitoring room
    socket.on('join-monitoring', () => {
      socket.join('machine-monitoring');
      console.log(`Client ${socket.id} joined machine-monitoring room`);
    });

    // Leave machine monitoring room
    socket.on('leave-monitoring', () => {
      socket.leave('machine-monitoring');
      console.log(`Client ${socket.id} left machine-monitoring room`);
    });

    // Subscribe to specific machine
    socket.on('subscribe-machine', (machineId: string) => {
      socket.join(`machine-${machineId}`);
      console.log(`Client ${socket.id} subscribed to machine-${machineId}`);
    });

    // Unsubscribe from specific machine
    socket.on('unsubscribe-machine', (machineId: string) => {
      socket.leave(`machine-${machineId}`);
      console.log(`Client ${socket.id} unsubscribed from machine-${machineId}`);
    });

    // --- Compatibility with useWebSocket hook ---
    socket.on('subscribe', (machineId: string) => {
      socket.join(`machine-${machineId}`);
    });

    socket.on('unsubscribe', (machineId: string) => {
      socket.leave(`machine-${machineId}`);
    });

    socket.on('machine_update', (update: MachineUpdate) => {
      // Broadcast to everyone else
      socket.broadcast.emit('machine_update', update);
    });

    // Handle control commands from client
    socket.on('machine_command', (data: {
      machineId: string;
      command: string;
      params?: any;
    }) => {
      console.log('📨 Received machine command:', data);
      
      // Update simulator based on command
      if (data.command === 'start') {
        console.log(`▶️ Starting machine ${data.machineId}`);
      }
      
      // Acknowledge command
      socket.emit('command_ack', {
        machineId: data.machineId,
        command: data.command,
        status: 'received',
        timestamp: new Date().toISOString(),
      });
      
      console.log(`✅ Command ${data.command} acknowledged for machine ${data.machineId}`);
    });

    socket.on('disconnect', () => {
      console.log('❌ Client disconnected:', socket.id);
    });
  });

  res.socket.server.io = io;
  console.log('✅ Socket.IO initialized');
  
  return io;
}

// Initialize server-side simulator
async function initializeServerSimulator(io: SocketIOServer) {
  try {
    // Fetch real machines from database
    console.log('🔄 Fetching machines from database...');
    // In a real app, we would start a simulation loop here
  } catch (error) {
    console.error('Error initializing simulator:', error);
  }
}

// Broadcast alert
export function broadcastAlert(
  io: SocketIOServer,
  alert: {
    machineId: string;
    type: string;
    severity: string;
    message: string;
    timestamp: string;
  }
) {
  io.to('machine-monitoring').emit('machine-alert', alert);
}
