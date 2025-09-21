import redis from "redis";
import autoBind from "auto-bind";

class CacheService {
  constructor() {
    this._client = redis.createClient({
      socket: {
        host: process.env.REDIS_SERVER,
      },
    });

    this._client.on("error", (error) => {
      console.error("Redis Client Error", error);
    });

    this._client.connect();

    autoBind(this);
  }

  async set(key, value, expirationInSecond = 1800) {
    await this._client.set(key, value, {
      EX: expirationInSecond,
    });
  }

  async get(key) {
    const result = await this._client.get(key);

    if (result === null) {
      throw new Error(`Cache key "${key}" not found`);
    }

    return result;
  }

  delete(key) {
    return this._client.del(key);
  }
}

export default CacheService;
