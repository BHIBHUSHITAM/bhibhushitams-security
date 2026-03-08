# ✅ MongoDB Atlas Setup Checklist (Step 1)

## Quick Reference Card for Deployment Step 1

### Time Required: 10-15 minutes

---

## 🔲 Pre-Setup

- [ ] Have email ready for Atlas account
- [ ] Choose Google/GitHub for quick sign-up OR use email/password
- [ ] Have password manager ready to store credentials

---

## 🔲 Atlas Account Setup

- [ ] Go to https://www.mongodb.com/cloud/atlas/register
- [ ] Create account (Google/GitHub/Email)
- [ ] Verify email address
- [ ] Login to Atlas dashboard

---

## 🔲 Cluster Creation

- [ ] Click "Create" under M0 (Free tier)
- [ ] Select provider: **AWS** (recommended)
- [ ] Select region: **Choose closest to users**
  - India → Mumbai (ap-south-1)
  - USA → N. Virginia (us-east-1)
  - Europe → Frankfurt (eu-central-1)
- [ ] Name cluster: `bhibhushitams-cluster`
- [ ] Click "Create Cluster"
- [ ] Wait 3-5 minutes for cluster creation

---

## 🔲 Database User Setup

- [ ] Go to: Security → Database Access
- [ ] Click "+ ADD NEW DATABASE USER"
- [ ] Username: `bhibhushitams_admin`
- [ ] Password: **Generate secure** or create strong password
- [ ] **SAVE CREDENTIALS IMMEDIATELY:**
  ```
  Username: ___________________________
  Password: ___________________________
  ```
- [ ] Set privileges: **"Atlas admin"** or **"Read and write to any database"**
- [ ] Click "Add User"

---

## 🔲 Network Access Setup

- [ ] Go to: Security → Network Access
- [ ] Click "+ ADD IP ADDRESS"
- [ ] Choose: **"ALLOW ACCESS FROM ANYWHERE"**
- [ ] IP: `0.0.0.0/0` (auto-filled)
- [ ] Comment: "Production servers"
- [ ] Click "Confirm"
- [ ] Wait for "Active" status (~1 minute)

---

## 🔲 Get Connection String

- [ ] Go to: Deployment → Database
- [ ] Click "Connect" on your cluster
- [ ] Choose: "Connect your application"
- [ ] Driver: **Node.js**
- [ ] Copy connection string
- [ ] **Modify connection string:**
  ```
  Original:
  mongodb+srv://bhibhushitams_admin:<password>@cluster.xxxxx.mongodb.net/
  
  Modified (add database name + real password):
  mongodb+srv://bhibhushitams_admin:YOUR_PASSWORD@cluster.xxxxx.mongodb.net/bhibhushitams_production?retryWrites=true&w=majority
  ```

---

## 🔲 URL-Encode Password (If Needed)

**Does your password contain these characters?**
`@ : / % # $ ! * ( ) + = [ ] { } | \ ; ' " , < > ?`

**If YES, encode them:**

| Character | Replace With |
|-----------|-------------|
| `@`       | `%40`       |
| `:`       | `%3A`       |
| `/`       | `%2F`       |
| `%`       | `%25`       |
| `#`       | `%23`       |
| `$`       | `%24`       |
| `!`       | `%21`       |

**Example:**
- Password: `MyP@ss#2026`
- Encoded: `MyP%40ss%232026`

- [ ] Password contains special characters
- [ ] Special characters URL-encoded
- [ ] Final URI created with encoded password

---

## 🔲 Save Production URI

**Final Production MongoDB URI:**

```
mongodb+srv://bhibhushitams_admin:ENCODED_PASSWORD@bhibhushitams-cluster.xxxxx.mongodb.net/bhibhushitams_production?retryWrites=true&w=majority
```

- [ ] Copy to secure location (password manager)
- [ ] Will be used in Render deployment (Step 2)

---

## 🔲 Test Connection (Optional)

**Quick Node.js Test:**

```bash
cd apps/api
# Update .env with your Atlas URI
MONGODB_URI=mongodb+srv://...
# Test connection
npm run dev
```

- [ ] Connection successful
- [ ] No authentication errors
- [ ] No timeout errors

---

## ✅ Step 1 Complete - Ready for Step 2!

**You have:**
- ✅ Free MongoDB Atlas M0 cluster (512MB)
- ✅ Admin database user
- ✅ Network access configured
- ✅ Production-ready connection URI
- ✅ Credentials saved securely

**Next:** [Step 2 - Backend API Deployment on Render](DEPLOYMENT_GUIDE.md#step-2-backend-api-deployment-on-render)

---

## 🆘 Quick Troubleshooting

### Can't connect?
1. Check Network Access has `0.0.0.0/0`
2. Wait 1-2 minutes after adding IP
3. Verify password is URL-encoded
4. Check username/password are correct

### Authentication failed?
1. Re-check password (copy-paste carefully)
2. Ensure password is URL-encoded
3. Verify user exists in Database Access
4. Try creating new user with simpler password

### Cluster paused?
- Free tier auto-pauses after 60 days idle
- Click "Resume" button on cluster
- Wait 2-3 minutes for activation

---

## 📞 Support

- Atlas Documentation: https://docs.atlas.mongodb.com/
- Atlas Support: https://support.mongodb.com/
- Community Forum: https://www.mongodb.com/community/forums/

---

**Last Updated:** March 8, 2026  
**Deployment Guide:** [Full Guide](DEPLOYMENT_GUIDE.md)
