import { NextApiRequest } from 'next';
import { initSocketIO, NextApiResponseWithSocket } from '@/lib/socket';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponseWithSocket
) {
  if (!res.socket.server.io) {
    initSocketIO(res);
  }
  
  res.status(200).json({ 
    success: true, 
    message: 'Socket.IO server initialized',
    timestamp: new Date().toISOString()
  });
}
