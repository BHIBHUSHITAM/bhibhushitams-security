# ✅ MongoDB Atlas Network Access Verification

## Quick Verification Steps

### Step 1: Check Network Access Settings

1. **Login to MongoDB Atlas**
   - Go to: https://cloud.mongodb.com/
   - Login with your credentials

2. **Navigate to Network Access**
   - Left sidebar → **"Security"** → **"Network Access"**
   - Or direct URL: https://cloud.mongodb.com/v2#/security/network/accessList

3. **Verify IP Whitelist Entry**

   You should see at least one entry. Check for:

   **✅ CORRECT Configuration (For Deployment):**
   ```
   IP Address: 0.0.0.0/0
   Comment: Allow from anywhere / Production servers
   Status: ACTIVE (green checkmark)
   ```

   **OR for specific IPs:**
   ```
   IP Address: Your specific IP or IP range
   Status: ACTIVE (green checkmark)
   ```

### Step 2: Quick Visual Check

Look at your Network Access page. It should look like:

```
┌─────────────────────────────────────────────────────────────┐
│ IP Access List                                               │
├─────────────────────────────────────────────────────────────┤
│ ✅ 0.0.0.0/0          │ Production servers │ ACTIVE         │
│ ✅ 123.45.67.89/32    │ My local IP       │ ACTIVE         │
└─────────────────────────────────────────────────────────────┘
```

### Step 3: Test Connection from Local

Run this test in your terminal:

```powershell
cd C:\Users\nemas\bhibhushitams-security\apps\api

# Create test file
@"
const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
console.log('Testing connection to:', uri.split('@')[1]?.split('/')[0] || 'Atlas');

mongoose.connect(uri, { 
  serverSelectionTimeoutMS: 10000 
})
  .then(() => {
    console.log('✅ SUCCESS! MongoDB Atlas connected');
    console.log('📊 Database:', mongoose.connection.name);
    console.log('🌐 Host:', mongoose.connection.host);
    console.log('');
    console.log('✅ Network access is configured correctly!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ CONNECTION FAILED!');
    console.error('');
    console.error('Error:', error.message);
    console.error('');
    console.error('🔍 DIAGNOSIS:');
    
    if (error.message.includes('authentication')) {
      console.error('   → Wrong username or password');
      console.error('   → Check Database Access settings');
    } else if (error.message.includes('ECONNREFUSED') || error.message.includes('timeout')) {
      console.error('   → ⚠️  NETWORK ACCESS NOT CONFIGURED!');
      console.error('   → Add 0.0.0.0/0 to Network Access');
      console.error('   → Or add your current IP address');
    } else if (error.message.includes('bad auth')) {
      console.error('   → Password may contain special characters');
      console.error('   → URL-encode the password');
    } else {
      console.error('   → Check connection string format');
    }
    
    process.exit(1);
  });
"@ | Out-File -FilePath test-atlas-connection.js -Encoding utf8

# Run test
node test-atlas-connection.js
```

### Step 4: Interpret Results

**✅ If you see:**
```
✅ SUCCESS! MongoDB Atlas connected
📊 Database: bhibhushitams_production
🌐 Host: bhibhushitams-cluster.xxxxx.mongodb.net
✅ Network access is configured correctly!
```
**→ Everything is working! Network access is configured.**

---

**❌ If you see:**
```
❌ CONNECTION FAILED!
Error: connect ETIMEDOUT
🔍 DIAGNOSIS:
   → ⚠️  NETWORK ACCESS NOT CONFIGURED!
```
**→ Network access is NOT configured. Follow fixing steps below.**

---

## 🔧 Fix Network Access Issues

### Problem: Connection Timeout / ECONNREFUSED

**Solution:**

1. Go to Atlas → Security → Network Access
2. Check if any entries exist:
   - **If NO entries:** Add one
   - **If entries show "PENDING":** Wait 1-2 minutes
   - **If entries show "FAILED":** Delete and recreate

3. **Add/Fix Entry:**
   - Click **"+ ADD IP ADDRESS"**
   - Click **"ALLOW ACCESS FROM ANYWHERE"**
   - IP will auto-fill: `0.0.0.0/0`
   - Comment: `Production and development servers`
   - Click **"Confirm"**

4. **Wait for Activation**
   - Status will change: `PENDING` → `ACTIVE` (1-2 minutes)
   - ⏰ Don't test until it shows **ACTIVE**

5. **Re-test connection** (run the test script again)

---

### Problem: "Authentication failed"

**This is NOT a network issue.** Your network is configured, but credentials are wrong.

**Solutions:**
1. Check username/password in Database Access
2. Verify password is URL-encoded in connection string
3. Recreate database user with simpler password

---

### Problem: Entry exists but shows "INACTIVE"

**Solution:**
1. Delete the inactive entry
2. Create a new entry with `0.0.0.0/0`
3. Wait for ACTIVE status

---

## 📋 Final Verification Checklist

Run through this checklist:

- [ ] Login to MongoDB Atlas successful
- [ ] Navigate to: Security → Network Access
- [ ] See at least one entry
- [ ] Entry shows **"ACTIVE"** status (not PENDING/FAILED)
- [ ] IP Address is `0.0.0.0/0` OR your specific IP
- [ ] Test connection script runs successfully
- [ ] See "✅ SUCCESS! MongoDB Atlas connected" message

**If all checked:** ✅ Your Network Access is configured correctly!

---

## 🆘 Still Having Issues?

### Quick Diagnostic Commands

**Check if MongoDB port is blocked by firewall:**
```powershell
Test-NetConnection -ComputerName bhibhushitams-cluster.xxxxx.mongodb.net -Port 27017
```

**Expected output if network is OK:**
```
TcpTestSucceeded : True
```

**If FALSE:** Your network/ISP/firewall is blocking MongoDB.

---

## 📸 Screenshot Checklist

If asking for help, provide:
1. Screenshot of "Network Access" page showing your entries
2. Screenshot showing "ACTIVE" status
3. Output of the test connection script

---

**Last Updated:** March 8, 2026  
**Quick Test:** Run `node test-atlas-connection.js` in `apps/api` folder
