# Quick Start Guide - Bhibhushitams Security Platform

This guide will help you get the platform up and running on your local machine in under 10 minutes.

## Prerequisites
- Node.js 18+ and npm
- MongoDB (local installation or MongoDB Atlas account)
- Git

---

## Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/bhibhushitams-security.git
cd bhibhushitams-security
```

---

## Step 2: Setup MongoDB

### Option A: Use MongoDB Atlas (Easiest)
1. Sign up at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)

### Option B: Local MongoDB
```bash
# macOS (using Homebrew)
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Ubuntu/Debian
sudo apt-get install mongodb
sudo systemctl start mongodb

# Windows
# Download and install from: https://www.mongodb.com/try/download/community
```

---

## Step 3: Setup Backend API

```bash
# Navigate to API directory
cd apps/api

# Install dependencies
npm install

# Create environment file
cp .env.example .env  # Or create manually

# Edit .env file with your configuration
```

### Required Environment Variables (.env)
```bash
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/bhibhushitams
# OR for Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bhibhushitams

JWT_SECRET=your-secret-key-change-this
JWT_EXPIRE=7d
COOKIE_EXPIRE=7
```

### Start the API Server
```bash
# Development mode with hot reload
npm run dev

# The API will start on http://localhost:5000
```

---

## Step 4: Setup Frontend Web App

Open a new terminal:

```bash
# Navigate to web app directory
cd apps/web

# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local  # Or create manually
```

### Required Environment Variables (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_APP_NAME=Bhibhushitams Security
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Start the Web App
```bash
# Development mode
npm run dev

# The app will start on http://localhost:3000
```

---

## Step 5: Create an Admin User

Once both servers are running:

### Option A: Use the Signup Page
1. Visit http://localhost:3000/signup
2. Create an account
3. Manually update the user role in MongoDB:
```javascript
// Connect to MongoDB
use bhibhushitams

// Update user role to admin
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

### Option B: Use API Directly
```bash
# Register a new user
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "password123",
    "role": "admin"
  }'
```

---

## Step 6: Test the Platform

### Login
1. Visit http://localhost:3000/login
2. Login with your credentials
3. You should be redirected based on your role:
   - **Admin**: `/admin/dashboard`
   - **Student**: `/student/dashboard`
   - **Company**: `/company/dashboard`

### Test Certificate Verification
1. Visit http://localhost:3000/test-qr
2. View the generated QR code
3. Click "Open Verification Page" to test
4. Or visit http://localhost:3000/verify

### Explore Features
- **Courses**: http://localhost:3000/courses
- **Internships**: http://localhost:3000/internships
- **Jobs**: http://localhost:3000/jobs
- **Ambassadors**: http://localhost:3000/ambassadors
- **Events**: http://localhost:3000/events

---

## Project Structure

```
bhibhushitams-security/
├── apps/
│   ├── api/                    # Backend API (Node.js/Express)
│   │   ├── src/
│   │   │   ├── config/         # Configuration files
│   │   │   ├── middleware/     # Express middleware
│   │   │   ├── modules/        # Feature modules
│   │   │   │   ├── auth/       # Authentication
│   │   │   │   ├── certificates/
│   │   │   │   ├── courses/
│   │   │   │   ├── internships/
│   │   │   │   ├── jobs/
│   │   │   │   └── users/
│   │   │   └── server.ts       # Entry point
│   │   └── package.json
│   │
│   └── web/                    # Frontend (Next.js)
│       ├── src/
│       │   ├── app/            # App router pages
│       │   │   ├── (public)/   # Public routes
│       │   │   ├── (protected)/ # Protected routes
│       │   │   ├── admin/      # Admin dashboard
│       │   │   ├── student/    # Student dashboard
│       │   │   └── company/    # Company dashboard
│       │   ├── components/     # React components
│       │   └── lib/            # Utilities & API clients
│       └── package.json
│
├── docs/                       # Documentation
│   ├── DEPLOYMENT_GUIDE.md
│   ├── CERTIFICATE_TESTING_GUIDE.md
│   └── QUICK_START.md (this file)
│
└── README.md
```

---

## Common Commands

### Backend (apps/api)
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm test             # Run tests
```

### Frontend (apps/web)
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

---

## Available Roles

### Admin
- Full access to all features
- Can manage users, courses, internships, jobs
- Can issue certificates
- Access to admin dashboard

### Student
- Can enroll in courses and internships
- Can apply for jobs
- Can view their certificates
- Can participate in ambassador program
- Access to student dashboard

### Company
- Can post jobs
- Can view applicants
- Access to company dashboard

---

## Default API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/logout` - Logout
- `GET /api/v1/auth/me` - Get current user
- `PUT /api/v1/auth/update-profile` - Update profile
- `PUT /api/v1/auth/update-password` - Change password

### Courses
- `GET /api/v1/courses` - Get all courses
- `GET /api/v1/courses/:id` - Get course by ID
- `POST /api/v1/courses` - Create course (admin)
- `PUT /api/v1/courses/:id` - Update course (admin)
- `DELETE /api/v1/courses/:id` - Delete course (admin)

### Certificates
- `GET /api/v1/certificates/verify/:certificateId` - Verify certificate (public)
- `GET /api/v1/certificates/my-certificates` - Get student certificates
- `POST /api/v1/certificates` - Issue certificate (admin)
- `PATCH /api/v1/certificates/revoke/:id` - Revoke certificate (admin)

### Internships
- `GET /api/v1/internships` - Get all internships
- `POST /api/v1/internships` - Create internship (admin)
- `POST /api/v1/internships/:id/apply` - Apply for internship (student)

### Jobs
- `GET /api/v1/jobs` - Get all jobs
- `POST /api/v1/jobs` - Create job (company)
- `POST /api/v1/jobs/:id/apply` - Apply for job (student)

---

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000 (frontend)
npx kill-port 3000

# Kill process on port 5000 (backend)
npx kill-port 5000

# Or on Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### MongoDB Connection Error
- Verify MongoDB is running: `mongo` or `mongosh`
- Check connection string in `.env`
- For Atlas: Ensure IP is whitelisted

### Dependencies Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Or use npm ci for clean install
npm ci
```

### Build Errors
```bash
# Frontend issues
cd apps/web
rm -rf .next
npm run build

# Backend issues
cd apps/api
rm -rf dist
npm run build
```

---

## Next Steps

1. ✅ Setup complete
2. 📚 Read [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for production deployment
3. 🧪 Read [CERTIFICATE_TESTING_GUIDE.md](./CERTIFICATE_TESTING_GUIDE.md) for testing QR codes
4. 🎨 Customize branding and content
5. 🔐 Configure email service for password reset
6. 💳 Integrate payment gateway (if needed)
7. 📊 Set up analytics
8. 🚀 Deploy to production

---

## Support & Resources

- **Documentation**: `/docs` directory
- **GitHub Issues**: [Report bugs or request features]
- **API Docs**: http://localhost:5000/api-docs (if configured)

---

## License

[Your License Here]

---

**Happy Coding! 🚀**
