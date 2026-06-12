import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL;

class MockRedis {
  private store: Map<string, string> = new Map();
  private ttls: Map<string, number> = new Map();

  constructor() {
    console.log('Using in-memory mock Redis database.');
  }

  async get(key: string): Promise<string | null> {
    this.checkExpired(key);
    return this.store.get(key) || null;
  }

  async set(key: string, value: string, mode?: string, duration?: number): Promise<'OK'> {
    this.store.set(key, value);
    if (mode === 'EX' && duration) {
      this.ttls.set(key, Date.now() + duration * 1000);
    } else {
      this.ttls.delete(key);
    }
    return 'OK';
  }

  async del(key: string): Promise<number> {
    const existed = this.store.has(key);
    this.store.delete(key);
    this.ttls.delete(key);
    return existed ? 1 : 0;
  }

  async incr(key: string): Promise<number> {
    const current = await this.get(key);
    const num = current ? parseInt(current, 10) : 0;
    const next = num + 1;
    await this.set(key, next.toString());
    return next;
  }

  async zadd(key: string, score: number, member: string): Promise<number> {
    const listKey = `zset:${key}`;
    const raw = await this.get(listKey);
    const data: { [member: string]: number } = raw ? JSON.parse(raw) : {};
    data[member] = score;
    await this.set(listKey, JSON.stringify(data));
    return 1;
  }

  async zrevrank(key: string, member: string): Promise<number | null> {
    const listKey = `zset:${key}`;
    const raw = await this.get(listKey);
    if (!raw) return null;
    const data: { [member: string]: number } = JSON.parse(raw);
    const sorted = Object.entries(data).sort((a, b) => b[1] - a[1]);
    const idx = sorted.findIndex(([m]) => m === member);
    return idx === -1 ? null : idx;
  }

  async zrevrange(key: string, start: number, stop: number, withScores?: 'WITHSCORES'): Promise<string[]> {
    const listKey = `zset:${key}`;
    const raw = await this.get(listKey);
    if (!raw) return [];
    const data: { [member: string]: number } = JSON.parse(raw);
    const sorted = Object.entries(data).sort((a, b) => b[1] - a[1]);
    const slice = sorted.slice(start, stop + 1);
    if (withScores === 'WITHSCORES') {
      const result: string[] = [];
      for (const [m, s] of slice) {
        result.push(m, s.toString());
      }
      return result;
    }
    return slice.map(([m]) => m);
  }

  private checkExpired(key: string) {
    const expiry = this.ttls.get(key);
    if (expiry && expiry < Date.now()) {
      this.store.delete(key);
      this.ttls.delete(key);
    }
  }
}

let redisClient: Redis | MockRedis;

if (REDIS_URL) {
  try {
    const client = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 1,
      connectTimeout: 5000,
    });
    client.on('error', (err) => {
      console.warn('Redis Connection Error, falling back to mock Redis:', err.message);
      redisClient = new MockRedis();
    });
    redisClient = client;
  } catch (e) {
    console.warn('Failed to initialize Redis client. Falling back to mock Redis.');
    redisClient = new MockRedis();
  }
} else {
  redisClient = new MockRedis();
}

export const redis = {
  get: (key: string) => redisClient.get(key),
  set: (key: string, value: string, expirySeconds?: number) => {
    if (expirySeconds) {
      return redisClient.set(key, value, 'EX', expirySeconds);
    }
    return redisClient.set(key, value);
  },
  del: (key: string) => redisClient.del(key),
  incr: (key: string) => redisClient.incr(key),
  zadd: (key: string, score: number, member: string) => {
    if ('zadd' in redisClient) {
      return redisClient.zadd(key, score, member);
    }
    return Promise.resolve(1);
  },
  zrevrank: (key: string, member: string) => {
    if ('zrevrank' in redisClient) {
      return redisClient.zrevrank(key, member);
    }
    return Promise.resolve(null);
  },
  zrevrange: (key: string, start: number, stop: number, withScores?: 'WITHSCORES') => {
    if ('zrevrange' in redisClient) {
      if (withScores === 'WITHSCORES') {
        return redisClient.zrevrange(key, start, stop, 'WITHSCORES');
      }
      return redisClient.zrevrange(key, start, stop);
    }
    return Promise.resolve([]);
  }
};
export default redis;
