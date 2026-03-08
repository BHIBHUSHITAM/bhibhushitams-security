'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, Check, AlertCircle, Search, ExternalLink } from 'lucide-react';
import { createCertificate, getAllCertificates, Certificate } from '@/lib/certificates/api';
import { getCourses } from '@/lib/courses/api';
import { getInternships } from '@/lib/internships/api';
import { GlassCard } from '@/components/landing/glass-card';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";

interface Student {
  _id: string;
  name: string;
  email: string;
}

interface Course {
  _id: string;
  title: string;
}

interface Internship {
  _id: string;
  title: string;
}

export function AdminCertificatesPanel() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Form state
  const [formData, setFormData] = useState({
    studentId: '',
    type: 'course' as 'course' | 'internship' | 'event',
    courseId: '',
    internshipId: '',
    title: '',
    description: '',
    grade: '',
    score: '',
    duration: '',
    skills: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [certsData, studentsData, coursesData, internshipsData] = await Promise.all([
        getAllCertificates(),
        fetch(`${API_BASE_URL}/auth/users`, { credentials: 'include' })
          .then(res => res.json())
          .then(data => data.users.filter((u: any) => u.role === 'student')),
        getCourses().then(data => data.courses),
        getInternships().then(data => data.internships),
      ]);

      setCertificates(certsData);
      setStudents(studentsData);
      setCourses(coursesData);
      setInternships(internshipsData);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load data' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setMessage({ type: '', text: '' });

    try {
      const metadata: any = {};
      if (formData.grade) metadata.grade = formData.grade;
      if (formData.score) metadata.score = parseFloat(formData.score);
      if (formData.duration) metadata.duration = formData.duration;
      if (formData.skills) metadata.skills = formData.skills.split(',').map(s => s.trim());

      await createCertificate({
        studentId: formData.studentId,
        type: formData.type,
        courseId: formData.type === 'course' ? formData.courseId : undefined,
        internshipId: formData.type === 'internship' ? formData.internshipId : undefined,
        title: formData.title,
        description: formData.description || undefined,
        metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
      });

      setMessage({ type: 'success', text: 'Certificate created successfully!' });
      
      // Reset form
      setFormData({
        studentId: '',
        type: 'course',
        courseId: '',
        internshipId: '',
        title: '',
        description: '',
        grade: '',
        score: '',
        duration: '',
        skills: '',
      });

      // Reload certificates
      loadData();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to create certificate',
      });
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-cyan-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Certificate Management</h2>
        <p className="text-gray-400">Create and manage certificates for students</p>
      </div>

      {/* Create Certificate Form */}
      <GlassCard className="p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Award className="w-6 h-6 text-cyan-400" />
          Issue New Certificate
        </h3>

        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${
              message.type === 'success'
                ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                : 'bg-red-500/20 border border-red-500/30 text-red-400'
            }`}
          >
            {message.type === 'success' ? (
              <Check className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            {message.text}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Student Select */}
            <div>
              <label htmlFor="student-select" className="block text-sm font-medium text-gray-300 mb-2">
                Student *
              </label>
              <select
                id="student-select"
                required
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                className="w-full bg-dark/50 border border-cyan-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="">Select Student</option>
                {students.map((student) => (
                  <option key={student._id} value={student._id}>
                    {student.name} ({student.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Type Select */}
            <div>
              <label htmlFor="type-select" className="block text-sm font-medium text-gray-300 mb-2">
                Certificate Type *
              </label>
              <select
                id="type-select"
                required
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as 'course' | 'internship' | 'event',
                    courseId: '',
                    internshipId: '',
                  })
                }
                className="w-full bg-dark/50 border border-cyan-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="course">Course</option>
                <option value="internship">Internship</option>
                <option value="event">Event</option>
              </select>
            </div>
          </div>

          {/* Course/Internship Selection */}
          {formData.type === 'course' && (
            <div>
              <label htmlFor="course-select" className="block text-sm font-medium text-gray-300 mb-2">
                Course *
              </label>
              <select
                id="course-select"
                required
                value={formData.courseId}
                onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                className="w-full bg-dark/50 border border-cyan-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="">Select Course</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {formData.type === 'internship' && (
            <div>
              <label htmlFor="internship-select" className="block text-sm font-medium text-gray-300 mb-2">
                Internship *
              </label>
              <select
                id="internship-select"
                required
                value={formData.internshipId}
                onChange={(e) => setFormData({ ...formData, internshipId: e.target.value })}
                className="w-full bg-dark/50 border border-cyan-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="">Select Internship</option>
                {internships.map((internship) => (
                  <option key={internship._id} value={internship._id}>
                    {internship.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Certificate Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Ethical Hacking Course Completion"
              className="w-full bg-dark/50 border border-cyan-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Additional details about the certificate"
              className="w-full bg-dark/50 border border-cyan-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Grade */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Grade (Optional)
              </label>
              <input
                type="text"
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                placeholder="e.g., A+"
                className="w-full bg-dark/50 border border-cyan-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Score */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Score % (Optional)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.score}
                onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                placeholder="e.g., 95"
                className="w-full bg-dark/50 border border-cyan-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Duration (Optional)
            </label>
            <input
              type="text"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              placeholder="e.g., 12 weeks"
              className="w-full bg-dark/50 border border-cyan-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Skills (Optional, comma-separated)
            </label>
            <input
              type="text"
              value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              placeholder="e.g., Penetration Testing, Network Security, Vulnerability Assessment"
              className="w-full bg-dark/50 border border-cyan-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            type="submit"
            disabled={creating}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 disabled:opacity-50"
          >
            {creating ? 'Creating Certificate...' : 'Issue Certificate'}
          </button>
        </form>
      </GlassCard>

      {/* Certificates List */}
      <GlassCard className="p-6">
        <h3 className="text-xl font-bold text-white mb-4">Issued Certificates</h3>
        
        {certificates.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No certificates issued yet</p>
        ) : (
          <div className="space-y-3">
            {certificates.map((cert) => (
              <div
                key={cert._id}
                className="bg-dark/50 border border-cyan-500/20 rounded-lg p-4 hover:border-cyan-500/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          cert.status === 'active'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {cert.status.toUpperCase()}
                      </span>
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-cyan-500/20 text-cyan-400">
                        {cert.type.toUpperCase()}
                      </span>
                    </div>
                    <h4 className="text-white font-semibold mb-1">{cert.title}</h4>
                    <p className="text-sm text-gray-400 mb-1">
                      ID: <span className="font-mono">{cert.certificateId}</span>
                    </p>
                    <p className="text-sm text-gray-500">
                      Issued: {new Date(cert.issueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <a
                    href={cert.verificationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 transition-colors"
                    aria-label="View certificate verification"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
