'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Video,
  DollarSign,
  CheckCircle,
  X,
  User,
  ExternalLink,
} from 'lucide-react';
import { getEventBySlug, registerForEvent, Event } from '@/lib/events/api';
import { GlassCard } from '@/components/landing/glass-card';
import { useRouter } from 'next/navigation';

interface EventDetailPageProps {
  slug: string;
}

export const EventDetailPage = ({ slug }: EventDetailPageProps) => {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [notes, setNotes] = useState('');
  const router = useRouter();

  useEffect(() => {
    loadEvent();
  }, [slug]);

  const loadEvent = async () => {
    try {
      setLoading(true);
      const response = await getEventBySlug(slug);
      setEvent(response.data);
    } catch (error) {
      console.error('Failed to load event:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!event) return;

    try {
      setRegistering(true);
      await registerForEvent(event._id, notes);
      alert('Successfully registered for event!');
      setShowRegisterModal(false);
      setNotes('');
      router.push('/student/events');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to register');
    } finally {
      setRegistering(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
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

  const isRegistrationOpen = () => {
    if (!event) return false;
    const now = new Date();
    const regStart = new Date(event.registrationStartDate);
    const regEnd = new Date(event.registrationEndDate);
    return now >= regStart && now <= regEnd && event.totalRegistrations < event.maxParticipants;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
          <p className="mt-4 text-gray-400">Loading event...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Event not found</h2>
          <p className="text-gray-400">The event you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className={`px-4 py-2 bg-gradient-to-r ${getEventTypeColor(event.type)} rounded-lg text-sm font-semibold uppercase`}>
              {event.type}
            </span>
            <span className="px-4 py-2 bg-gray-800 rounded-lg text-sm font-semibold capitalize">
              {event.mode}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            {event.title}
          </h1>

          <p className="text-xl text-gray-400">{event.description}</p>
        </motion.div>

        {/* Key Info Card */}
        <GlassCard className="mb-8 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <div className="flex items-center gap-2 text-cyan-400 mb-2">
                <Calendar className="w-5 h-5" />
                <span className="font-semibold">Date</span>
              </div>
              <p className="text-sm text-gray-300">{formatDate(event.startDate)}</p>
              <p className="text-xs text-gray-500">to {formatDate(event.endDate)}</p>
            </div>

            <div>
              <div className="flex items-center gap-2 text-cyan-400 mb-2">
                <Clock className="w-5 h-5" />
                <span className="font-semibold">Duration</span>
              </div>
              <p className="text-sm text-gray-300">{event.duration}</p>
            </div>

            <div>
              <div className="flex items-center gap-2 text-cyan-400 mb-2">
                {event.mode === 'online' ? <Video className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                <span className="font-semibold">Location</span>
              </div>
              <p className="text-sm text-gray-300">
                {event.mode === 'online' ? 'Online Event' : event.venue || 'TBA'}
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 text-cyan-400 mb-2">
                <Users className="w-5 h-5" />
                <span className="font-semibold">Participants</span>
              </div>
              <p className="text-sm text-gray-300">
                {event.totalRegistrations}/{event.maxParticipants} registered
              </p>
            </div>
          </div>

          {/* Registration CTA */}
          <div className="mt-6 pt-6 border-t border-gray-800 flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-cyan-400">
                {event.registrationFee === 0 ? 'FREE' : `$${event.registrationFee}`}
              </p>
              <p className="text-sm text-gray-400">Registration Fee</p>
            </div>

            {isRegistrationOpen() ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowRegisterModal(true)}
                className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg font-semibold"
              >
                Register Now
              </motion.button>
            ) : (
              <div className="text-right">
                <p className="text-sm font-semibold text-red-400">Registration Closed</p>
                <p className="text-xs text-gray-500">
                  {event.totalRegistrations >= event.maxParticipants ? 'Event Full' : 'Registration Period Ended'}
                </p>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Topics */}
        {event.topics.length > 0 && (
          <GlassCard className="mb-8 p-6">
            <h2 className="text-2xl font-bold mb-4">Topics Covered</h2>
            <div className="flex flex-wrap gap-2">
              {event.topics.map((topic, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-sm text-cyan-300"
                >
                  {topic}
                </span>
              ))}
            </div>
          </GlassCard>
        )}

        {/* Agenda */}
        {event.agenda.length > 0 && (
          <GlassCard className="mb-8 p-6">
            <h2 className="text-2xl font-bold mb-4">Agenda</h2>
            <ul className="space-y-3">
              {event.agenda.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-cyan-500 mt-0.5" />
                  <span className="text-gray-300">{item}</span>
                </li>
              ))}
            </ul>
          </GlassCard>
        )}

        {/* Prerequisites */}
        {event.prerequisites.length > 0 && (
          <GlassCard className="mb-8 p-6">
            <h2 className="text-2xl font-bold mb-4">Prerequisites</h2>
            <ul className="space-y-2 list-disc list-inside text-gray-300">
              {event.prerequisites.map((prereq, index) => (
                <li key={index}>{prereq}</li>
              ))}
            </ul>
          </GlassCard>
        )}

        {/* Benefits */}
        {event.benefits.length > 0 && (
          <GlassCard className="mb-8 p-6">
            <h2 className="text-2xl font-bold mb-4">What You'll Gain</h2>
            <ul className="space-y-3">
              {event.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <span className="text-gray-300">{benefit}</span>
                </li>
              ))}
            </ul>
          </GlassCard>
        )}

        {/* Instructors */}
        {event.instructors.length > 0 && (
          <GlassCard className="p-6">
            <h2 className="text-2xl font-bold mb-4">Instructors</h2>
            <div className="space-y-4">
              {event.instructors.map((instructor, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{instructor.name}</h3>
                    <p className="text-sm text-cyan-400">{instructor.designation}</p>
                    {instructor.bio && <p className="text-sm text-gray-400 mt-1">{instructor.bio}</p>}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        {/* Registration Modal */}
        <AnimatePresence>
          {showRegisterModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowRegisterModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gray-900 border border-cyan-500/30 rounded-lg p-8 max-w-md w-full"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold">Register for Event</h3>
                  <button
                    onClick={() => setShowRegisterModal(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="mb-6">
                  <p className="text-gray-300 mb-2">Event: {event.title}</p>
                  <p className="text-cyan-400 font-semibold">
                    Fee: {event.registrationFee === 0 ? 'FREE' : `$${event.registrationFee}`}
                  </p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">
                    Notes / Questions (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    maxLength={500}
                    placeholder="Any questions or special requirements?"
                    className="w-full px-4 py-2 bg-gray-800 border border-cyan-500/30 rounded-lg focus:outline-none focus:border-cyan-500 resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">{notes.length}/500</p>
                </div>

                <div className="flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleRegister}
                    disabled={registering}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg font-semibold disabled:opacity-50"
                  >
                    {registering ? 'Registering...' : 'Confirm Registration'}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowRegisterModal(false)}
                    className="px-6 py-3 bg-gray-800 rounded-lg font-semibold"
                  >
                    Cancel
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
