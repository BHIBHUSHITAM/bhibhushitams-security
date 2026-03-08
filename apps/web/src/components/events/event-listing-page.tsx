'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Users, Video, DollarSign, Filter, X } from 'lucide-react';
import { getEvents, Event, EventFilters } from '@/lib/events/api';
import { GlassCard } from '@/components/landing/glass-card';
import Link from 'next/link';

export const EventListingPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState<EventFilters>({
    type: undefined,
    mode: undefined,
    status: 'upcoming',
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await getEvents(filters);
      setEvents(response.data);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    loadEvents();
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({ status: 'upcoming' });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getEventTypeColor = (type: string) => {
    const colors: any = {
      workshop: 'from-blue-500 to-cyan-500',
      hackathon: 'from-purple-500 to-pink-500',
      bootcamp: 'from-orange-500 to-red-500',
      webinar: 'from-green-500 to-teal-500',
    };
    return colors[type] || 'from-gray-500 to-gray-600';
  };

  const getModeIcon = (mode: string) => {
    if (mode === 'online') return <Video className="w-4 h-4" />;
    if (mode === 'offline') return <MapPin className="w-4 h-4" />;
    return <Video className="w-4 h-4" />; // hybrid
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
            Events & Programs
          </h1>
          <p className="text-xl text-gray-400">
            Join workshops, hackathons, bootcamps, and webinars
          </p>
        </motion.div>

        {/* Filter Button */}
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
          
          {(filters.type || filters.mode) && (
            <button
              onClick={clearFilters}
              className="text-gray-400 hover:text-white flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Clear Filters
            </button>
          )}
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
                  <label className="block text-sm font-medium mb-2">Event Type</label>
                  <select
                    value={filters.type || ''}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value as any || undefined })}
                    className="w-full px-4 py-2 bg-gray-900/50 border border-cyan-500/30 rounded-lg focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">All Types</option>
                    <option value="workshop">Workshop</option>
                    <option value="hackathon">Hackathon</option>
                    <option value="bootcamp">Bootcamp</option>
                    <option value="webinar">Webinar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Mode</label>
                  <select
                    value={filters.mode || ''}
                    onChange={(e) => setFilters({ ...filters, mode: e.target.value as any || undefined })}
                    className="w-full px-4 py-2 bg-gray-900/50 border border-cyan-500/30 rounded-lg focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">All Modes</option>
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <select
                    value={filters.status || ''}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value as any || undefined })}
                    className="w-full px-4 py-2 bg-gray-900/50 border border-cyan-500/30 rounded-lg focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">All Status</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
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

        {/* Events Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
            <p className="mt-4 text-gray-400">Loading events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-400">No events found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event, index) => (
              <motion.div
                key={event._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={`/events/${event.slug}`}>
                  <GlassCard className="h-full hover:border-cyan-500/50 transition-all cursor-pointer group">
                    {/* Event Type Badge */}
                    <div className={`h-2 rounded-t-lg bg-gradient-to-r ${getEventTypeColor(event.type)}`} />
                    
                    <div className="p-6">
                      {/* Type & Mode */}
                      <div className="flex items-center justify-between mb-4">
                        <span className="px-3 py-1 bg-gray-800 rounded-full text-xs font-semibold uppercase">
                          {event.type}
                        </span>
                        <div className="flex items-center gap-1 text-gray-400">
                          {getModeIcon(event.mode)}
                          <span className="text-xs capitalize">{event.mode}</span>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-bold mb-3 group-hover:text-cyan-400 transition-colors line-clamp-2">
                        {event.title}
                      </h3>

                      {/* Description */}
                      <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                        {event.description}
                      </p>

                      {/* Details */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Calendar className="w-4 h-4 text-cyan-500" />
                          <span>{formatDate(event.startDate)}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Clock className="w-4 h-4 text-cyan-500" />
                          <span>{event.duration}</span>
                        </div>

                        {event.venue && event.mode !== 'online' && (
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <MapPin className="w-4 h-4 text-cyan-500" />
                            <span className="line-clamp-1">{event.venue}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-gray-800">
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Users className="w-4 h-4 text-cyan-500" />
                            <span>{event.totalRegistrations}/{event.maxParticipants}</span>
                          </div>

                          {event.registrationFee > 0 && (
                            <div className="flex items-center gap-1 text-sm font-semibold text-green-400">
                              <DollarSign className="w-4 h-4" />
                              <span>{event.registrationFee}</span>
                            </div>
                          )}

                          {event.registrationFee === 0 && (
                            <span className="text-sm font-semibold text-green-400">FREE</span>
                          )}
                        </div>
                      </div>

                      {/* Topics Preview */}
                      {event.topics.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {event.topics.slice(0, 3).map((topic, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded text-xs text-cyan-300"
                            >
                              {topic}
                            </span>
                          ))}
                          {event.topics.length > 3 && (
                            <span className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-400">
                              +{event.topics.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </GlassCard>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
