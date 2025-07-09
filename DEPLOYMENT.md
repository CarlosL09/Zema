# ZEMA - Deployment Guide 🚀

This guide provides comprehensive instructions for deploying ZEMA (Zero Effort Mail Automation) to production environments.

## 📋 Pre-Deployment Checklist

### ✅ Required Dependencies
- [ ] Node.js 18+ installed
- [ ] PostgreSQL database (local or cloud)
- [ ] OpenAI API key for AI features
- [ ] SSL certificate for HTTPS (production)

### ✅ Optional Integrations
- [ ] Google OAuth credentials (Gmail integration)
- [ ] Microsoft OAuth credentials (Outlook integration)
- [ ] Stripe API keys (payment processing)
- [ ] SendGrid API key (email notifications)

## 🛠️ Environment Configuration

### 1. Environment Variables Setup

Copy the `.env.example` file to `.env` and configure:

```bash
cp .env.example .env
```

**Critical Environment Variables:**
```env
# Database (Required)
DATABASE_URL=postgresql://username:password@host:port/database

# AI Integration (Required)
OPENAI_API_KEY=sk-...

# Authentication (Required)
SESSION_SECRET=your-secure-random-string-here

# Application Settings
NODE_ENV=production
PORT=5000
```

### 2. Database Setup

```bash
# Install dependencies
npm install

# Run database migrations
npm run db:push

# Create admin user
npm run create-admin
```

### 3. Build Application

```bash
# Build for production
npm run build

# Verify build success
ls -la dist/
```

## 🌐 Deployment Options

### Option 1: Traditional VPS/Server

#### Nginx Configuration
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### PM2 Process Manager
```bash
# Install PM2 globally
npm install -g pm2

# Create ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'zema-ai',
    script: 'dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    }
  }]
}
EOF

# Start application
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Option 2: Docker Deployment

#### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]
```

#### Docker Compose
```yaml
version: '3.8'
services:
  zema-app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - SESSION_SECRET=${SESSION_SECRET}
    depends_on:
      - postgres

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: zema_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

### Option 3: Cloud Platform Deployment

#### Vercel
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server/index.ts",
      "use": "@vercel/node"
    },
    {
      "src": "client/**/*",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "server/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "client/$1"
    }
  ]
}
```

#### Railway
```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "npm start"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

[env]
NODE_ENV = "production"
```

#### Render
```yaml
services:
  - type: web
    name: zema-ai
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: zema-db
          property: connectionString
```

## 🔒 Security Configuration

### 1. SSL/TLS Certificate

#### Let's Encrypt (Certbot)
```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 2. Firewall Configuration
```bash
# UFW Firewall
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### 3. Environment Security
```bash
# Secure .env file
chmod 600 .env
chown app:app .env
```

## 📊 Monitoring & Logging

### Application Monitoring
```bash
# PM2 monitoring
pm2 monit

# Log monitoring
pm2 logs zema-ai

# Memory and CPU usage
pm2 status
```

### Database Monitoring
```sql
-- Check database connections
SELECT * FROM pg_stat_activity WHERE datname = 'zema_db';

-- Monitor query performance
SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;
```

## 🧪 Health Checks

### Application Health Endpoint
```bash
# Check application status
curl http://localhost:5000/api/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2025-01-07T03:15:00.000Z",
  "uptime": 86400,
  "database": "connected",
  "ai_service": "operational"
}
```

### Database Health Check
```bash
# PostgreSQL connection test
pg_isready -h localhost -p 5432 -U username -d zema_db
```

## 🔄 Backup & Recovery

### Database Backup
```bash
# Create backup
pg_dump -h localhost -U username -d zema_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Automated backup script
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -h localhost -U username -d zema_db > $BACKUP_DIR/zema_backup_$DATE.sql
find $BACKUP_DIR -name "zema_backup_*.sql" -mtime +7 -delete
```

### Application Backup
```bash
# Backup application files
tar -czf zema_app_$(date +%Y%m%d).tar.gz \
  --exclude=node_modules \
  --exclude=.git \
  --exclude=dist \
  /path/to/zema-ai/
```

## 🚀 Performance Optimization

### 1. Node.js Optimization
```javascript
// server/index.ts
process.env.NODE_OPTIONS = '--max-old-space-size=2048';

// Enable compression
app.use(compression());

// Enable gzip
app.use(express.static('dist/public', {
  setHeaders: (res, path) => {
    if (path.endsWith('.js') || path.endsWith('.css')) {
      res.setHeader('Content-Encoding', 'gzip');
    }
  }
}));
```

### 2. Database Optimization
```sql
-- Create indexes for performance
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY idx_automation_rules_user_id ON automation_rules(user_id);
CREATE INDEX CONCURRENTLY idx_email_analytics_created_at ON email_analytics(created_at);

-- Analyze tables
ANALYZE users;
ANALYZE automation_rules;
ANALYZE email_analytics;
```

### 3. CDN Configuration
```javascript
// Static asset CDN headers
app.use('/static', express.static('dist/public', {
  maxAge: '1y',
  setHeaders: (res, path) => {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }
}));
```

## 📈 Scaling Considerations

### Horizontal Scaling
- Use load balancer (Nginx, HAProxy)
- Session store in Redis
- Database read replicas
- Container orchestration (Kubernetes)

### Vertical Scaling
- Increase server resources
- Optimize database queries
- Implement caching (Redis)
- Use CDN for static assets

## 🆘 Troubleshooting

### Common Issues

#### Application Won't Start
```bash
# Check logs
pm2 logs zema-ai

# Check environment variables
printenv | grep -E "(DATABASE_URL|OPENAI_API_KEY)"

# Test database connection
node -e "require('./server/db.ts')"
```

#### Database Connection Issues
```bash
# Test PostgreSQL connection
psql $DATABASE_URL -c "SELECT 1;"

# Check database exists
psql $DATABASE_URL -c "\l"
```

#### API Errors
```bash
# Check API health
curl -v http://localhost:5000/api/health

# Check OpenAI API
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
  https://api.openai.com/v1/models
```

## 📞 Support

For deployment issues:
1. Check the troubleshooting section above
2. Review application logs
3. Verify environment configuration
4. Contact support: support@zema.ai

---

**Deployment completed successfully!** ✅

Your ZEMA application is now ready for production use.