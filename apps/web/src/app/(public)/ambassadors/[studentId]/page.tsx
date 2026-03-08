'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, ArrowLeft, Mail, Linkedin, Github, Twitter, Instagram, TrendingUp, Calendar, Users, Target, AlertCircle } from 'lucide-react';
import { getAmbassadorProfile, Ambassador } from '@/lib/ambassadors/api';
import { GlassCard } from '@/components/landing/glass-card';
import Link from 'next/link';

type AmbassadorTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export default function AmbassadorDetailPage({ params }: { params: { studentId: string } }) {
  const [ambassador, setAmbassador] = useState<Ambassador | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAmbassador();
  }, [params.studentId]);

  const loadAmbassador = async () => {
    try {
      setLoading(true);
      const response = await getAmbassadorProfile(params.studentId);
      if (response.success) {
        setAmbassador(response.data || null);
      } else {
        setError("Ambassador not found");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load ambassador profile");
    } finally {
      setLoading(false);
    }
  };

  const getTierColor = (tier: AmbassadorTier) => {
    const colors: Record<AmbassadorTier, string> = {
      bronze: 'from-amber-600 to-amber-500',
      silver: 'from-slate-400 to-slate-300',
      gold: 'from-yellow-500 to-yellow-400',
      platinum: 'from-cyan-400 to-blue-500',
    };
    return colors[tier];
  };

  const getTierBadgeColor = (tier: AmbassadorTier) => {
    const colors: Record<AmbassadorTier, string> = {
      bronze: 'bg-amber-600/20 text-amber-400 border-amber-600/50',
      silver: 'bg-slate-400/20 text-slate-300 border-slate-400/50',
      gold: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
      platinum: 'bg-cyan-400/20 text-cyan-400 border-cyan-400/50',
    };
    return colors[tier];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
          <p className="mt-4 text-gray-400">Loading ambassador profile...</p>
        </div>
      </div>
    );
  }

  if (error || !ambassador) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/ambassadors">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 mb-8 px-6 py-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Ambassadors
            </motion.button>
          </Link>

          <GlassCard className="p-8 text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-red-400 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Ambassador Not Found</h2>
            <p className="text-gray-400">{error || "The ambassador profile could not be found."}</p>
          </GlassCard>
        </div>
      </div>
    );
  }

  const approvalDate = new Date(ambassador.approvalDate).toLocaleDateString();
  const lastActivityDate = new Date(ambassador.lastActivityDate).toLocaleDateString();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link href="/ambassadors">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 mb-8 px-6 py-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Ambassadors
          </motion.button>
        </Link>

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassCard className={`p-8 bg-gradient-to-br ${getTierColor(ambassador.tier)} opacity-10 mb-8`}>
            <div className="flex items-center gap-6 mb-6">
              <div className={`bg-gradient-to-br ${getTierColor(ambassador.tier)} rounded-full p-4`}>
                <Trophy className="w-8 h-8" />
              </div>

              <div>
                <h1 className="text-3xl font-bold mb-2">{ambassador.studentId?.name}</h1>
                <p className="text-gray-300 text-lg">{ambassador.college}</p>
                <p className="text-gray-400">{ambassador.department}</p>
              </div>

              <div className={`ml-auto text-right px-6 py-4 rounded-lg border ${getTierBadgeColor(ambassador.tier)}`}>
                <div className="text-2xl font-bold uppercase">{ambassador.tier}</div>
                <div className="text-xs text-gray-400 mt-1">Tier</div>
              </div>
            </div>

            {ambassador.bio && (
              <p className="text-gray-300 text-lg">{ambassador.bio}</p>
            )}
          </GlassCard>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          <GlassCard className="p-6 hover:border-cyan-500/50 transition-all">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400 text-sm">Engagement Score</p>
              <TrendingUp className="w-5 h-5 text-cyan-400" />
            </div>
            <p className="text-3xl font-bold text-cyan-400">{ambassador.engagementScore}</p>
            <p className="text-xs text-gray-500 mt-1">out of 100</p>
          </GlassCard>

          <GlassCard className="p-6 hover:border-cyan-500/50 transition-all">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400 text-sm">Events Organized</p>
              <Calendar className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-green-400">{ambassador.eventsOrganized}</p>
          </GlassCard>

          <GlassCard className="p-6 hover:border-cyan-500/50 transition-all">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400 text-sm">Students Recruited</p>
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-3xl font-bold text-purple-400">{ambassador.studentsRecruited}</p>
          </GlassCard>

          <GlassCard className="p-6 hover:border-cyan-500/50 transition-all">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400 text-sm">Total Reach</p>
              <Target className="w-5 h-5 text-orange-400" />
            </div>
            <p className="text-3xl font-bold text-orange-400">{ambassador.totalReach}</p>
          </GlassCard>
        </motion.div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GlassCard className="p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Timeline</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-px bg-cyan-500/30"></div>
                <div>
                  <p className="text-gray-400 text-sm">Approved as Ambassador</p>
                  <p className="text-lg font-semibold">{approvalDate}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-px bg-cyan-500/30"></div>
                <div>
                  <p className="text-gray-400 text-sm">Last Activity</p>
                  <p className="text-lg font-semibold">{lastActivityDate}</p>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Connect Section */}
        {(ambassador.email || ambassador.phone || ambassador.socialLinks) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <GlassCard className="p-6">
              <h2 className="text-xl font-bold mb-4">Connect with Ambassador</h2>

              <div className="space-y-4">
                {ambassador.email && (
                  <a
                    href={`mailto:${ambassador.email}`}
                    className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg hover:bg-gray-900 transition-colors"
                  >
                    <Mail className="w-5 h-5 text-cyan-400" />
                    <div>
                      <p className="text-gray-400 text-sm">Email</p>
                      <p className="font-semibold">{ambassador.email}</p>
                    </div>
                  </a>
                )}

                {ambassador.phone && (
                  <a
                    href={`tel:${ambassador.phone}`}
                    className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg hover:bg-gray-900 transition-colors"
                  >
                    <Mail className="w-5 h-5 text-cyan-400" />
                    <div>
                      <p className="text-gray-400 text-sm">Phone</p>
                      <p className="font-semibold">{ambassador.phone}</p>
                    </div>
                  </a>
                )}

                {ambassador.socialLinks && (
                  <div className="flex flex-wrap gap-3 pt-4">
                    {ambassador.socialLinks.linkedin && (
                      <a
                        href={ambassador.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 font-semibold"
                      >
                        <Linkedin className="w-5 h-5" />
                        LinkedIn
                      </a>
                    )}
                    {ambassador.socialLinks.github && (
                      <a
                        href={ambassador.socialLinks.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-gray-600/20 text-gray-400 rounded-lg hover:bg-gray-600/30 font-semibold"
                      >
                        <Github className="w-5 h-5" />
                        GitHub
                      </a>
                    )}
                    {ambassador.socialLinks.twitter && (
                      <a
                        href={ambassador.socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-sky-600/20 text-sky-400 rounded-lg hover:bg-sky-600/30 font-semibold"
                      >
                        <Twitter className="w-5 h-5" />
                        Twitter
                      </a>
                    )}
                    {ambassador.socialLinks.instagram && (
                      <a
                        href={ambassador.socialLinks.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-pink-600/20 text-pink-400 rounded-lg hover:bg-pink-600/30 font-semibold"
                      >
                        <Instagram className="w-5 h-5" />
                        Instagram
                      </a>
                    )}
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.div>
        )}
      </div>
    </div>
  );
}
