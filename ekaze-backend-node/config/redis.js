const Redis = require('ioredis');
const env = require('./env');

let hasLoggedError = false;

const redisClient = new Redis({
  host: env.REDIS_HOST || '127.0.0.1',
  port: env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  showFriendlyErrorStack: false,
  lazyConnect: true,
  retryStrategy(times) {
    if (times > 2) {
      // Cease reconnection attempts to prevent spamming the console when Redis is offline locally
      return null;
    }
    return 1000;
  }
});

redisClient.on('connect', () => {
  console.log('✓ Redis connected successfully');
  hasLoggedError = false;
});

redisClient.on('error', (err) => {
  if (!hasLoggedError) {
    console.warn(`⚠️ Redis server offline at ${env.REDIS_HOST || '127.0.0.1'}:${env.REDIS_PORT || 6379} (${err.code || err.message}). Background queues will operate in resilient local mode.`);
    hasLoggedError = true;
  }
});

// Non-blocking initial connection attempt
redisClient.connect().catch(() => {});

module.exports = redisClient;
