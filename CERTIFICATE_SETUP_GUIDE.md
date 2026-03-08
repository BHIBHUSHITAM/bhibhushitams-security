# Certificate Setup & Testing Guide

## Prerequisites
- Admin account (see below to create one)
- At least one student account

---

## Step 1: Create Admin Account

### Option A: Signup then Upgrade in MongoDB Atlas
1. Go to `https://bhibhushitams-security.vercel.app/signup`
2. Create account with email: `singhbhibhushitam@gmail.com` (or your email)
3. Open MongoDB Atlas → `bhibhushitams` database → `users` collection
4. Find your user document
5. Edit the document and change:
   ```json
   { "role": "student" }
   ```
   to:
   ```json
   { "role": "admin" }
   ```
6. Save changes

### Option B: Direct MongoDB Insert
Run this in MongoDB Atlas → Database → Browse Collections → Open Shell:
```javascript
db.users.updateOne(
  { email: "singhbhibhushitam@gmail.com" },
  { $set: { role: "admin" } }
)
```

---

## Step 2: Add Required Environment Variables in Render

Go to **Render Dashboard** → `bhibhushitams-api` → **Environment** tab

Add these variables if missing:

| Variable | Value |
|----------|-------|
| `FRONTEND_URL` | `https://bhibhushitams-security.vercel.app` |
| `TRUST_PROXY` | `1` |

Click **Save Changes** (Render will redeploy automatically).

---

## Step 3: Create Your First Certificate

1. Login as admin: `https://bhibhushitams-security.vercel.app/login`

2. Go to **Admin Dashboard** → **Certificates** tab:
   ```
   https://bhibhushitams-security.vercel.app/admin/certificates
   ```

3. Fill in the **Issue New Certificate** form:
   - **Student**: Select from dropdown
   - **Type**: Choose `course`, `internship`, or `event`
   - **Course/Internship**: Select if applicable
   - **Title**: E.g., "Web Application Security Course"
   - **Description**: Optional details
   - **Grade**: E.g., "A" or "Pass"
   - **Score**: E.g., 95
   - **Duration**: E.g., "8 weeks"
   - **Skills**: Add skills like "Penetration Testing"

4. Click **Issue Certificate**

5. Wait 5-10 seconds (PDF generation takes time)

6. Certificate will appear in the list below with:
   - Certificate ID (e.g., `CERT-20260308-ABCD1234`)
   - QR Code (visible in the table)
   - Download PDF button

---

## Step 4: Verify Certificate

### Method 1: Direct URL
Copy the certificate ID and visit:
```
https://bhibhushitams-security.vercel.app/verify/CERT-20260308-ABCD1234
```
(Replace with your actual certificate ID)

### Method 2: Scan QR Code
1. Open the certificate list in admin panel
2. Use your phone camera or QR scanner app
3. Scan the QR code
4. It will open the verification page

### Method 3: Public Verification Page
1. Go to: `https://bhibhushitams-security.vercel.app/verify`
2. Enter certificate ID manually
3. Click verify

---

## Step 5: Download Certificate PDF

**From Admin Panel:**
- Click the "Download" button next to any certificate

**From Verification Page:**
- Visit the verification URL
- Click "Download Certificate PDF" button

---

## Troubleshooting

### Certificate Not Found Error

**Symptom:** `Certificate not found` when accessing verification URL

**Causes & Fixes:**

1. **Incorrect Certificate ID Format**
   - ❌ Wrong: `CERT-20260308UXGP8OOK` (missing dash)
   - ✅ Correct: `CERT-20260308-UXGP8OOK` (with dash after date)

2. **Certificate Doesn't Exist**
   - Create certificate first via admin panel
   - Check MongoDB Atlas → `certificates` collection to verify it exists

3. **Backend Not Deployed**
   - Ensure Render deployed successfully
   - Check: `https://bhibhushitams-api.onrender.com/api/v1/health`

### QR Code Not Showing

**Symptom:** QR code appears broken or doesn't display

**Causes & Fixes:**

1. **Missing FRONTEND_URL Environment Variable**
   - Add in Render: `FRONTEND_URL=https://bhibhushitams-security.vercel.app`
   - Redeploy backend

2. **QR Code Not Generated**
   - Check certificate document in MongoDB has `qrCodeUrl` field
   - Recreate the certificate if field is missing

3. **CORS Issues**
   - Verify `CORS_ORIGIN` in Render matches your Vercel URL exactly
   - No trailing slash

### PDF Download Fails

**Symptom:** Download button doesn't work or PDF is corrupted

**Causes & Fixes:**

1. **PDF Generation Failed**
   - Check Render logs for errors during certificate creation
   - Recreate the certificate

2. **Browser Blocking**
   - Try different browser
   - Check browser console for errors (F12)

---

## Testing Checklist

- [ ] Admin account created and working
- [ ] Can access `/admin/certificates` page
- [ ] Environment variables added to Render (`FRONTEND_URL`, `TRUST_PROXY`)
- [ ] Backend redeployed successfully
- [ ] Created at least one test certificate
- [ ] Certificate appears in admin list with QR code
- [ ] Can verify certificate via `/verify/CERT-xxx-xxx` URL
- [ ] QR code displays correctly on verification page
- [ ] Can scan QR code with phone and opens verification page
- [ ] Can download PDF from admin panel
- [ ] Can download PDF from verification page
- [ ] PDF opens correctly with all details

---

## Sample Certificate Data

Use this for testing:

```json
{
  "studentId": "<student-object-id-from-db>",
  "type": "course",
  "courseId": "<course-object-id-from-db>",
  "title": "Web Application Security Fundamentals",
  "description": "Completed comprehensive training in web security practices",
  "metadata": {
    "completionDate": "2026-03-08",
    "grade": "A",
    "score": 95,
    "duration": "8 weeks",
    "skills": [
      "Penetration Testing",
      "SQL Injection Prevention",
      "XSS Mitigation",
      "OWASP Top 10",
      "Secure Coding Practices"
    ]
  }
}
```

---

## Production URLs

**Frontend:** https://bhibhushitams-security.vercel.app  
**Backend API:** https://bhibhushitams-api.onrender.com  
**Health Check:** https://bhibhushitams-api.onrender.com/api/v1/health  
**Verification:** https://bhibhushitams-security.vercel.app/verify/[CERT-ID]

---

**Need help?** Check:
- MongoDB Atlas for database records
- Render logs for backend errors
- Browser DevTools console (F12) for frontend errors
