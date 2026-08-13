import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface MachineUpdate {
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
  history?: number[][];
}

interface MachineAlert {
  machineId: string;
  type: string;
  severity: string;
  message: string;
  timestamp: string;
}

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [machineUpdates, setMachineUpdates] = useState<MachineUpdate[]>([]);
  const [alerts, setAlerts] = useState<MachineAlert[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Initialize Socket.IO connection
    const socketInit = async () => {
      await fetch('/api/socket'); // Ensure server socket is initialized
      
      socketRef.current = io({
        path: '/api/socket',
        addTrailingSlash: false,
      });

      socketRef.current.on('connect', () => {
        console.log('✅ WebSocket Connected');
        setIsConnected(true);
      });

      socketRef.current.on('disconnect', () => {
        console.log('❌ WebSocket Disconnected');
        setIsConnected(false);
      });

      socketRef.current.on('machine_update', (update: MachineUpdate) => {
        console.log('📊 Received machine update:', update.machineId, 'RPM:', update.sensorData.rpm, 'Status:', update.status);
        setMachineUpdates(prev => [...prev.slice(-50), update]);
      });

      socketRef.current.on('machine_alert', (alert: MachineAlert) => {
        setAlerts(prev => [alert, ...prev].slice(0, 10));
      });
    };

    socketInit();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const subscribeMachine = (machineId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('subscribe', machineId);
    }
  };

  const unsubscribeMachine = (machineId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('unsubscribe', machineId);
    }
  };

  const sendCommand = async (machineId: string, command: string, params?: any) => {
    if (socketRef.current) {
      console.log('🎮 Sending command:', command, 'to machine:', machineId, 'params:', params);
      socketRef.current.emit('machine_command', { machineId, command, params });
    } else {
      console.error('❌ Socket not connected, cannot send command');
    }
  };

  const broadcastUpdate = (update: MachineUpdate) => {
    if (socketRef.current) {
      socketRef.current.emit('machine_update', update);
    }
  };

  return {
    isConnected,
    machineUpdates,
    alerts,
    subscribeMachine,
    unsubscribeMachine,
    sendCommand,
    broadcastUpdate
  };
}
