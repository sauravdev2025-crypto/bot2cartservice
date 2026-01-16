import 'dotenv/config';

const host = process.env.REDIS_HOST;
const port = parseInt(process.env.REDIS_PORT, 10);
const password = process.env.REDIS_PASSWORD || '';
const username = process.env.REDIS_USERNAME || '';

const queueConfig: any = {
  connection: {
    url: `redis://${password ? `${username}:${password}@` : ''}${host}:${port}`,
    // Redis client options to handle Lua script key access issues
    enableOfflineQueue: false,
    enableReadyCheck: true,
    maxRetriesPerRequest: 3,
    lazyConnect: false,
    // Allow Lua scripts to access any key (bypass ACL restrictions)
    showFriendlyErrorStack: true,
  },
  prefix: process.env.REDIS_SLUG || 'bull',
};
export = queueConfig;
