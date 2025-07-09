# Use Node.js 18 LTS
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci --include=dev

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Build bundled production server that includes all dependencies
RUN npx esbuild server/simple-production.js --platform=node --packages=external --bundle --format=esm --outfile=dist/server.js --allow-overwrite

# Install production dependencies but keep vite for server
RUN npm install --production && npm install vite && npm cache clean --force

# Expose port
EXPOSE 5000

# Start the application using production server
CMD ["node", "dist/production.js"]