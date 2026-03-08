'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Star, TrendingUp, Zap } from 'lucide-react';
import { getAmbassadorLeaderboard, Ambassador } from '@/lib/ambassadors/api';
import { GlassCard } from '@/components/landing/glass-card';

type AmbassadorTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export const AmbassadorLeaderboard = () => {
  const [ambassadors, setAmbassadors] = useState<Ambassador[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayCount, setDisplayCount] = useState(10);

  useEffect(() => {
    loadLeaderboard();
  }, [displayCount]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await getAmbassadorLeaderboard(displayCount);
      setAmbassadors(response.data || []);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
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

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-slate-300" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" />;
    return <Star className="w-6 h-6 text-gray-400" />;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/50';
    if (rank === 2) return 'from-slate-400/20 to-slate-500/20 border-slate-400/50';
    if (rank === 3) return 'from-amber-600/20 to-amber-700/20 border-amber-600/50';
    return 'from-cyan-500/10 to-blue-500/10 border-cyan-500/30';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-block mb-4 p-3 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-full">
            <Trophy className="w-8 h-8 text-yellow-400" />
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            Ambassador Leaderboard
          </h1>
          <p className="text-xl text-gray-400">
            Top performers in our campus ambassador program
          </p>
        </motion.div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
            <p className="mt-4 text-gray-400">Loading leaderboard...</p>
          </div>
        ) : (
          <>
            {/* Leaderboard List */}
            <div className="space-y-4 mb-8">
              {ambassadors.map((ambassador, index) => (
                <motion.div
                  key={ambassador._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className={`bg-gradient-to-r ${getRankColor(index + 1)} border rounded-lg p-6 backdrop-blur-sm`}>
                    <div className="grid grid-cols-12 gap-4 items-center">
                      {/* Rank */}
                      <div className="col-span-1 flex justify-center">
                        <div className="flex flex-col items-center gap-1">
                          <div className="text-2xl font-bold">#{index + 1}</div>
                          <div>{getRankIcon(index + 1)}</div>
                        </div>
                      </div>

                      {/* Ambassador Info */}
                      <div className="col-span-4">
                        <h3 className="text-lg font-bold">{ambassador.studentId?.name}</h3>
                        <p className="text-gray-400 text-sm">{ambassador.college}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`px-3 py-1 bg-gradient-to-r ${getTierColor(ambassador.tier)} rounded text-white text-xs uppercase font-semibold`}>
                            {ambassador.tier}
                          </span>
                        </div>
                      </div>

                      {/* Engagement Score */}
                      <div className="col-span-2">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Zap className="w-5 h-5 text-cyan-400" />
                            <div className="text-2xl font-bold text-cyan-400">{ambassador.engagementScore}</div>
                          </div>
                          <p className="text-xs text-gray-400">Score</p>
                        </div>
                      </div>

                      {/* Events */}
                      <div className="col-span-2">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-400">{ambassador.eventsOrganized}</div>
                          <p className="text-xs text-gray-400">Events</p>
                        </div>
                      </div>

                      {/* Recruited */}
                      <div className="col-span-3">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <TrendingUp className="w-5 h-5 text-purple-400" />
                            <div className="text-2xl font-bold text-purple-400">{ambassador.studentsRecruited}</div>
                          </div>
                          <p className="text-xs text-gray-400">Recruited</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <GlassCard className="p-6">
                <h2 className="text-xl font-bold mb-6">Leaderboard Insights</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {ambassadors.length > 0 && (
                    <>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-yellow-400 mb-2">
                          {ambassadors[0].engagementScore}
                        </div>
                        <p className="text-gray-400 text-sm">Highest Score</p>
                        <p className="text-cyan-400 font-semibold mt-1">
                          {ambassadors[0].studentId?.name}
                        </p>
                      </div>

                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-400 mb-2">
                          {ambassadors.length > 0
                            ? Math.round(
                              ambassadors.reduce((sum, a) => sum + a.engagementScore, 0) /
                              ambassadors.length
                            )
                            : 0}
                        </div>
                        <p className="text-gray-400 text-sm">Average Score</p>
                        <p className="text-cyan-400 font-semibold mt-1">
                          {ambassadors.length} Ambassadors
                        </p>
                      </div>

                      <div className="text-center">
                        <div className="text-3xl font-bold text-purple-400 mb-2">
                          {ambassadors.reduce((sum, a) => sum + a.totalReach, 0)}
                        </div>
                        <p className="text-gray-400 text-sm">Total Reach</p>
                        <p className="text-cyan-400 font-semibold mt-1">
                          All Ambassadors
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </GlassCard>
            </motion.div>

            {/* Load More Button */}
            {displayCount < 100 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center mt-8"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setDisplayCount(prev => Math.min(prev + 10, 100))}
                  className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
                >
                  Load More Ambassadors
                </motion.button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
