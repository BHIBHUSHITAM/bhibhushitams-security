# Step 2: Backend Deployment on Render

**Status:** Ready to deploy  
**GitHub Repo:** https://github.com/BHIBHUSHITAM/bhibhushitams-security  
**Backend Path:** `apps/api`

---

## PART A: Render Account Setup (1-2 minutes)

### 1. Create Render Account
- Go to https://render.com
- Click **Sign Up**
- Choose **Sign up with GitHub**
- Authorize Render to access your GitHub account
- Complete setup

### 2. Connect GitHub Account
- In Render dashboard, go to **Settings → GitHub**
- Click **Connect GitHub**
- Select your GitHub account
- When prompted, install Render GitHub App
- Give it access to `bhibhushitams-security` repository
- Authorize

---

## PART B: Create Backend Service (5 minutes)

### 3. Create New Web Service
- Dashboard → Click **+ New** → Select **Web Service**
- **Connect a repository:** Select `bhibhushitams-security`
- Click **Connect**

### 4. Configure Service
| Field | Value |
|-------|-------|
| **Name** | `bhibhushitams-api` |
| **Environment** | `Node` |
| **Region** | `Singapore` (closest to India) or `Frankfurt` |
| **Branch** | `main` |
| **Root Directory** | `apps/api` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |

### 5. Choose Plan
- Select **Free** tier (sufficient for MVP)
- Click **Create Web Service**

---

## PART C: Set Environment Variables (5 minutes)

### 6. Add Environment Variables

**📁 Your .env file location:**
```
C:\Users\nemas\bhibhushitams-security\apps\api\.env
```

**Option A - Quick Upload (Recommended):**
1. Click **Add from .env** button
2. Browse and select the file above
3. All variables load automatically
4. Change `NODE_ENV=development` to `NODE_ENV=production`
5. Click **Save**

**Option B - Manual Entry:**
1. In service dashboard, go to **Environment** tab
2. Click **Add Environment Variable**
3. Copy-paste these **exactly**:

| Variable Name | Value from your .env |
|---------------|---------------------|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | (Copy from your .env file) |
| `JWT_ACCESS_SECRET` | (Copy from your .env file) |
| `JWT_REFRESH_SECRET` | (Copy from your .env file) |
| `ACCESS_TOKEN_EXPIRES_IN` | `15m` |
| `REFRESH_TOKEN_EXPIRES_IN` | `7d` |
| `CORS_ORIGIN` | `http://localhost:3000` |
| `TRUST_PROXY` | `1` |
| `FRONTEND_URL` | `https://bhibhushitams-security.vercel.app` |

Click **Add Environment Variable** for each one, then **Save**.

---

## PART D: Final Configuration & Deploy

### 7. Set Health Check Path
Scroll down on the same page to **Advanced** section:
- **Health Check Path:** `/api/v1/health`
- Leave **Auto-Deploy** enabled (ON)

### 8. Deploy Service
- Click **Create Web Service** button at the bottom
- Wait for deployment (takes 3-5 minutes)
- Watch the **Logs** tab for progress

---

## PART E: Verify Deployment (3-5 minutes)

### 9. Monitor Build
- Go to **Logs** tab
- Watch build progress
- Look for: `Build started on...` → `Build successful` → `Deploying...`
- Final message: `Listening on port 10000` or similar ✅

### 10. Get Service URL
- Click **Settings** tab
- Copy **Service URL** (looks like `https://bhibhushitams-api-xxxx.onrender.com`)
- Save this URL - you'll need it for frontend!

### 11. Test Backend Health
Open browser and visit:
```
https://bhibhushitams-api-xxxx.onrender.com/api/v1/health
```

**Expected response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-03-08T...",
  "environment": "production"
}
```

✅ If you see this → **Backend is LIVE!**

---

## PART E: Troubleshooting

### Build Failed?
- Check **Logs** tab for error messages
- Common issues:
  - Missing `NODE_ENV` env var
  - Incorrect MongoDB URI
  - Port conflicts (Render uses port 10000, not 5000)

### MongoDB Connection Error?
1. Verify MongoDB Atlas:
   - Check cluster is in correct region
   - Verify IP whitelist includes `0.0.0.0/0`
   - Test locally first: `npm run dev` in `apps/api`

### CORS Errors?
- Expected for now (frontend not deployed yet)
- We'll update `CORS_ORIGIN` after Vercel deployment

---

## ✅ Checklist

- [ ] Render account created
- [ ] GitHub authenticated with Render
- [ ] Web Service created (`bhibhushitams-api`)
- [ ] Build command set: `npm install && npm run build`
- [ ] Start command set: `npm start`
- [ ] Root directory: `apps/api`
- [ ] All 7 environment variables added
- [ ] Build completed successfully
- [ ] Health endpoint responds with healthy status
- [ ] Service URL saved (e.g., `https://bhibhushitams-api-xxxx.onrender.com`)

---

## 🎯 Next Steps (After Verification)

1. Save your backend service URL
2. Proceed to **Step 3: Frontend Deployment on Vercel**
3. Update `CORS_ORIGIN` in Render with Vercel URL

**Your backend is production-ready!** 🚀
