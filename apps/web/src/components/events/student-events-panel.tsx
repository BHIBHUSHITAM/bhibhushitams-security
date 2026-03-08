'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { getStudentRegistrations, cancelRegistration, EventRegistration } from '@/lib/events/api';
import { GlassCard } from '@/components/landing/glass-card';
import Link from 'next/link';

export const StudentEventsPanel = () => {
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRegistrations();
  }, []);

  const loadRegistrations = async () => {
    try {
      setLoading(true);
      const response = await getStudentRegistrations();
      setRegistrations(response.data);
    } catch (error) {
      console.error('Failed to load registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRegistration = async (registrationId: string) => {
    if (!confirm('Are you sure you want to cancel this registration?')) return;

    try {
      await cancelRegistration(registrationId);
      alert('Registration cancelled successfully!');
      loadRegistrations();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to cancel registration');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'registered':
        return <CheckCircle className="w-5 h-5 text-blue-400" />;
      case 'attended':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'no-show':
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'registered':
        return 'bg-blue-500/20 text-blue-400';
      case 'attended':
        return 'bg-green-500/20 text-green-400';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400';
      case 'no-show':
        return 'bg-yellow-500/20 text-yellow-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
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

  // Stats
  const stats = {
    total: registrations.length,
    registered: registrations.filter((r) => r.status === 'registered').length,
    attended: registrations.filter((r) => r.status === 'attended').length,
    cancelled: registrations.filter((r) => r.status === 'cancelled').length,
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">My Event Registrations</h2>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <GlassCard className="p-6 text-center">
          <div className="text-3xl font-bold text-cyan-400 mb-2">{stats.total}</div>
          <div className="text-sm text-gray-400">Total Events</div>
        </GlassCard>

        <GlassCard className="p-6 text-center">
          <div className="text-3xl font-bold text-blue-400 mb-2">{stats.registered}</div>
          <div className="text-sm text-gray-400">Registered</div>
        </GlassCard>

        <GlassCard className="p-6 text-center">
          <div className="text-3xl font-bold text-green-400 mb-2">{stats.attended}</div>
          <div className="text-sm text-gray-400">Attended</div>
        </GlassCard>

        <GlassCard className="p-6 text-center">
          <div className="text-3xl font-bold text-red-400 mb-2">{stats.cancelled}</div>
          <div className="text-sm text-gray-400">Cancelled</div>
        </GlassCard>
      </div>

      {/* Registrations List */}
      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
          <p className="mt-4 text-gray-400">Loading your registrations...</p>
        </div>
      ) : registrations.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <p className="text-xl text-gray-400 mb-4">No event registrations yet</p>
          <Link href="/events">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg font-semibold"
            >
              Browse Events
            </motion.button>
          </Link>
        </GlassCard>
      ) : (
        <div className="grid gap-4">
          {registrations.map((registration, index) => {
            const event = registration.eventId as any;
            if (!event) return null;

            return (
              <motion.div
                key={registration._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Event Type Badge */}
                      <div className="flex items-center gap-3 mb-3">
                        <span
                          className={`px-3 py-1 bg-gradient-to-r ${getEventTypeColor(
                            event.type
                          )} rounded-lg text-xs font-semibold uppercase`}
                        >
                          {event.type}
                        </span>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(registration.status)}
                          <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${getStatusColor(registration.status)}`}>
                            {registration.status}
                          </span>
                        </div>
                      </div>

                      {/* Event Title */}
                      <Link href={`/events/${event.slug}`}>
                        <h3 className="text-xl font-bold mb-2 hover:text-cyan-400 transition-colors">
                          {event.title}
                        </h3>
                      </Link>

                      {/* Event Details */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Calendar className="w-4 h-4 text-cyan-500" />
                          <span>
                            {formatDate(event.startDate)} - {formatDate(event.endDate)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          {event.mode === 'online' ? (
                            <>
                              <Video className="w-4 h-4 text-cyan-500" />
                              <span>Online Event</span>
                            </>
                          ) : (
                            <>
                              <MapPin className="w-4 h-4 text-cyan-500" />
                              <span>{event.venue || 'Location TBA'}</span>
                            </>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Clock className="w-4 h-4 text-cyan-500" />
                          <span>Registered on {formatDate(registration.registrationDate)}</span>
                        </div>
                      </div>

                      {/* Meeting Link */}
                      {registration.status === 'registered' &&
                        event.mode !== 'offline' &&
                        event.meetingLink && (
                          <a
                            href={event.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 text-sm font-medium"
                          >
                            <Video className="w-4 h-4" />
                            Join Meeting
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}

                      {/* Notes */}
                      {registration.notes && (
                        <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Your Notes:</p>
                          <p className="text-sm text-gray-300">"{registration.notes}"</p>
                        </div>
                      )}

                      {/* Attendance Info */}
                      {registration.attendanceMarked && (
                        <div className="mt-4 flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-gray-400">
                            Attendance marked on {formatDate(registration.attendanceDate!)}
                          </span>
                        </div>
                      )}

                      {/* Certificate Info */}
                      {registration.certificateIssued && (
                        <div className="mt-2 flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-cyan-400" />
                          <span className="text-cyan-400 font-medium">Certificate Issued</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="ml-4">
                      {registration.status === 'registered' && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleCancelRegistration(registration._id)}
                          className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 text-sm font-medium"
                        >
                          Cancel Registration
                        </motion.button>
                      )}
                    </div>
                  </div>

                  {/* Payment Info */}
                  {registration.paymentAmount > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between text-sm">
                      <span className="text-gray-400">Payment Status:</span>
                      <span
                        className={`px-3 py-1 rounded-lg font-semibold ${
                          registration.paymentStatus === 'completed'
                            ? 'bg-green-500/20 text-green-400'
                            : registration.paymentStatus === 'pending'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {registration.paymentStatus} - ${registration.paymentAmount}
                      </span>
                    </div>
                  )}
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
