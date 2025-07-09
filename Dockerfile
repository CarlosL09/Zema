# Use Node.js 18 LTS - Force rebuild 2025-01-09
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci --include=dev

# Copy source code
COPY . .

# Build the frontend application
RUN npm run build

# Copy the standalone production server (no bundling needed)
COPY server/standalone-production.js dist/server.js

# Install only production dependencies
RUN npm prune --production && npm cache clean --force

# Expose port
EXPOSE 5000

# Start the standalone production server
CMD ["node", "dist/server.js"]