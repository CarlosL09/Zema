# ZEMA Production Dockerfile - Complete rebuild required
FROM node:18-alpine

# Install additional utilities
RUN apk add --no-cache dumb-init

# Create app directory
WORKDIR /zema-app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies including dev for build
RUN npm ci --include=dev --silent

# Copy all source files
COPY . .

# Build the React frontend
RUN npm run build

# Create standalone production server directly
RUN cp server/standalone-production.js dist/production-server.js

# Clean up and install only production deps
RUN npm prune --production && npm cache clean --force

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S zema -u 1001

# Change ownership of app directory
RUN chown -R zema:nodejs /zema-app

# Switch to non-root user
USER zema

# Expose the port
EXPOSE 5000

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start the production server
CMD ["node", "dist/production-server.js"]