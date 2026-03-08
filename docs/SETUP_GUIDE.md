# 🚀 Bhibhushitams Security - Setup & Configuration Guide

## Quick Fix Summary (Critical Issues Resolved)

### ✅ Fixed in This Update:
1. ✅ **Event Routes Export Issue** - Changed from default to named export
2. ✅ **Job Routes Order Bug** - Reordered routes to prevent conflicts
3. ✅ **Missing .env Files** - Created with default values
4. ✅ **Improved Error Handling** - Better error middleware with type detection
5. ✅ **Added Rate Limiting** - Protection against brute force attacks
6. ✅ **Enhanced Security Headers** - Improved Helmet configuration
7. ✅ **Database Indexes** - Added for better performance

---

## 📋 Pre-requisites

Before starting, ensure you have:
- **Node.js** v18+ ([Download](https://nodejs.org/))
- **MongoDB** v5.0+ (Local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- **npm** v8+ (comes with Node.js)
- **Git** (for version control)

---

## 🛠️ Installation Steps

### Step 1: Clone & Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/bhibhushitams-security.git
cd bhibhushitams-security
```

### Step 2: Backend Setup

```bash
# Navigate to API directory
cd apps/api

# Install dependencies
npm install

# The .env file has been created with default values
# ⚠️ IMPORTANT: Update these values before running:
# - MONGODB_URI (your MongoDB connection string)
# - JWT_ACCESS_SECRET (generate a strong random string)
# - JWT_REFRESH_SECRET (generate a different strong random string)

# To generate secure secrets, run:
# node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Start the development server
npm run dev

# Server should start on http://localhost:5000
```

### Step 3: Frontend Setup

```bash
# Open a new terminal and navigate to web directory
cd apps/web

# Install dependencies
npm install

# The .env.local file has been created
# Update NEXT_PUBLIC_API_URL if your backend is on a different port

# Start the development server
npm run dev

# Frontend should start on http://localhost:3000
```

---

## 🔐 Environment Variables

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/bhibhushitams_security
JWT_ACCESS_SECRET=your-super-secret-access-key-change-this
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

---

## 📊 Database Setup

### Option 1: Local MongoDB

```bash
# Start MongoDB service
# Windows: mongod --dbpath C:\data\db
# Mac/Linux: sudo systemctl start mongod

# The database "bhibhushitams_security" will be created automatically
```

### Option 2: MongoDB Atlas (Cloud)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier available)
3. Get connection string
4. Update `MONGODB_URI` in `.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bhibhushitams_security?retryWrites=true&w=majority
```

---

## 🧪 Testing the Setup

### 1. Check Backend Health
```bash
curl http://localhost:5000/api/v1/health
# Expected: {"status":"ok","service":"bhibhushitams-auth-api"}
```

### 2. Test Authentication
```bash
# Signup
curl -X POST http://localhost:5000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test123!@#",
    "role": "student"
  }'
```

### 3. Access Frontend
- Visit http://localhost:3000
- You should see the landing page
- Try navigating to /login and /signup

---

## 🔧 Common Issues & Solutions

### Issue 1: "Module not found" errors
**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue 2: MongoDB connection failed
**Solution:**
- Check MongoDB is running: `mongosh` or `mongo`
- Verify connection string in `.env`
- Check firewall/network settings

### Issue 3: Port already in use
**Solution:**
```bash
# Change PORT in .env file or kill the process
# Windows: netstat -ano | findstr :5000
# Mac/Linux: lsof -ti:5000 | xargs kill
```

### Issue 4: CORS errors in browser
**Solution:**
- Verify `CORS_ORIGIN` in backend `.env` matches frontend URL
- Clear browser cache
- Try in incognito mode

### Issue 5: TypeScript errors
**Solution:**
```bash
# In the problematic directory
npm run typecheck
# Fix any reported type issues
```

---

## 🚀 Deployment Considerations

### Before Production:

1. **Security:**
   - ✅ Change all JWT secrets to strong random strings
   - ✅ Set `NODE_ENV=production`
   - ✅ Enable HTTPS
   - ✅ Configure proper CORS_ORIGIN
   - ⚠️ Consider Redis for rate limiting (current is in-memory)
   - ⚠️ Add comprehensive logging (Winston, Pino)

2. **Database:**
   - ✅ Use MongoDB Atlas or dedicated server
   - ✅ Enable authentication
   - ✅ Set up regular backups
   - ✅ Indexes are already configured

3. **Monitoring:**
   - Set up error tracking (Sentry)
   - Add performance monitoring (New Relic, Datadog)
   - Configure log aggregation

4. **Performance:**
   - Enable API response caching
   - Use CDN for static assets
   - Optimize images
   - Enable gzip compression

---

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication Flow
1. Signup/Login → Receives access token & refresh token in cookies
2. Include credentials in all authenticated requests
3. Use refresh token to get new access token when expired

### Available Endpoints

#### Auth
- `POST /auth/signup` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout user
- `GET /auth/me` - Get current user
- `POST /auth/refresh` - Refresh access token

#### Courses
- `GET /courses` - List all courses
- `GET /courses/:slug` - Get course by slug
- `POST /courses/enroll` - Enroll in course (student)
- `GET /courses/student/enrollments` - Get student enrollments

#### Jobs
- `GET /jobs` - List jobs with filters
- `GET /jobs/:jobId` - Get single job
- `POST /jobs/:jobId/apply` - Apply for job (student)
- `POST /jobs/company/create` - Create job (company)

#### Internships
- `GET /internships` - List internships
- `POST /internships/:id/apply` - Apply for internship
- `GET /internships/student/applications` - Get applications

#### Events
- `GET /events` - List events
- `POST /events/:eventId/register` - Register for event
- `GET /events/registrations/my-registrations` - My registrations

#### Certificates
- `GET /certificates/verify/:id` - Verify certificate
- `GET /certificates/my-certificates` - Get my certificates
- `POST /certificates` - Issue certificate (admin)

#### Ambassadors
- `GET /ambassadors` - List ambassadors
- `POST /ambassadors/apply` - Apply for program
- `GET /ambassadors/leaderboard` - Get leaderboard

---

## 🎯 Next Steps

After successful setup:

1. **Seed Sample Data:**
```bash
cd apps/api
npm run seed:courses
```

2. **Create Admin Account:**
   - Use signup with `role: "admin"`
   - Or modify an existing user in MongoDB

3. **Explore Features:**
   - Student Dashboard: http://localhost:3000/student
   - Admin Panel: http://localhost:3000/admin
   - Certificate Verification: http://localhost:3000/verify

4. **Development Tips:**
   - Use `npm run typecheck` to catch type errors
   - Backend hot reloads on file changes
   - Frontend hot reloads automatically
   - Check browser console and terminal for errors

---

## 📞 Support

If you encounter issues:
1. Check the error message carefully
2. Verify all environment variables are set
3. Check MongoDB connection
4. Review this guide again
5. Check the `/docs` folder for more documentation

---

## 🔒 Security Best Practices

1. **Never commit `.env` files** - Already in `.gitignore`
2. **Use strong passwords** for all accounts
3. **Rotate JWT secrets** regularly in production
4. **Review rate limits** based on your traffic
5. **Keep dependencies updated** - Run `npm audit` regularly
6. **Enable 2FA** for production database access

---

## ✅ Verification Checklist

- [ ] MongoDB is running and accessible
- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Can access http://localhost:3000
- [ ] Can signup/login successfully
- [ ] API health check returns OK
- [ ] No CORS errors in browser console
- [ ] TypeScript compiles without errors

If all boxes are checked, you're ready to develop! 🎉
