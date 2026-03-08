# Certificate Verification & QR Code Testing Guide

## Overview
The certificate verification system includes QR code generation and verification features. This guide explains how to test the functionality.

## How It Works

### 1. QR Code Generation (Backend)
When a certificate is created via the API, the backend automatically:
- Generates a unique certificate ID (e.g., `CERT-ETH-2024-0001`)
- Creates a verification URL (e.g., `https://yourdomain.com/verify/CERT-ETH-2024-0001`)
- Generates a QR code image containing the verification URL
- Stores the QR code as a data URL in the database

### 2. QR Code Verification (Frontend)
Users can verify certificates in two ways:
- **Manual Entry**: Enter the certificate ID directly in the search field
- **QR Code Scanning**: Scan the QR code to automatically navigate to the verification page

## Testing the Certificate Verification Pages

### Test URLs
- **Verification Landing**: `http://localhost:3000/verify`
- **Sample Certificate**: `http://localhost:3000/verify/CERT-ETH-2024-0001`

### Manual Testing Steps

#### 1. Test the Landing Page
```bash
# Start the web app
cd apps/web
npm run dev
```

Then navigate to `http://localhost:3000/verify` and verify:
- [x] Search input is visible and functional
- [x] "Scan QR Code" button is visible
- [x] Benefits section displays correctly
- [x] FAQ section loads properly

#### 2. Test Certificate Verification
To test a certificate verification page:
1. Navigate to `http://localhost:3000/verify/CERT-ETH-2024-0001`
2. Verify the loading state appears
3. Check error handling for invalid certificate IDs

#### 3. Test with Backend API
```bash
# Start MongoDB (if using Docker)
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Set environment variables in apps/api/.env
MONGODB_URI=mongodb://localhost:27017/bhibhushitams
JWT_SECRET=your-secret-key
PORT=5000

# Start the API server
cd apps/api
npm run dev

# The API will run on http://localhost:5000
```

## Testing QR Code Functionality

### Option 1: Test with Real Backend

1. **Create a Test Certificate** (via API):
```bash
# Login as admin first to get auth token
curl -X POST http://localhost:5000/api/v1/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "admin@example.com",
    "password": "yourpassword"
  }'

# Create a certificate
curl -X POST http://localhost:5000/api/v1/certificates \\
  -H "Content-Type: application/json" \\
  -H "Cookie: token=YOUR_AUTH_TOKEN" \\
  -d '{
    "studentId": "STUDENT_ID_HERE",
    "type": "course",
    "courseId": "COURSE_ID_HERE",
    "title": "Ethical Hacking Basics",
    "metadata": {
      "grade": "A+",
      "score": 95,
      "duration": "8 weeks",
      "skills": ["Penetration Testing", "Network Security", "Vulnerability Assessment"]
    }
  }'
```

2. **Verify the Certificate**:
- Copy the `certificateId` from the response
- Navigate to `http://localhost:3000/verify/{certificateId}`
- The QR code should be displayed on the verification page

3. **Test QR Code Scanning**:
- Use a QR code scanner app on your phone
- Scan the displayed QR code
- It should navigate to the verification page

### Option 2: Test with Mock Data

Create a test page to display sample QR codes without needing the backend:

```typescript
// apps/web/src/app/test-qr/page.tsx
'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

export default function TestQRPage() {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  
  useEffect(() => {
    const generateQR = async () => {
      const testCertId = 'CERT-TEST-2024-0001';
      const verificationUrl = \`\${window.location.origin}/verify/\${testCertId}\`;
      
      try {
        const dataUrl = await QRCode.toDataURL(verificationUrl, {
          width: 300,
          margin: 2,
          color: {
            dark: '#0891b2', // Cyan-600
            light: '#ffffff'
          }
        });
        setQrCodeUrl(dataUrl);
      } catch (err) {
        console.error('Error generating QR code:', err);
      }
    };
    
    generateQR();
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">QR Code Test</h1>
      {qrCodeUrl && (
        <div className="bg-white p-4 rounded-lg inline-block">
          <img src={qrCodeUrl} alt="Test QR Code" />
        </div>
      )}
      <p className="mt-4 text-gray-400">
        Scan this QR code to test certificate verification
      </p>
    </div>
  );
}
```

To use this test page:
```bash
# Install qrcode package
npm install qrcode
npm install --save-dev @types/qrcode

# Run the app and visit http://localhost:3000/test-qr
```

## QR Code Features Checklist

### Backend (Already Implemented ✓)
- [x] QR code generation using `qrcode` npm package
- [x] QR code stored as data URL in certificate model
- [x] Verification URL format: `/verify/{certificateId}`
- [x] Public API endpoint for certificate verification
- [x] Certificate data includes QR code URL

### Frontend (Already Implemented ✓)
- [x] Verification landing page with search
- [x] Dynamic certificate verification page
- [x] QR code display on verification page
- [x] Certificate details display (name, course, date, etc.)
- [x] Certificate status (active/revoked)
- [x] PDF download functionality
- [x] Mobile-responsive design

### Additional Features to Test
- [ ] QR code scanner integration (requires additional library)
- [ ] Share certificate functionality
- [ ] Print certificate option
- [ ] Certificate expiration handling

## QR Code Scanner Integration (Optional)

To add QR code scanning capability:

```bash
# Install a QR scanner library
npm install react-qr-reader
```

Update the verify landing page to include scanning:
```typescript
import { QrReader } from 'react-qr-reader';

// Add to the verification landing page
const handleScan = (result: any) => {
  if (result) {
    const url = new URL(result.text);
    const certId = url.pathname.split('/').pop();
    router.push(\`/verify/\${certId}\`);
  }
};
```

## Environment Setup

### Required Environment Variables (.env.local)
```bash
# Web App (apps/web/.env.local)
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1

# API Server (apps/api/.env)
MONGODB_URI=mongodb://localhost:27017/bhibhushitams
JWT_SECRET=your-jwt-secret-key-change-in-production
PORT=5000
NODE_ENV=development
```

## Troubleshooting

### Issue: QR Code Not Displaying
**Solution**: Check that the certificate has a `qrCodeUrl` field populated

### Issue: Verification Page Shows "Not Found"
**Solution**: 
1. Verify the certificate ID is correct
2. Ensure the API is running
3. Check that the certificate exists in the database

### Issue: QR Code Scanner Not Working
**Solution**:
1. Ensure HTTPS is enabled (camera access requires secure context)
2. Grant camera permissions in browser
3. Check browser compatibility

## Production Deployment Considerations

1. **HTTPS Required**: QR code scanner requires HTTPS for camera access
2. **Domain Configuration**: Update verification URLs to use production domain
3. **CDN for QR Images**: Consider storing QR codes in CDN instead of data URLs
4. **Rate Limiting**: Add rate limiting to verification endpoint
5. **Caching**: Implement caching for frequently accessed certificates

## Next Steps

1. ✅ Certificate verification pages created
2. ✅ QR code display functionality implemented  
3. ✅ Build verified successfully
4. 🔄 Backend setup required for full testing
5. ⏭️ Optional: Add QR code scanner feature
6. ⏭️ Prepare deployment guide
