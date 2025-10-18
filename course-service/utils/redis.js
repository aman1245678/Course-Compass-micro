const redis = require("redis");

const redisClient = redis.createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redisClient.on("error", (err) => console.error("Redis Client Error", err));
redisClient.on("connect", () => console.log("Connected to Redis"));

const connectRedis = async () => {
  await redisClient.connect();
};

const setCache = async (key, data, expiry = 3600) => {
  try {
    await redisClient.setEx(key, expiry, JSON.stringify(data));
  } catch (error) {
    console.error("Redis set error:", error);
  }
};

const getCache = async (key) => {
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Redis get error:", error);
    return null;
  }
};

const deleteCacheByPattern = async (pattern) => {
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (error) {
    console.error("Redis delete pattern error:", error);
  }
};

module.exports = {
  redisClient,
  connectRedis,
  setCache,
  getCache,
  deleteCacheByPattern,
};
