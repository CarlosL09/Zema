# FORCE REBUILD - New timestamp: 2025-01-11-17:33
FROM node:18-slim

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Create app directory with different name to break cache
WORKDIR /zema-prod

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source and build frontend
COPY . .
RUN npm run build

# Copy the direct production server (CommonJS, no imports)
COPY server/direct-production.js ./server.js

# Create a simple startup script
RUN echo '#!/bin/sh\nnode server.js' > start.sh && chmod +x start.sh

# Expose port
EXPOSE 5000

# Simple health check
HEALTHCHECK --interval=10s --timeout=3s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:5000/ || exit 1

# Start the server
CMD ["./start.sh"]