'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Award, ArrowRight, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { z } from 'zod';
import { applyForAmbassador, getMyApplication, ApplyForAmbassadorInput } from '@/lib/ambassadors/api';
import { GlassCard } from '@/components/landing/glass-card';

const applySchema = z.object({
  college: z.string().min(2, 'College name required'),
  department: z.string().min(2, 'Department required'),
  batch: z.string().min(4, 'Batch year required'),
  whyAmbassador: z.string().min(20, 'Please explain why you want to be an ambassador (min 20 chars)'),
  experience: z.string().min(10, 'Experience required (min 10 chars)'),
  goals: z.string().min(20, 'Goals required (min 20 chars)'),
  linkedIn: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  github: z.string().url('Invalid GitHub URL').optional().or(z.literal('')),
  twitter: z.string().url('Invalid Twitter URL').optional().or(z.literal('')),
  instagram: z.string().url('Invalid Instagram URL').optional().or(z.literal('')),
});

type ApplyFormData = z.infer<typeof applySchema>;

export const AmbassadorApplicationForm = () => {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [existingApplication, setExistingApplication] = useState(false);
  
  const [formData, setFormData] = useState<ApplyFormData>({
    college: '',
    department: '',
    batch: '',
    whyAmbassador: '',
    experience: '',
    goals: '',
    linkedIn: '',
    github: '',
    twitter: '',
    instagram: '',
  });

  const [fieldErrors, setFieldErrors] = useState<Partial<ApplyFormData>>({});

  const steps = [
    { title: 'Personal Info', fields: ['college', 'department', 'batch'] },
    { title: 'Motivation', fields: ['whyAmbassador', 'experience', 'goals'] },
    { title: 'Social Links', fields: ['linkedIn', 'github', 'twitter', 'instagram'] },
  ];

  const handleInputChange = (field: keyof ApplyFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setFieldErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateStep = () => {
    const fieldsToValidate = steps[step].fields;
    const stepData = Object.fromEntries(
      fieldsToValidate.map(field => [field, formData[field as keyof ApplyFormData]])
    );

    try {
      const schema = z.object(
        Object.fromEntries(
          fieldsToValidate.map(field => [
            field,
            applySchema.shape[field as keyof typeof applySchema.shape],
          ])
        )
      );
      schema.parse(stepData);
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: Partial<ApplyFormData> = {};
        err.issues.forEach(e => {
          const field = e.path[0];
          errors[field as keyof ApplyFormData] = e.message;
        });
        setFieldErrors(errors);
      }
      return false;
    }
  };

  const handleNext = () => {
    if (validateStep()) {
      if (step < steps.length - 1) {
        setStep(step + 1);
      }
    }
  };

  const handlePrevious = () => {
    setStep(Math.max(0, step - 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep()) return;

    try {
      setLoading(true);
      setError('');

      const applicationData: ApplyForAmbassadorInput = {
        college: formData.college,
        department: formData.department,
        batch: formData.batch,
        whyAmbassador: formData.whyAmbassador,
        experience: formData.experience,
        goals: formData.goals,
        socialLinks: {
          linkedin: formData.linkedIn || undefined,
          github: formData.github || undefined,
          twitter: formData.twitter || undefined,
          instagram: formData.instagram || undefined,
        },
      };

      const response = await applyForAmbassador(applicationData);
      
      if (response.success) {
        setSubmitted(true);
        setStep(0);
      } else {
        setError(response.message || 'Failed to submit application');
        if (response.message?.includes('existing')) {
          setExistingApplication(true);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white flex items-center justify-center py-20 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <GlassCard className="max-w-md w-full text-center p-8">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.5 }}
              className="flex justify-center mb-6"
            >
              <div className="bg-gradient-to-br from-green-500 to-cyan-500 rounded-full p-4">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
            </motion.div>

            <h2 className="text-3xl font-bold mb-4">Application Submitted!</h2>
            <p className="text-gray-300 mb-2">
              Thank you for applying to become a Campus Ambassador.
            </p>
            <p className="text-gray-400 text-sm mb-6">
              We'll review your application and get back to you within 5-7 business days.
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSubmitted(false)}
              className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg font-semibold"
            >
              Back to Home
            </motion.button>
          </GlassCard>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white py-20 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Join Our Ambassador Program
          </h1>
          <p className="text-gray-400">
            Become a leader on campus and make a real impact
          </p>
        </motion.div>

        {/* Existing Application Warning */}
        {existingApplication && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/50 rounded-lg flex gap-3"
          >
            <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-yellow-500">You already have an application</p>
              <p className="text-sm text-yellow-400">Check your dashboard to view its status</p>
            </div>
          </motion.div>
        )}

        {error && !existingApplication && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-400">{error}</p>
          </motion.div>
        )}

        <GlassCard className="p-8">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              {steps.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`text-sm font-medium ${
                    i === step ? 'text-cyan-400' : i < step ? 'text-green-400' : 'text-gray-500'
                  }`}
                >
                  {i + 1}. {s.title}
                </motion.div>
              ))}
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.3 }}
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
              />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Personal Info */}
            {step === 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h2 className="text-2xl font-bold mb-6">Tell us about yourself</h2>

                <div>
                  <label className="block text-sm font-medium mb-2">College Name</label>
                  <input
                    type="text"
                    placeholder="e.g., XYZ Engineering College"
                    value={formData.college}
                    onChange={(e) => handleInputChange('college', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-cyan-500/30 rounded-lg focus:outline-none focus:border-cyan-500"
                  />
                  {fieldErrors.college && (
                    <p className="text-red-400 text-sm mt-1">{fieldErrors.college}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Department</label>
                  <input
                    type="text"
                    placeholder="e.g., Computer Science"
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-cyan-500/30 rounded-lg focus:outline-none focus:border-cyan-500"
                  />
                  {fieldErrors.department && (
                    <p className="text-red-400 text-sm mt-1">{fieldErrors.department}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Batch Year</label>
                  <input
                    type="text"
                    placeholder="e.g., 2024, 2025"
                    value={formData.batch}
                    onChange={(e) => handleInputChange('batch', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-cyan-500/30 rounded-lg focus:outline-none focus:border-cyan-500"
                  />
                  {fieldErrors.batch && (
                    <p className="text-red-400 text-sm mt-1">{fieldErrors.batch}</p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 2: Motivation */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h2 className="text-2xl font-bold mb-6">Tell us your story</h2>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Why do you want to be an ambassador? (Min 20 characters)
                  </label>
                  <textarea
                    placeholder="Share your passion for making an impact..."
                    value={formData.whyAmbassador}
                    onChange={(e) => handleInputChange('whyAmbassador', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-cyan-500/30 rounded-lg focus:outline-none focus:border-cyan-500 resize-none"
                  />
                  <div className="flex justify-between mt-1">
                    {fieldErrors.whyAmbassador && (
                      <p className="text-red-400 text-sm">{fieldErrors.whyAmbassador}</p>
                    )}
                    <span className="text-xs text-gray-500 ml-auto">{formData.whyAmbassador.length}/500</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Relevant Experience (Min 10 characters)
                  </label>
                  <textarea
                    placeholder="E.g., leadership in clubs, event organization, community work..."
                    value={formData.experience}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-cyan-500/30 rounded-lg focus:outline-none focus:border-cyan-500 resize-none"
                  />
                  <div className="flex justify-between mt-1">
                    {fieldErrors.experience && (
                      <p className="text-red-400 text-sm">{fieldErrors.experience}</p>
                    )}
                    <span className="text-xs text-gray-500 ml-auto">{formData.experience.length}/500</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Your Goals as an Ambassador (Min 20 characters)
                  </label>
                  <textarea
                    placeholder="What do you want to achieve in this role?"
                    value={formData.goals}
                    onChange={(e) => handleInputChange('goals', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-cyan-500/30 rounded-lg focus:outline-none focus:border-cyan-500 resize-none"
                  />
                  <div className="flex justify-between mt-1">
                    {fieldErrors.goals && (
                      <p className="text-red-400 text-sm">{fieldErrors.goals}</p>
                    )}
                    <span className="text-xs text-gray-500 ml-auto">{formData.goals.length}/500</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Social Links */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h2 className="text-2xl font-bold mb-6">Connect with us (Optional)</h2>

                <div>
                  <label className="block text-sm font-medium mb-2">LinkedIn Profile</label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/yourprofile"
                    value={formData.linkedIn}
                    onChange={(e) => handleInputChange('linkedIn', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-cyan-500/30 rounded-lg focus:outline-none focus:border-cyan-500"
                  />
                  {fieldErrors.linkedIn && (
                    <p className="text-red-400 text-sm mt-1">{fieldErrors.linkedIn}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">GitHub Profile</label>
                  <input
                    type="url"
                    placeholder="https://github.com/yourprofile"
                    value={formData.github}
                    onChange={(e) => handleInputChange('github', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-cyan-500/30 rounded-lg focus:outline-none focus:border-cyan-500"
                  />
                  {fieldErrors.github && (
                    <p className="text-red-400 text-sm mt-1">{fieldErrors.github}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Twitter/X Profile</label>
                  <input
                    type="url"
                    placeholder="https://twitter.com/yourprofile"
                    value={formData.twitter}
                    onChange={(e) => handleInputChange('twitter', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-cyan-500/30 rounded-lg focus:outline-none focus:border-cyan-500"
                  />
                  {fieldErrors.twitter && (
                    <p className="text-red-400 text-sm mt-1">{fieldErrors.twitter}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Instagram Profile</label>
                  <input
                    type="url"
                    placeholder="https://instagram.com/yourprofile"
                    value={formData.instagram}
                    onChange={(e) => handleInputChange('instagram', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-cyan-500/30 rounded-lg focus:outline-none focus:border-cyan-500"
                  />
                  {fieldErrors.instagram && (
                    <p className="text-red-400 text-sm mt-1">{fieldErrors.instagram}</p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 pt-6">
              {step > 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={handlePrevious}
                  className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-semibold transition-colors"
                >
                  Previous
                </motion.button>
              )}

              {step < steps.length - 1 ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={handleNext}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg font-semibold flex items-center justify-center gap-2"
                >
                  Next <ArrowRight className="w-4 h-4" />
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Award className="w-4 h-4" />
                      Submit Application
                    </>
                  )}
                </motion.button>
              )}
            </div>
          </form>
        </GlassCard>
      </div>
    </div>
  );
};
