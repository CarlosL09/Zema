# FORCE REBUILD - New timestamp: 2025-01-11-17:33
FROM node:18-slim

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Create app directory with different name to break cache
WORKDIR /zema-prod

# Copy package.json and package-lock.json
COPY package*.json ./

# Install all dependencies (need dev for build)
RUN npm ci

# Copy source and build frontend
COPY . .
RUN npm run build

# Clean up dev dependencies after build
RUN npm prune --production

# Copy the direct production server (CommonJS, no imports)
COPY server/direct-production.js ./server.js

# Expose port (Railway will provide the actual port)
EXPOSE 3000

# Simple health check
HEALTHCHECK --interval=10s --timeout=3s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:${PORT:-3000}/ || exit 1

# Start the server directly
CMD ["node", "server.js"]