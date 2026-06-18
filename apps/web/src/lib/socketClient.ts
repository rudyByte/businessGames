import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;
let pendingRooms: Array<{ event: string; roomId: string }> = [];

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || '';

export function connectSocket(token: string): Socket {
  if (socket?.connected) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
  });

  socket.on('connect', () => {
    console.log('[Socket] Connected:', socket?.id);
    // Flush any pending room joins
    for (const p of pendingRooms) {
      socket?.emit(p.event, p.roomId);
    }
    pendingRooms = [];
  });

  socket.on('connect_error', (err) => {
    console.warn('[Socket] Connection error:', err.message);
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket] Disconnected:', reason);
  });

  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
  pendingRooms = [];
}

export function joinClassroom(classroomId: string) {
  if (socket?.connected) {
    socket.emit('join:classroom', classroomId);
  } else if (socket) {
    // Queue for when socket connects
    pendingRooms.push({ event: 'join:classroom', roomId: classroomId });
  }
}

export function joinSchool(schoolId: string) {
  if (socket?.connected) {
    socket.emit('join:school', schoolId);
  } else if (socket) {
    pendingRooms.push({ event: 'join:school', roomId: schoolId });
  }
}

export function joinClassWar(classroomId: string) {
  if (socket?.connected) {
    socket.emit('class_war:join', classroomId);
  } else if (socket) {
    pendingRooms.push({ event: 'class_war:join', roomId: classroomId });
  }
}
