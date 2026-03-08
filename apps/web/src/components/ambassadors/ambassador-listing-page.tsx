'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Award, Users, TrendingUp, Filter, X, Linkedin, Github, Twitter, Instagram } from 'lucide-react';
import { getActiveAmbassadors, getAmbassadorLeaderboard, Ambassador } from '@/lib/ambassadors/api';
import { GlassCard } from '@/components/landing/glass-card';

type AmbassadorTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export const AmbassadorListingPage = () => {
  const [ambassadors, setAmbassadors] = useState<Ambassador[]>([]);
  const [leaderboard, setLeaderboard] = useState<Ambassador[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState({
    tier: '' as AmbassadorTier | '',
    college: '',
    department: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ambassadorsRes, leaderboardRes] = await Promise.all([
        getActiveAmbassadors(filters.tier ? { tier: filters.tier } : undefined),
        getAmbassadorLeaderboard(10),
      ]);
      setAmbassadors(ambassadorsRes.data || []);
      setLeaderboard(leaderboardRes.data || []);
    } catch (error) {
      console.error('Failed to load ambassadors:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = async () => {
    await loadData();
    setShowFilters(false);
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

  const getTierIcon = (tier: AmbassadorTier) => {
    const icons: Record<AmbassadorTier, typeof Trophy> = {
      bronze: Trophy,
      silver: Award,
      gold: Trophy,
      platinum: Trophy,
    };
    return icons[tier];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Campus Ambassadors
          </h1>
          <p className="text-xl text-gray-400">
            Meet our amazing student leaders and apply to join the program
          </p>
        </motion.div>

        {/* Leaderboard Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Top Ambassadors</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {leaderboard.map((ambassador, index) => {
              const TierIcon = getTierIcon(ambassador.tier);
              return (
                <motion.div
                  key={ambassador._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <GlassCard className="p-4 text-center h-full hover:border-cyan-500/50 transition-all">
                    <div className={`h-1 rounded-t-lg bg-gradient-to-r ${getTierColor(ambassador.tier)}`} />
                    
                    <div className="flex justify-center mb-3">
                      <div className={`bg-gradient-to-br ${getTierColor(ambassador.tier)} rounded-full p-3`}>
                        <TierIcon className="w-6 h-6" />
                      </div>
                    </div>

                    <h3 className="font-bold text-sm mb-1">{ambassador.studentId?.name}</h3>
                    <p className="text-xs text-gray-400 mb-3">{ambassador.college}</p>
                    
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center justify-center gap-1 text-cyan-400">
                        <TrendingUp className="w-3 h-3" />
                        <span>{ambassador.engagementScore}/100</span>
                      </div>
                      <div className="text-gray-400">
                        <span className="font-semibold text-white">{ambassador.eventsOrganized}</span> Events
                      </div>
                    </div>

                    <span className="inline-block mt-3 px-2 py-1 bg-gray-800 rounded text-xs uppercase font-semibold capitalize">
                      {ambassador.tier}
                    </span>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Filters */}
        <div className="flex justify-between items-center mb-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg font-semibold"
          >
            <Filter className="w-5 h-5" />
            Filters
          </motion.button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <GlassCard className="mb-8 p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Tier</label>
                  <select
                    value={filters.tier}
                    onChange={(e) => setFilters({ ...filters, tier: e.target.value as any })}
                    className="w-full px-4 py-2 bg-gray-900/50 border border-cyan-500/30 rounded-lg focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">All Tiers</option>
                    <option value="bronze">Bronze</option>
                    <option value="silver">Silver</option>
                    <option value="gold">Gold</option>
                    <option value="platinum">Platinum</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={applyFilters}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg font-semibold"
                >
                  Apply Filters
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowFilters(false)}
                  className="px-6 py-3 bg-gray-800 rounded-lg font-semibold"
                >
                  Cancel
                </motion.button>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Ambassadors Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
            <p className="mt-4 text-gray-400">Loading ambassadors...</p>
          </div>
        ) : ambassadors.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-400">No ambassadors found</p>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold mb-6">All Ambassadors</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ambassadors.map((ambassador, index) => {
                const TierIcon = getTierIcon(ambassador.tier);
                return (
                  <motion.div
                    key={ambassador._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <GlassCard className="p-6 h-full hover:border-cyan-500/50 transition-all">
                      {/* Tier Badge */}
                      <div className="flex items-center justify-between mb-4">
                        <span className={`px-4 py-2 bg-gradient-to-r ${getTierColor(ambassador.tier)} rounded-lg text-white font-semibold uppercase text-xs`}>
                          {ambassador.tier}
                        </span>
                        <div className={`bg-gradient-to-br ${getTierColor(ambassador.tier)} rounded-full p-2`}>
                          <TierIcon className="w-5 h-5" />
                        </div>
                      </div>

                      {/* Name & College */}
                      <h3 className="text-xl font-bold mb-2">{ambassador.studentId?.name}</h3>
                      <p className="text-gray-400 text-sm mb-2">{ambassador.college}</p>
                      <p className="text-gray-500 text-xs mb-4">{ambassador.department}</p>

                      {/* Bio */}
                      <p className="text-gray-300 text-sm mb-4 line-clamp-2">{ambassador.bio}</p>

                      {/* Metrics */}
                      <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-gray-900/50 rounded-lg">
                        <div className="text-center">
                          <div className="text-lg font-bold text-cyan-400">{ambassador.eventsOrganized}</div>
                          <div className="text-xs text-gray-400">Events</div>
                        </div>
                        <div className="text-center border-l border-r border-gray-700">
                          <div className="text-lg font-bold text-cyan-400">{ambassador.studentsRecruited}</div>
                          <div className="text-xs text-gray-400">Recruited</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-cyan-400">{ambassador.engagementScore}</div>
                          <div className="text-xs text-gray-400">Score</div>
                        </div>
                      </div>

                      {/* Social Links */}
                      {ambassador.socialLinks && (
                        <div className="flex gap-2 justify-center mb-4">
                          {ambassador.socialLinks.linkedin && (
                            <a href={ambassador.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-blue-600/20 text-blue-400 rounded hover:bg-blue-600/30">
                              <Linkedin className="w-4 h-4" />
                            </a>
                          )}
                          {ambassador.socialLinks.github && (
                            <a href={ambassador.socialLinks.github} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-600/20 text-gray-400 rounded hover:bg-gray-600/30">
                              <Github className="w-4 h-4" />
                            </a>
                          )}
                          {ambassador.socialLinks.twitter && (
                            <a href={ambassador.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="p-2 bg-sky-600/20 text-sky-400 rounded hover:bg-sky-600/30">
                              <Twitter className="w-4 h-4" />
                            </a>
                          )}
                          {ambassador.socialLinks.instagram && (
                            <a href={ambassador.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="p-2 bg-pink-600/20 text-pink-400 rounded hover:bg-pink-600/30">
                              <Instagram className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      )}

                      {/* Email */}
                      <a href={`mailto:${ambassador.email}`} className="block w-full text-center px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 text-sm font-medium">
                        Contact Ambassador
                      </a>
                    </GlassCard>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
