# ZEMA Railway Deployment Guide

## Overview
This guide will help you deploy ZEMA (Zero Effort Mail Automation) to Railway, a modern cloud platform that provides seamless deployment for Node.js applications.

## Prerequisites
- Railway account (free tier available)
- GitHub repository with ZEMA code
- PostgreSQL database (Railway provides this)

## Step 1: Prepare Your Repository
1. Push your code to GitHub
2. Ensure all configuration files are present:
   - `railway.json` ✓
   - `nixpacks.toml` ✓
   - `.env.example` ✓

## Step 2: Create Railway Project
1. Go to [railway.app](https://railway.app)
2. Sign up/login with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your ZEMA repository

## Step 3: Add PostgreSQL Database
1. In your Railway project dashboard
2. Click "New Service" → "Database" → "PostgreSQL"
3. Railway will automatically create and connect the database
4. The `DATABASE_URL` environment variable will be set automatically

## Step 4: Configure Environment Variables
Add these environment variables in Railway dashboard:

### Required Variables
```
NODE_ENV=production
SESSION_SECRET=your_secure_random_session_secret_here
OPENAI_API_KEY=your_openai_api_key
```

### Optional Variables (for full functionality)
```
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
MICROSOFT_CLIENT_ID=your_microsoft_oauth_client_id
MICROSOFT_CLIENT_SECRET=your_microsoft_oauth_client_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
SENDGRID_API_KEY=your_sendgrid_api_key
SLACK_BOT_TOKEN=your_slack_bot_token
```

## Step 5: Database Setup
After first deployment, run database migrations:
1. In Railway dashboard, go to your service
2. Open "Settings" → "Variables"
3. Note your `DATABASE_URL`
4. Use Railway's built-in terminal or connect locally to run:
```bash
npm run db:push
```

## Step 6: Domain Configuration
1. Railway provides a free `.railway.app` domain
2. For custom domains, go to "Settings" → "Domains"
3. Add your custom domain and configure DNS

## Expected Deployment Process
1. Railway detects Node.js project
2. Runs `npm ci` to install dependencies
3. Runs `npm run build` to build the application
4. Starts with `npm run start`
5. Application available at your Railway URL

## Troubleshooting

### Build Issues
- Check Node.js version compatibility (we use Node 18)
- Verify all dependencies are in package.json
- Check build logs in Railway dashboard

### Database Connection Issues
- Ensure `DATABASE_URL` is properly set
- Run `npm run db:push` to create tables
- Check PostgreSQL service status

### Environment Variables
- Double-check all required variables are set
- Use Railway's environment variable editor
- Restart deployment after adding variables

## Post-Deployment Checklist
- [ ] Application loads successfully
- [ ] Database connection works
- [ ] User registration/login functions
- [ ] Admin panel accessible at `/admin`
- [ ] Dashboard features working
- [ ] SSL certificate active (automatic with Railway)

## Admin Access
Default admin credentials (change immediately):
- Email: admin@zema.com
- Password: Luna0906!

## Production Considerations
1. **Security**: Change default admin password
2. **Monitoring**: Use Railway's built-in metrics
3. **Scaling**: Railway auto-scales based on traffic
4. **Backups**: Configure database backups in Railway
5. **Logs**: Monitor application logs in Railway dashboard

## Cost Estimation
- **Hobby Plan**: $5/month (perfect for small projects)
- **Pro Plan**: $20/month (recommended for production)
- Database included in plan pricing

## Support
- Railway Documentation: [docs.railway.app](https://docs.railway.app)
- ZEMA Issues: GitHub repository issues
- Railway Discord: Community support

---

Your ZEMA application will be production-ready on Railway with automatic SSL, custom domains, and professional hosting infrastructure.