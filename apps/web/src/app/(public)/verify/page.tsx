'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Search, QrCode, CheckCircle, TrendingUp, Zap, ArrowRight } from 'lucide-react';
import { GlassCard } from '@/components/landing/glass-card';
import { useRouter } from 'next/navigation';

export default function CertificateVerificationLanding() {
  const [certificateId, setCertificateId] = useState('');
  const [searching, setSearching] = useState(false);
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certificateId.trim()) return;

    try {
      setSearching(true);
      router.push(`/verify/${certificateId}`);
    } catch (error) {
      console.error('Navigation error:', error);
      setSearching(false);
    }
  };

  const benefits = [
    {
      icon: Shield,
      title: 'Authentic Verification',
      description: 'Verify the authenticity of certificates issued by Bhibhushitams Security',
    },
    {
      icon: TrendingUp,
      title: 'Shareable Credentials',
      description: 'Share your verified certificates with employers and educational institutions',
    },
    {
      icon: Zap,
      title: 'Instant QR Validation',
      description: 'Scan QR codes to instantly verify certificate authenticity',
    },
    {
      icon: CheckCircle,
      title: 'Blockchain Backed',
      description: 'All certificates are recorded for permanent verification records',
    },
  ];

  const steps = [
    {
      number: '1',
      title: 'Enter Certificate ID',
      description: 'Provide the certificate ID or scan the QR code',
    },
    {
      number: '2',
      title: 'Verify Information',
      description: 'Review the certificate holder and course details',
    },
    {
      number: '3',
      title: 'Share or Download',
      description: 'Share the certification or download for your records',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
      {/* Header Section */}
      <div className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-[10%] top-20 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
          <div className="absolute right-[8%] top-52 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto text-center mb-12"
        >
          <div className="inline-block mb-4 p-3 bg-cyan-500/20 rounded-full">
            <Shield className="w-8 h-8 text-cyan-400" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Verify Your Certificates
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Instantly verify the authenticity of your cybersecurity certificates issued by Bhibhushitams Security
          </p>
        </motion.div>

        {/* Search Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-2xl mx-auto mb-12"
        >
          <GlassCard className="p-8">
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-3">Enter Certificate ID</label>
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={certificateId}
                      onChange={(e) => setCertificateId(e.target.value)}
                      placeholder="e.g., CERT-ETH-2024-0001"
                      className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-cyan-500/30 rounded-lg focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={searching || !certificateId.trim()}
                    className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg font-semibold disabled:opacity-50 flex items-center gap-2"
                  >
                    {searching ? 'Verifying...' : 'Verify'}
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm text-gray-400">
                <div className="flex-1 h-px bg-gray-700"></div>
                <span>or</span>
                <div className="flex-1 h-px bg-gray-700"></div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg hover:border-cyan-500/50 transition-colors flex items-center justify-center gap-2 text-gray-300"
              >
                <QrCode className="w-5 h-5" />
                Scan QR Code
              </motion.button>
            </form>
          </GlassCard>
        </motion.div>

        {/* Benefits Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-6xl mx-auto mb-12"
        >
          <h2 className="text-3xl font-bold text-center mb-8">Why Verify Your Certificates?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                >
                  <GlassCard className="p-6 h-full hover:border-cyan-500/50 transition-all">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-cyan-500/20 rounded-lg">
                        <IconComponent className="w-5 h-5 text-cyan-400" />
                      </div>
                    </div>
                    <h3 className="font-semibold mb-2">{benefit.title}</h3>
                    <p className="text-sm text-gray-400">{benefit.description}</p>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Steps Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <GlassCard className="p-6 text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full mx-auto mb-4">
                      <span className="text-white font-bold text-lg">{step.number}</span>
                    </div>
                    <h3 className="font-semibold mb-2 text-lg">{step.title}</h3>
                    <p className="text-gray-400 text-sm">{step.description}</p>
                  </GlassCard>
                </motion.div>

                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="w-8 h-8 text-cyan-500/50" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            {
              q: 'Is my certificate secure?',
              a: 'Yes! All certificates are cryptographically signed and verifiable. Each certificate has a unique QR code that links to our verification system.',
            },
            {
              q: 'How long are certificates valid?',
              a: 'Most certificates are valid for 3 years from the date of issue. The expiration date is clearly marked on your certificate.',
            },
            {
              q: 'Can I share my certificate on LinkedIn?',
              a: 'Absolutely! You can share the verification link or download a PDF copy to add to your LinkedIn profile.',
            },
            {
              q: 'What if I lost my certificate ID?',
              a: 'Visit your student dashboard - all your issued certificates are stored there with their IDs and verification links.',
            },
          ].map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.05 }}
            >
              <GlassCard className="p-6">
                <h3 className="font-semibold mb-2 text-lg">{faq.q}</h3>
                <p className="text-gray-400">{faq.a}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
