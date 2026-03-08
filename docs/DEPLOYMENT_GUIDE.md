# 🚀 Deployment Guide - Bhibhushitams Security Platform

**Production-Ready Deployment Guide**  
Last Updated: March 8, 2026

## 📋 Overview
This comprehensive guide covers **FREE hosting deployment** of the Bhibhushitams Security Platform:
- ✅ MongoDB Atlas M0 (Free Tier)
- ✅ Backend API on Render (Free)
- ✅ Frontend on Vercel (Free)
- ✅ Production-ready configuration
- ✅ Zero-cost deployment

**Estimated Setup Time:** 30-45 minutes

---

## 📖 Table of Contents
1. [Step 1: MongoDB Atlas Setup (FREE)](#step-1-mongodb-atlas-setup-free)
2. [Step 2: Backend API Deployment on Render](#step-2-backend-api-deployment-on-render)
3. [Step 3: Frontend Deployment on Vercel](#step-3-frontend-deployment-on-vercel)
4. [Step 4: Environment Configuration](#step-4-environment-configuration)
5. [Step 5: Testing & Validation](#step-5-testing--validation)
6. [Step 6: Custom Domain Setup (Optional)](#step-6-custom-domain-setup-optional)

---

## Step 1: MongoDB Atlas Setup (FREE)

MongoDB Atlas provides a **completely free M0 tier** with 512MB storage - perfect for development and small production apps.

### 1.1 Create MongoDB Atlas Account

1. **Visit MongoDB Atlas**
   - Go to: https://www.mongodb.com/cloud/atlas/register
   - Click **"Sign Up"** or **"Try Free"**

2. **Create Account**
   - Use Google/GitHub sign-in (fastest) OR
   - Enter email, password, first name, last name
   - Accept terms of service
   - Click **"Create your Atlas account"**

3. **Verify Email**
   - Check your email for verification link
   - Click verification link to activate account

### 1.2 Create Free Cluster

1. **Choose Deployment Option**
   - After login, you'll see "Deploy a cloud database"
   - Click **"Create"** under **M0 (Free)**
   - Or click **"Build a Database"** → **"Shared"** → **"Create a cluster"**

2. **Configure Cluster Settings**
   ```
   Cloud Provider: AWS (recommended for stability)
   Region: Choose closest to your target users
          - Example: Mumbai (ap-south-1) for India
          - Example: N. Virginia (us-east-1) for USA
          - Example: Frankfurt (eu-central-1) for Europe
   
   Cluster Tier: M0 Sandbox (FREE FOREVER)
   Cluster Name: bhibhushitams-cluster (or any name you prefer)
   ```

3. **MongoDB Version**
   - Keep default (Latest stable version, currently 7.0)

4. **Click "Create Cluster"**
   - Cluster creation takes 3-5 minutes
   - ☕ Take a coffee break!

### 1.3 Configure Database Access (Create Admin User)

**IMPORTANT:** This is your database username/password - different from Atlas login!

1. **Navigate to Database Access**
   - In left sidebar: **"Security"** → **"Database Access"**
   - Or click **"QUICKSTART"** → **"Add a connection IP address"**

2. **Create Database User**
   - Click **"+ ADD NEW DATABASE USER"**
   - Choose **"Password"** authentication method
   
   ```
   Username: bhibhushitams_admin
   Password: Generate secure password (use "Autogenerate Secure Password")
            Or create strong password: Min 12 chars, uppercase, lowercase, numbers, symbols
   
   Example strong password: B$ecureP@2026!Mdb
   ```

3. **⚠️ CRITICAL: Save Your Credentials**
   ```
   Username: bhibhushitams_admin
   Password: [Your generated password]
   
   📝 Write these down immediately! You'll need them in Step 4.
   ```

4. **Database User Privileges**
   - Select **"Built-in Role"**: **"Atlas admin"** (full access)
   - Or select **"Read and write to any database"** (recommended minimum)

5. **Click "Add User"**

### 1.4 Configure Network Access (Allow Connections)

1. **Navigate to Network Access**
   - In left sidebar: **"Security"** → **"Network Access"**

2. **Add IP Address**
   - Click **"+ ADD IP ADDRESS"**

3. **Choose Access Method**

   **Option A: Allow from Anywhere (Easiest for cloud deployment)**
   ```
   - Click "ALLOW ACCESS FROM ANYWHERE"
   - IP Address: 0.0.0.0/0
   - Comment: "Production servers (Render, Vercel)"
   - Click "Confirm"
   ```
   ⚠️ This allows connections from any IP. Safe when using strong passwords.

   **Option B: Specific IPs (More Secure)**
   ```
   - Find your backend hosting IP (after deploying to Render)
   - Add that specific IP range
   - Add your local IP for testing: Click "ADD CURRENT IP ADDRESS"
   ```

4. **Wait for Active Status**
   - New entry will show "Pending" → "Active" (takes ~1 minute)

### 1.5 Get Connection String

1. **Navigate to Database**
   - In left sidebar: **"Deployment"** → **"Database"**
   - You'll see your cluster: `bhibhushitams-cluster`

2. **Click "Connect"**
   - Click **"Connect"** button on your cluster
   - You'll see connection methods dialog

3. **Choose Connection Method**
   - Click **"Connect your application"**

4. **Select Driver and Version**
   ```
   Driver: Node.js
   Version: 5.5 or later (default)
   ```

5. **Copy Connection String**
   ```
   You'll see something like:
   
   mongodb+srv://bhibhushitams_admin:<password>@bhibhushitams-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority&appName=bhibhushitams-cluster
   ```

6. **Prepare Production URI**
   
   Replace `<password>` with your actual password and add database name:
   
   ```
   Before:
   mongodb+srv://bhibhushitams_admin:<password>@bhibhushitams-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   
   After:
   mongodb+srv://bhibhushitams_admin:B$ecureP@2026!Mdb@bhibhushitams-cluster.xxxxx.mongodb.net/bhibhushitams_production?retryWrites=true&w=majority
   ```

   **⚠️ IMPORTANT:** If your password contains special characters (`@`, `:`, `/`, `%`), you MUST URL-encode them:
   
   ```
   @ → %40
   : → %3A
   / → %2F
   % → %25
   # → %23
   $ → %24
   
   Example:
   Password: B$ecure@2026
   Encoded:  B%24ecure%402026
   ```

   **Final URI Format:**
   ```
   mongodb+srv://USERNAME:URL_ENCODED_PASSWORD@CLUSTER.xxxxx.mongodb.net/DATABASE_NAME?retryWrites=true&w=majority
   ```

### 1.6 Test Connection (Optional but Recommended)

**Method 1: Using MongoDB Compass (GUI Tool)**

1. Download MongoDB Compass: https://www.mongodb.com/try/download/compass
2. Install and open Compass
3. Paste your connection string
4. Click **"Connect"**
5. If successful, you'll see your database!

**Method 2: Using Node.js (Quick Test)**

Create a file `test-connection.js`:

```javascript
const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://bhibhushitams_admin:YOUR_PASSWORD@bhibhushitams-cluster.xxxxx.mongodb.net/bhibhushitams_production?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Atlas connection successful!');
    console.log('📊 Database:', mongoose.connection.name);
    console.log('🌐 Host:', mongoose.connection.host);
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ MongoDB Atlas connection failed:');
    console.error(error.message);
    process.exit(1);
  });
```

Run:
```bash
cd apps/api
node test-connection.js
```

### 1.7 Troubleshooting Common Issues

**Issue 1: "Authentication failed"**
```
Solution:
- Double-check username and password
- Ensure password is URL-encoded
- Verify user was created in Database Access
```

**Issue 2: "Connection timeout" or "ECONNREFUSED"**
```
Solution:
- Check Network Access settings
- Ensure 0.0.0.0/0 is added (or your specific IP)
- Wait 1-2 minutes after adding IP (propagation time)
- Check if your ISP/firewall blocks MongoDB ports
```

**Issue 3: "No database connection after several attempts"**
```
Solution:
- Verify cluster is in "Active" state (not paused)
- Atlas free tier auto-pauses after 60 days of inactivity
- Click "Resume" if paused
```

**Issue 4: "Bad URI format" or parsing errors**
```
Solution:
- Ensure no spaces in connection string
- Check password special characters are URL-encoded
- Verify database name is correctly placed
```

### ✅ Step 1 Complete!

**You should now have:**
- ✅ MongoDB Atlas free cluster running
- ✅ Database admin user created
- ✅ Network access configured (0.0.0.0/0)
- ✅ Connection URI ready with URL-encoded password
- ✅ Connection tested (optional)

**Save These for Next Steps:**
```
📝 MongoDB Connection URI:
mongodb+srv://bhibhushitams_admin:YOUR_ENCODED_PASSWORD@bhibhushitams-cluster.xxxxx.mongodb.net/bhibhushitams_production?retryWrites=true&w=majority

📝 Database Name: bhibhushitams_production
📝 Username: bhibhushitams_admin
📝 Password: [Your secure password]
```

---

## Prerequisites

### Required Software
- Node.js 18+ and npm/yarn
- MongoDB 5.0+ (or MongoDB Atlas account)
- Git
- PM2 or similar process manager (for Node.js)
- Nginx or similar reverse proxy
- SSL Certificate (Let's Encrypt recommended)

### Recommended Infrastructure
- **Frontend**: Vercel, Netlify, or AWS Amplify
- **Backend**: AWS EC2, DigitalOcean, Heroku, or Railway
- **Database**: MongoDB Atlas or self-hosted MongoDB
- **File Storage**: AWS S3, Cloudinary, or similar CDN

---

## Environment Variables

### Backend API (.env)
Create a `.env` file in `apps/api/`:

```bash
# Server Configuration
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bhibhushitams?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your-super-secure-jwt-secret-key-change-this-in-production
JWT_EXPIRE=7d
COOKIE_EXPIRE=7

# CORS Configuration
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Email Configuration (for password reset, notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=Bhibhushitams Security

# File Upload
MAX_FILE_SIZE=5242880
FILE_UPLOAD_PATH=./public/uploads

# AWS S3 (Optional, for certificate PDFs)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=your-bucket-name
AWS_REGION=us-east-1

# Certificate Generation
CERTIFICATE_ISSUER=Bhibhushitams Security
CERTIFICATE_SIGNATURE=Your Signature Name
```

### Frontend Web App (.env.local or .env.production)
Create a `.env.local` file in `apps/web/`:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1

# App Configuration
NEXT_PUBLIC_APP_NAME=Bhibhushitams Security
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Analytics (Optional)
NEXT_PUBLIC_GA_TRACKING_ID=G-XXXXXXXXXX
```

---

## Database Setup

### Option 1: MongoDB Atlas (Recommended)
1. Create a MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster (free tier available)
3. Set up database access:
   - Create a database user with read/write permissions
   - Whitelist your server IP addresses (or 0.0.0.0/0 for all)
4. Get your connection string:
   ```
   mongodb+srv://<username>:<password>@cluster.mongodb.net/<dbname>
   ```
5. Update `MONGODB_URI` in your backend `.env` file

### Option 2: Self-Hosted MongoDB
```bash
# Ubuntu/Debian
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Secure MongoDB
mongo
> use admin
> db.createUser({
    user: "admin",
    pwd: "your-secure-password",
    roles: ["userAdminAnyDatabase", "dbAdminAnyDatabase", "readWriteAnyDatabase"]
  })

# Update connection string
MONGODB_URI=mongodb://admin:your-secure-password@localhost:27017/bhibhushitams
```

### Database Indexes
Run these commands to create necessary indexes:

```javascript
// Connect to MongoDB
use bhibhushitams

// Users Collection
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ role: 1 })

// Courses Collection
db.courses.createIndex({ slug: 1 }, { unique: true })
db.courses.createIndex({ status: 1 })

// Certificates Collection
db.certificates.createIndex({ certificateId: 1 }, { unique: true })
db.certificates.createIndex({ studentId: 1 })
db.certificates.createIndex({ status: 1 })

// Internships Collection
db.internships.createIndex({ slug: 1 }, { unique: true })

// Jobs Collection
db.jobs.createIndex({ status: 1 })
db.jobs.createIndex({ companyId: 1 })
```

---

## Backend Deployment

### Option 1: Deploy to Heroku
```bash
# Login to Heroku
heroku login

# Create new app
heroku create bhibhushitams-api

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your-mongodb-uri
heroku config:set JWT_SECRET=your-jwt-secret

# Deploy
git subtree push --prefix apps/api heroku main

# Check logs
heroku logs --tail
```

### Option 2: Deploy to DigitalOcean/AWS EC2
```bash
# SSH into your server
ssh root@your-server-ip

# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Clone repository
git clone https://github.com/yourusername/bhibhushitams-security.git
cd bhibhushitams-security/apps/api

# Install dependencies
npm install --production

# Build (if using TypeScript)
npm run build

# Create .env file with production variables
nano .env

# Start app with PM2
pm2 start dist/server.js --name "bhibhushitams-api"

# Save PM2 configuration
pm2 save
pm2 startup

# Monitor
pm2 monit
```

### Nginx Configuration for Backend
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

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

---

## Frontend Deployment

### Option 1: Deploy to Vercel (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to web app directory
cd apps/web

# Login to Vercel
vercel login

# Deploy
vercel --prod

# Set environment variables in Vercel Dashboard
# Settings > Environment Variables
# Add: NEXT_PUBLIC_API_URL, etc.
```

### Option 2: Deploy to Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Navigate to web app directory
cd apps/web

# Build the app
npm run build

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod --dir=.next
```

### Option 3: Self-Hosted with Nginx
```bash
# Build the Next.js app
cd apps/web
npm run build

# Start Next.js in production mode with PM2
pm2 start "npm run start" --name "bhibhushitams-web"
pm2 save
```

### Nginx Configuration for Frontend
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## SSL/HTTPS Configuration

### Using Let's Encrypt (Free SSL)
```bash
# Install Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Certbot will automatically configure Nginx
# SSL certificates will auto-renew

# Test auto-renewal
sudo certbot renew --dry-run
```

### Manual SSL Configuration
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /path/to/fullchain.pem;
    ssl_certificate_key /path/to/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

---

## Monitoring & Logging

### PM2 Monitoring
```bash
# View logs
pm2 logs bhibhushitams-api
pm2 logs bhibhushitams-web

# Monitor processes
pm2 monit

# View process status
pm2 status

# Restart on changes
pm2 reload all
```

### Application Logging
Add logging to your backend:

```javascript
// Example with Winston
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

### Health Check Endpoints
Add health check endpoints to your API:

```javascript
// apps/api/src/routes/health.ts
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});
```

---

## Backup & Recovery

### MongoDB Backup
```bash
# Manual backup
mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/bhibhushitams" --out=/backup/$(date +%Y%m%d)

# Restore from backup
mongorestore --uri="mongodb+srv://user:pass@cluster.mongodb.net/bhibhushitams" /backup/20240307

# Automated daily backups (cron job)
0 2 * * * /usr/bin/mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/bhibhushitams" --out=/backup/$(date +\%Y\%m\%d) && find /backup/* -mtime +7 -exec rm -rf {} \;
```

### Application Backup
```bash
# Backup uploaded files
tar -czf uploads-$(date +%Y%m%d).tar.gz /path/to/public/uploads

# Backup environment files (securely)
tar -czf env-backup-$(date +%Y%m%d).tar.gz .env

# Store backups securely (e.g., AWS S3)
aws s3 cp uploads-$(date +%Y%m%d).tar.gz s3://your-backup-bucket/
```

---

## Post-Deployment Checklist

### Security
- [ ] All environment variables are set correctly
- [ ] API endpoints are secured with authentication
- [ ] CORS is configured properly
- [ ] SSL/HTTPS is enabled
- [ ] Database has authentication enabled
- [ ] File upload size limits are configured
- [ ] Rate limiting is enabled on API endpoints
- [ ] Input validation is implemented
- [ ] XSS protection is enabled
- [ ] CSRF protection is enabled

### Performance
- [ ] Database indexes are created
- [ ] Caching is configured (Redis recommended)
- [ ] CDN is configured for static assets
- [ ] Image optimization is enabled
- [ ] Compression is enabled (gzip/brotli)
- [ ] Connection pooling is configured for database

### Monitoring
- [ ] Health check endpoints are working
- [ ] Logging is configured
- [ ] Error tracking is set up (Sentry recommended)
- [ ] Uptime monitoring is configured
- [ ] Performance monitoring is enabled

### Testing
- [ ] All API endpoints are tested
- [ ] Authentication flows work correctly
- [ ] Certificate generation and verification work
- [ ] File uploads work correctly
- [ ] Email notifications work
- [ ] QR codes generate and scan correctly
- [ ] Payment integration works (if applicable)

---

## Maintenance

### Regular Updates
```bash
# Update dependencies
npm outdated
npm update

# Security audit
npm audit
npm audit fix

# Update PM2
pm2 update
```

### Scaling
- Use load balancers for multiple backend instances
- Implement Redis for session management across instances
- Consider Kubernetes for container orchestration
- Use read replicas for MongoDB

---

## Troubleshooting

### Common Issues

**Issue: Cannot connect to database**
- Check MongoDB URI is correct
- Verify database user permissions
- Check IP whitelist in MongoDB Atlas
- Ensure network connectivity

**Issue: CORS errors**
- Verify `ALLOWED_ORIGINS` in backend .env
- Check API URL in frontend .env
- Ensure credentials are included in fetch requests

**Issue: Certificate generation fails**
- Check filesystem permissions for uploads directory
- Verify QR code generation library is installed
- Check MongoDB write permissions

**Issue: Authentication not working**
- Verify JWT_SECRET matches between backend instances
- Check cookie settings (httpOnly, secure, sameSite)
- Ensure HTTPS is enabled in production

---

## Support

For issues or questions:
- Documentation: `/docs` directory
- GitHub Issues: [Repository URL]
- Email: support@yourdomain.com

---

## Version History

- **v1.0.0** (March 2026) - Initial deployment
  - User authentication and authorization
  - Course management
  - Internship applications
  - Job portal
  - Certificate verification
  - Ambassador program
  - Admin and student dashboards
