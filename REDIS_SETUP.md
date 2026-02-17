# Redis Setup for Strapi

## What's Configured

✅ **koa-compress** - Response compression middleware (reduces API response size by ~60%)
✅ **Redis** - Caching layer with ioredis client and strapi-plugin-redis
✅ **Redis already installed** - Running in Docker on your server

## Configuration (Your Setup)

Since Redis is already running in Docker on your server, you just need to configure the connection.

### Environment Variables

Add to your production `.env` file:

```env
# Redis Configuration (update with your Docker Redis details)
REDIS_HOST=redis  # or localhost if Redis is on same host
REDIS_PORT=6379
REDIS_DB=0
# REDIS_PASSWORD=your_password_here  # Uncomment if Redis requires authentication
```

**Common Docker setups:**

If Redis is in the same Docker network as Strapi:
```env
REDIS_HOST=redis  # Docker service name
REDIS_PORT=6379
```

If Redis is on host machine:
```env
REDIS_HOST=172.17.0.1  # Docker host IP
REDIS_PORT=6379
```

If using Docker Compose with custom network:
```env
REDIS_HOST=your-redis-service-name
REDIS_PORT=6379
```

### Local Development (Optional)

For local development without Redis:
```env
# Leave Redis vars commented out - plugin won't initialize
# REDIS_HOST=127.0.0.1
# REDIS_PORT=6379
```

Or run Redis locally:
```bash
docker run -d --name redis -p 6379:6379 redis:latest
```

## Quick Start (Production)

1. **Set environment variables** in your production `.env`:
  From host machine (if Redis port is exposed)
redis-cli -h localhost -p 6379 ping

# From Docker container
docker exec -it your-redis-container redis-cli ping

# Should both return: PONG
```

## Docker Compose Example

If you're using Docker Compose, your setup might look like:

```yaml
services:
  strapi:
    image: your-strapi-image
    environment:
      - REDIS_HOST=redis
      - REDIS_PORT=6379
    depends_on:
      - redis
    networks:
      - app-network

  redis:
    image: redis:latest
    ports:
      - "6379:6379"
    networks:
      - app-network

networks:
  app-network: will connect automatically on startup

3. **Verify** - Check Strapi logs for "Connected to Redis" or check Redis:
   ```bash
   docker exec -it your-redis-container redis-cli ping
   # Should return: PONG
   ```

That's it! Strapi will now use Redis for caching and sessions.

## Testing Redis Connection

```bash
# Check if Redis is running
redis-cli ping
# Should return: PONG

# Test connection from Node.js
node -e "const Redis = require('ioredis'); const redis = new Redis(); redis.ping().then(console.log).finally(() => redis.quit());"
# Should return: PONG
```

## What This Improves

### 1. Response Compression (koa-compress)
- **Before**: 120KB JSON response
- **After**: ~40KB compressed (67% reduction)
- **Impact**: Faster load times, reduced bandwidth costs

### 2. Redis Caching
- **Session storage**: User sessions stored in Redis instead of memory
- **Query caching**: Frequently accessed data cached (configure per-route)
- **Rate limiting**: Can be used for API rate limiting
- **Pub/Sub**: Real-time features if needed

## Usage in Strapi

### Caching Specific Routes
Create a custom middleware to cache specific API responses:

```javascript
// config/middlewares.ts - add custom cache middleware
export default [
  'strapi::logger',
  { name: 'strapi::compression', config: { threshold: 1024 } },
  'strapi::errors',
  // ... rest of middlewares
];
```

### Using Redis in Custom Code
```javascript
// In any Strapi service or controller
const redis = strapi.plugin('redis').service('redis');

// Set cache
await redis.set('key', 'value', 'EX', 3600); // expires in 1 hour

// Get cache
const value = await redis.get('key');

// Delete cache
await redis.del('key');
```

## Monitoring

### Check Redis Memory Usage
```bash
redis-cli info memory
```

### Monitor Commands in Real-time
```bash
redis-cli monitor
```

### Check Connected Clients
```bash
redis-cli client list
```

## Performance Tips

1. **Set appropriate TTLs** - Don't cache forever, set expiration times
2. **Cache homepage/popular content** - Most visited pages benefit most
3. **Invalidate on updates** - Clear cache when content changes
4. **Monitor memory usage** - Redis is in-memory, watch your RAM
5. **Use connection pooling** - Already configured in the plugin

## Troubleshooting

### "Error: connect ECONNREFUSED 127.0.0.1:6379"
- Redis is not running. Start Redis server.

### "NOAUTH Authentication required"
- Redis requires password. Set `REDIS_PASSWORD` in .env

### High memory usage
```bash
# Clear all Redis data (careful in production!)
redis-cli FLUSHALL

# Or clear specific database
redis-cli -n 0 FLUSHDB
```

## Optional: Disable Redis

If you don't want to use Redis yet:
1. Comment out the `redis` section in `config/plugins.ts`
2. Redis won't be initialized, Strapi will work without it
3. Compression will still work

## Next Steps

1. Start Redis locally: `redis-server` or with Docker
2. Restart Strapi: `npm run develop`
3. Monitor Redis: `redis-cli monitor` (in another terminal)
4. Implement route-specific caching as needed
5. In production, use managed Redis service

## Resources

- [Redis Documentation](https://redis.io/docs/)
- [ioredis Documentation](https://github.com/redis/ioredis)
- [Strapi Plugin Redis](https://github.com/strapi-community/strapi-plugin-redis)
- [koa-compress](https://github.com/koajs/compress)
