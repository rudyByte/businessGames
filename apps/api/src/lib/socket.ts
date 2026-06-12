import { Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'campusedge-development-secret-key-32-chars';

let io: SocketServer | null = null;

export function initSocket(server: HttpServer): SocketServer {
  io = new SocketServer(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Authentication Middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('Authentication error. No token provided.'));
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        id: string;
        email: string;
        role: string;
      };
      (socket as any).user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error. Invalid token.'));
    }
  });

  io.on('connection', (socket) => {
    const user = (socket as any).user;
    console.log(`Socket connected: User ${user.email} (${user.role})`);

    // Join personal room
    socket.join(`user:${user.id}`);

    // Join classroom / school rooms based on messages
    socket.on('join:classroom', (classroomId: string) => {
      socket.join(`classroom:${classroomId}`);
      console.log(`User ${user.email} joined classroom:${classroomId}`);
    });

    socket.on('join:school', (schoolId: string) => {
      socket.join(`school:${schoolId}`);
      console.log(`User ${user.email} joined school:${schoolId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: User ${user.email}`);
    });
  });

  return io;
}

export function getIO(): SocketServer {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
}

export function emitToUser(userId: string, event: string, data: any) {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
}

export function emitToClassroom(classroomId: string, event: string, data: any) {
  if (io) {
    io.to(`classroom:${classroomId}`).emit(event, data);
  }
}

export function emitToSchool(schoolId: string, event: string, data: any) {
  if (io) {
    io.to(`school:${schoolId}`).emit(event, data);
  }
}

export function emitGlobal(event: string, data: any) {
  if (io) {
    io.emit(event, data);
  }
}
