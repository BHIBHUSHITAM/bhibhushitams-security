'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Edit,
  Trash2,
  Users,
  X,
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
} from 'lucide-react';
import {
  getAdminEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventRegistrations,
  markAttendance,
  Event,
  CreateEventInput,
  EventRegistration,
} from '@/lib/events/api';
import { GlassCard } from '@/components/landing/glass-card';

export const AdminEventsPanel = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRegistrationsModal, setShowRegistrationsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);

  const [formData, setFormData] = useState<CreateEventInput>({
    title: '',
    description: '',
    type: 'workshop',
    mode: 'online',
    startDate: '',
    endDate: '',
    duration: '',
    venue: '',
    meetingLink: '',
    maxParticipants: 50,
    registrationStartDate: '',
    registrationEndDate: '',
    registrationFee: 0,
    agenda: [''],
    topics: [''],
    prerequisites: [''],
    benefits: [''],
    instructors: [{ name: '', designation: '', bio: '' }],
    bannerUrl: '',
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await getAdminEvents();
      setEvents(response.data);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async () => {
    try {
      await createEvent(formData);
      alert('Event created successfully!');
      setShowCreateModal(false);
      resetForm();
      loadEvents();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create event');
    }
  };

  const handleUpdateEvent = async () => {
    if (!selectedEvent) return;

    try {
      await updateEvent(selectedEvent._id, formData);
      alert('Event updated successfully!');
      setShowEditModal(false);
      setSelectedEvent(null);
      resetForm();
      loadEvents();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update event');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      await deleteEvent(eventId);
      alert('Event deleted successfully!');
      loadEvents();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete event');
    }
  };

  const loadRegistrations = async (eventId: string) => {
    try {
      const response = await getEventRegistrations(eventId);
      setRegistrations(response.data);
      setShowRegistrationsModal(true);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to load registrations');
    }
  };

  const handleMarkAttendance = async (registrationId: string, attended: boolean) => {
    try {
      await markAttendance(registrationId, attended);
      alert('Attendance marked successfully!');
      if (selectedEvent) {
        loadRegistrations(selectedEvent._id);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to mark attendance');
    }
  };

  const openEditModal = (event: Event) => {
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      type: event.type,
      mode: event.mode,
      startDate: new Date(event.startDate).toISOString().slice(0, 16),
      endDate: new Date(event.endDate).toISOString().slice(0, 16),
      duration: event.duration,
      venue: event.venue || '',
      meetingLink: event.meetingLink || '',
      maxParticipants: event.maxParticipants,
      registrationStartDate: new Date(event.registrationStartDate).toISOString().slice(0, 16),
      registrationEndDate: new Date(event.registrationEndDate).toISOString().slice(0, 16),
      registrationFee: event.registrationFee,
      agenda: event.agenda.length > 0 ? event.agenda : [''],
      topics: event.topics.length > 0 ? event.topics : [''],
      prerequisites: event.prerequisites.length > 0 ? event.prerequisites : [''],
      benefits: event.benefits.length > 0 ? event.benefits : [''],
      instructors: event.instructors.length > 0 ? event.instructors : [{ name: '', designation: '', bio: '' }],
      bannerUrl: event.bannerUrl || '',
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'workshop',
      mode: 'online',
      startDate: '',
      endDate: '',
      duration: '',
      venue: '',
      meetingLink: '',
      maxParticipants: 50,
      registrationStartDate: '',
      registrationEndDate: '',
      registrationFee: 0,
      agenda: [''],
      topics: [''],
      prerequisites: [''],
      benefits: [''],
      instructors: [{ name: '', designation: '', bio: '' }],
      bannerUrl: '',
    });
  };

  const addArrayItem = (field: keyof CreateEventInput) => {
    if (field === 'instructors') {
      setFormData({
        ...formData,
        instructors: [...formData.instructors, { name: '', designation: '', bio: '' }],
      });
    } else {
      setFormData({
        ...formData,
        [field]: [...(formData[field] as string[]), ''],
      });
    }
  };

  const removeArrayItem = (field: keyof CreateEventInput, index: number) => {
    if (field === 'instructors') {
      setFormData({
        ...formData,
        instructors: formData.instructors.filter((_, i) => i !== index),
      });
    } else {
      setFormData({
        ...formData,
        [field]: (formData[field] as string[]).filter((_, i) => i !== index),
      });
    }
  };

  const updateArrayItem = (field: keyof CreateEventInput, index: number, value: any) => {
    if (field === 'instructors') {
      const updated = [...formData.instructors];
      updated[index] = value;
      setFormData({ ...formData, instructors: updated });
    } else {
      const updated = [...(formData[field] as string[])];
      updated[index] = value;
      setFormData({ ...formData, [field]: updated });
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const EventForm = () => (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      {/* Basic Info */}
      <div>
        <label className="block text-sm font-medium mb-2">Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-2 bg-gray-800 border border-cyan-500/30 rounded-lg focus:outline-none focus:border-cyan-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className="w-full px-4 py-2 bg-gray-800 border border-cyan-500/30 rounded-lg focus:outline-none focus:border-cyan-500 resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Type</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
            className="w-full px-4 py-2 bg-gray-800 border border-cyan-500/30 rounded-lg focus:outline-none focus:border-cyan-500"
          >
            <option value="workshop">Workshop</option>
            <option value="hackathon">Hackathon</option>
            <option value="bootcamp">Bootcamp</option>
            <option value="webinar">Webinar</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Mode</label>
          <select
            value={formData.mode}
            onChange={(e) => setFormData({ ...formData, mode: e.target.value as any })}
            className="w-full px-4 py-2 bg-gray-800 border border-cyan-500/30 rounded-lg focus:outline-none focus:border-cyan-500"
          >
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Start Date & Time</label>
          <input
            type="datetime-local"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            className="w-full px-4 py-2 bg-gray-800 border border-cyan-500/30 rounded-lg focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">End Date & Time</label>
          <input
            type="datetime-local"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            className="w-full px-4 py-2 bg-gray-800 border border-cyan-500/30 rounded-lg focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Duration (e.g., "3 days", "2 hours")</label>
        <input
          type="text"
          value={formData.duration}
          onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
          className="w-full px-4 py-2 bg-gray-800 border border-cyan-500/30 rounded-lg focus:outline-none focus:border-cyan-500"
        />
      </div>

      {/* Location */}
      {formData.mode !== 'online' && (
        <div>
          <label className="block text-sm font-medium mb-2">Venue</label>
          <input
            type="text"
            value={formData.venue}
            onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
            className="w-full px-4 py-2 bg-gray-800 border border-cyan-500/30 rounded-lg focus:outline-none focus:border-cyan-500"
          />
        </div>
      )}

      {formData.mode !== 'offline' && (
        <div>
          <label className="block text-sm font-medium mb-2">Meeting Link</label>
          <input
            type="url"
            value={formData.meetingLink}
            onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
            className="w-full px-4 py-2 bg-gray-800 border border-cyan-500/30 rounded-lg focus:outline-none focus:border-cyan-500"
          />
        </div>
      )}

      {/* Registration */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Max Participants</label>
          <input
            type="number"
            value={formData.maxParticipants}
            onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) })}
            className="w-full px-4 py-2 bg-gray-800 border border-cyan-500/30 rounded-lg focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Registration Fee ($)</label>
          <input
            type="number"
            value={formData.registrationFee}
            onChange={(e) => setFormData({ ...formData, registrationFee: parseFloat(e.target.value) })}
            className="w-full px-4 py-2 bg-gray-800 border border-cyan-500/30 rounded-lg focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Registration Start</label>
          <input
            type="datetime-local"
            value={formData.registrationStartDate}
            onChange={(e) => setFormData({ ...formData, registrationStartDate: e.target.value })}
            className="w-full px-4 py-2 bg-gray-800 border border-cyan-500/30 rounded-lg focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Registration End</label>
          <input
            type="datetime-local"
            value={formData.registrationEndDate}
            onChange={(e) => setFormData({ ...formData, registrationEndDate: e.target.value })}
            className="w-full px-4 py-2 bg-gray-800 border border-cyan-500/30 rounded-lg focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Dynamic Arrays */}
      <div>
        <label className="block text-sm font-medium mb-2">Topics</label>
        {formData.topics.map((topic, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              value={topic}
              onChange={(e) => updateArrayItem('topics', index, e.target.value)}
              className="flex-1 px-4 py-2 bg-gray-800 border border-cyan-500/30 rounded-lg focus:outline-none focus:border-cyan-500"
            />
            <button
              onClick={() => removeArrayItem('topics', index)}
              className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button
          onClick={() => addArrayItem('topics')}
          className="text-sm text-cyan-400 hover:text-cyan-300"
        >
          + Add Topic
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Agenda</label>
        {formData.agenda.map((item, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              value={item}
              onChange={(e) => updateArrayItem('agenda', index, e.target.value)}
              className="flex-1 px-4 py-2 bg-gray-800 border border-cyan-500/30 rounded-lg focus:outline-none focus:border-cyan-500"
            />
            <button
              onClick={() => removeArrayItem('agenda', index)}
              className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button
          onClick={() => addArrayItem('agenda')}
          className="text-sm text-cyan-400 hover:text-cyan-300"
        >
          + Add Agenda Item
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Instructors</label>
        {formData.instructors.map((instructor, index) => (
          <div key={index} className="mb-4 p-4 bg-gray-800/50 rounded-lg">
            <div className="space-y-2">
              <input
                type="text"
                value={instructor.name}
                onChange={(e) =>
                  updateArrayItem('instructors', index, { ...instructor, name: e.target.value })
                }
                placeholder="Name"
                className="w-full px-4 py-2 bg-gray-800 border border-cyan-500/30 rounded-lg focus:outline-none focus:border-cyan-500"
              />
              <input
                type="text"
                value={instructor.designation}
                onChange={(e) =>
                  updateArrayItem('instructors', index, { ...instructor, designation: e.target.value })
                }
                placeholder="Designation"
                className="w-full px-4 py-2 bg-gray-800 border border-cyan-500/30 rounded-lg focus:outline-none focus:border-cyan-500"
              />
              <textarea
                value={instructor.bio}
                onChange={(e) =>
                  updateArrayItem('instructors', index, { ...instructor, bio: e.target.value })
                }
                placeholder="Bio (optional)"
                rows={2}
                className="w-full px-4 py-2 bg-gray-800 border border-cyan-500/30 rounded-lg focus:outline-none focus:border-cyan-500 resize-none"
              />
              <button
                onClick={() => removeArrayItem('instructors', index)}
                className="text-sm text-red-400 hover:text-red-300"
              >
                Remove Instructor
              </button>
            </div>
          </div>
        ))}
        <button
          onClick={() => addArrayItem('instructors')}
          className="text-sm text-cyan-400 hover:text-cyan-300"
        >
          + Add Instructor
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Manage Events</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg font-semibold"
        >
          <Plus className="w-5 h-5" />
          Create Event
        </motion.button>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
        </div>
      ) : events.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <p className="text-xl text-gray-400">No events created yet</p>
        </GlassCard>
      ) : (
        <div className="grid gap-4">
          {events.map((event) => (
            <GlassCard key={event._id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-gray-800 rounded-full text-xs uppercase font-semibold">
                      {event.type}
                    </span>
                    <span className="px-3 py-1 bg-gray-800 rounded-full text-xs capitalize">
                      {event.mode}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      event.status === 'upcoming' ? 'bg-blue-500/20 text-blue-400' :
                      event.status === 'ongoing' ? 'bg-green-500/20 text-green-400' :
                      event.status === 'completed' ? 'bg-gray-500/20 text-gray-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {event.status}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{event.description}</p>
                  
                  <div className="flex items-center gap-6 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-cyan-500" />
                      {formatDate(event.startDate)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-cyan-500" />
                      {event.totalRegistrations}/{event.maxParticipants}
                    </div>
                    {event.registrationFee > 0 && (
                      <div className="text-green-400 font-semibold">
                        ${event.registrationFee}
                      </div>
                    )}
                    {event.registrationFee === 0 && (
                      <div className="text-green-400 font-semibold">FREE</div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => loadRegistrations(event._id)}
                    className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30"
                    title="View Registrations"
                  >
                    <Users className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => openEditModal(event)}
                    className="p-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30"
                  >
                    <Edit className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDeleteEvent(event._id)}
                    className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
                  >
                    <Trash2 className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 border border-cyan-500/30 rounded-lg p-8 max-w-3xl w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">Create New Event</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <EventForm />

              <div className="flex gap-4 mt-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCreateEvent}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg font-semibold"
                >
                  Create Event
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-3 bg-gray-800 rounded-lg font-semibold"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 border border-cyan-500/30 rounded-lg p-8 max-w-3xl w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">Edit Event</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <EventForm />

              <div className="flex gap-4 mt-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleUpdateEvent}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg font-semibold"
                >
                  Update Event
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-3 bg-gray-800 rounded-lg font-semibold"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Registrations Modal */}
      <AnimatePresence>
        {showRegistrationsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowRegistrationsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 border border-cyan-500/30 rounded-lg p-8 max-w-4xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">Event Registrations</h3>
                <button
                  onClick={() => setShowRegistrationsModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {registrations.length === 0 ? (
                <p className="text-center text-gray-400 py-8">No registrations yet</p>
              ) : (
                <div className="space-y-4">
                  {registrations.map((reg) => (
                    <div
                      key={reg._id}
                      className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold">{reg.studentId?.name}</p>
                          <p className="text-sm text-gray-400">{reg.studentId?.email}</p>
                          {reg.notes && (
                            <p className="text-sm text-gray-300 mt-2">"{reg.notes}"</p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>Registered: {formatDate(reg.registrationDate)}</span>
                            <span className={`px-2 py-1 rounded ${
                              reg.status === 'registered' ? 'bg-blue-500/20 text-blue-400' :
                              reg.status === 'attended' ? 'bg-green-500/20 text-green-400' :
                              reg.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                              'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {reg.status}
                            </span>
                          </div>
                        </div>
                        
                        {!reg.attendanceMarked && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleMarkAttendance(reg._id, true)}
                              className="px-3 py-1 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 text-sm"
                            >
                              Mark Present
                            </button>
                            <button
                              onClick={() => handleMarkAttendance(reg._id, false)}
                              className="px-3 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 text-sm"
                            >
                              Mark Absent
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
