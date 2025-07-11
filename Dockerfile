# Minimal Railway Dockerfile - Self-contained
FROM node:18-alpine

WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Copy package files and install production dependencies only
COPY package*.json ./
RUN npm ci --production

# Copy the working CommonJS server
COPY server/direct-production.cjs ./server.cjs

# Server handles missing static files gracefully with built-in fallback

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=10s --timeout=3s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:${PORT:-3000}/ || exit 1

# Start server
CMD ["node", "server.cjs"]
