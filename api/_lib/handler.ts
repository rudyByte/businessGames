import fs from 'fs';
import path from 'path';

const dbSource = path.join(process.cwd(), 'apps/api/prisma/dev.db');
const dbDestDir = '/tmp/prisma';
const dbDest = path.join(dbDestDir, 'dev.db');

if (fs.existsSync(dbSource)) {
  fs.mkdirSync(dbDestDir, { recursive: true });
  fs.copyFileSync(dbSource, dbDest);
  fs.chmodSync(dbDest, 0o666);
  process.env.DATABASE_URL = `file:${dbDest}`;
}

export async function handleApi(req: any, res: any) {
  try {
    const { app } = await import('../../apps/api/src/server.js');
    await app(req, res);
  } catch (error) {
    console.error('API handler error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: { code: 'API_HANDLER_ERROR', message: (error as Error).message || 'API handler failed' }
      });
    }
  }
}
