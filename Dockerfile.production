# ZEMA Production Build - No Cache Version
FROM node:18-alpine

# Install system dependencies
RUN apk add --no-cache dumb-init curl

# Set working directory
WORKDIR /zema

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm ci --include=dev

# Copy source code
COPY . .

# Build frontend
RUN npm run build

# Copy standalone server directly (no bundling)
COPY server/standalone-production.js ./dist/app.js

# Update paths in server for new structure
RUN sed -i 's|/zema-app/dist/public|/zema/dist/public|g' ./dist/app.js

# Install production dependencies only
RUN npm prune --production

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S zema -u 1001
RUN chown -R zema:nodejs /zema

# Switch to non-root user
USER zema

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/ || exit 1

# Start server
CMD ["dumb-init", "node", "dist/app.js"]