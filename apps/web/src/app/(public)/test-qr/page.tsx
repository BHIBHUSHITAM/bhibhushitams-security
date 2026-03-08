'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/landing/glass-card';
import { CheckCircle, Copy, QrCode as QrCodeIcon, ExternalLink } from 'lucide-react';

export default function TestQRPage() {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [certificateId] = useState('CERT-TEST-2024-0001');
  const [verificationUrl, setVerificationUrl] = useState('');
  const [copied, setCopied] = useState(false);
  
  useEffect(() => {
    const generateQR = async () => {
      const baseUrl = window.location.origin;
      const url = `${baseUrl}/verify/${certificateId}`;
      setVerificationUrl(url);
      
      try {
        const dataUrl = await QRCode.toDataURL(url, {
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
  }, [certificateId]);
  
  const handleCopyUrl = () => {
    navigator.clipboard.writeText(verificationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleOpenVerification = () => {
    window.open(verificationUrl, '_blank');
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-block mb-4 p-3 bg-cyan-500/20 rounded-full">
            <QrCodeIcon className="w-8 h-8 text-cyan-400" />
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            QR Code Test Page
          </h1>
          <p className="text-gray-400">
            Test certificate verification with QR codes
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* QR Code Display */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <GlassCard className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4 text-cyan-400">QR Code</h2>
              {qrCodeUrl ? (
                <div className="bg-white p-4 rounded-lg inline-block mb-4">
                  <img src={qrCodeUrl} alt="Test QR Code" className="w-64 h-64" />
                </div>
              ) : (
                <div className="w-64 h-64 bg-gray-800 rounded-lg animate-pulse mx-auto mb-4" />
              )}
              <p className="text-sm text-gray-400">
                Scan this QR code with your phone to test certificate verification
              </p>
            </GlassCard>
          </motion.div>
          
          {/* Certificate Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <GlassCard className="p-8">
              <h2 className="text-2xl font-bold mb-4 text-cyan-400">Test Certificate Details</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Certificate ID</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-gray-900/50 px-3 py-2 rounded border border-gray-700 text-cyan-400">
                      {certificateId}
                    </code>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Verification URL</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-gray-900/50 px-3 py-2 rounded border border-gray-700 text-xs text-cyan-400 overflow-auto">
                      {verificationUrl}
                    </code>
                    <button
                      onClick={handleCopyUrl}
                      className="p-2 bg-cyan-500/20 hover:bg-cyan-500/30 rounded transition-colors"
                      title="Copy URL"
                    >
                      {copied ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-cyan-400" />
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="pt-4 space-y-2">
                  <button
                    onClick={handleOpenVerification}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open Verification Page
                  </button>
                  
                  <a
                    href="/verify"
                    className="block w-full bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 text-center"
                  >
                    Go to Verification Landing
                  </a>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
        
        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <GlassCard className="p-8">
            <h2 className="text-2xl font-bold mb-4 text-cyan-400">Testing Instructions</h2>
            
            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="font-semibold text-white mb-2">1. Test QR Code Scanning</h3>
                <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                  <li>Open a QR code scanner app on your phone</li>
                  <li>Scan the QR code displayed above</li>
                  <li>You should be redirected to the certificate verification page</li>
                  <li>Note: The certificate won't exist in the database yet (will show "not found")</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-white mb-2">2. Test Manual Verification</h3>
                <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                  <li>Click "Open Verification Page" to test the verification UI</li>
                  <li>Or copy the certificate ID and paste it in the verification search</li>
                  <li>The page will attempt to verify the certificate with the API</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-white mb-2">3. Test with Real Backend</h3>
                <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                  <li>Start the API server: <code className="bg-gray-800 px-2 py-1 rounded text-cyan-400">npm run dev</code> in apps/api</li>
                  <li>Create a real certificate through the admin panel</li>
                  <li>Use that certificate's QR code for testing</li>
                </ul>
              </div>
              
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4 mt-4">
                <p className="text-sm text-cyan-400">
                  <strong>Note:</strong> This is a test page for demonstrating QR code generation. 
                  In production, QR codes are generated by the backend when certificates are issued.
                </p>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
