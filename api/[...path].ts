import { app } from '../apps/api/src/server';

export default async function handler(req: any, res: any) {
  await app(req, res);
}
