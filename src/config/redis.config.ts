import 'dotenv/config';

const host = process.env.REDIS_HOST;
const port = process.env.REDIS_PORT;
const password = process.env.REDIS_PASSWORD || '';
const username = process.env.REDIS_USERNAME || '';

const redisConfig = {
  url: `redis://${password ? `${username}:${password}@` : ''}${host}:${port}`,
};

export = redisConfig;
