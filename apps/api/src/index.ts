import http from 'http';
import dotenv from 'dotenv';
import { app, connectDatabase, disconnectDatabase } from './server';
import { initSocket } from './lib/socket';

dotenv.config();

const server = http.createServer(app);
const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    await connectDatabase();
    console.log('Database connected successfully.');

    server.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(`  CampusEdge Launchpad Server Running on port ${PORT}`);
      console.log(`  Health Check: http://localhost:${PORT}/api/v1/health`);
      console.log(`===============================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

initSocket(server);

process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(async () => {
    console.log('HTTP server closed');
    await disconnectDatabase();
    console.log('Database disconnected');
    process.exit(0);
  });
});

startServer();
