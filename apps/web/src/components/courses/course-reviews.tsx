'use client';

import { useState, useEffect } from 'react';
import { Star, ThumbsUp, Loader } from 'lucide-react';
import { motion } from 'framer-motion';

interface Review {
  _id: string;
  rating: number;
  comment: string;
  studentId: { name: string };
  isVerified: boolean;
  helpful: number;
  createdAt: string;
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  distribution: Record<number, number>;
}

interface CourseReviewsProps {
  courseId: string;
  isEnrolled: boolean;
  onReviewSubmitted?: () => void;
}

export function CourseReviews({ courseId, isEnrolled, onReviewSubmitted }: CourseReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [myReview, setMyReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadReviews();
    loadStats();
    if (isEnrolled) {
      loadMyReview();
    }
  }, [courseId, isEnrolled]);

  const loadReviews = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/courses/${courseId}/reviews`,
        { credentials: 'include' }
      );
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || []);
      }
    } catch (err) {
      console.error('Failed to load reviews', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/courses/${courseId}/reviews/stats`,
        { credentials: 'include' }
      );
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to load stats', err);
    }
  };

  const loadMyReview = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/courses/${courseId}/reviews/my-review`,
        { credentials: 'include' }
      );
      if (response.ok) {
        const data = await response.json();
        setMyReview(data.review);
      }
    } catch (err) {
      console.error('Failed to load my review', err);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/courses/reviews`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ courseId, rating, comment }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to submit review');
      }

      setShowReviewForm(false);
      setComment('');
      setRating(5);
      loadReviews();
      loadStats();
      loadMyReview();
      onReviewSubmitted?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkHelpful = async (reviewId: string) => {
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/courses/reviews/${reviewId}/helpful`,
        {
          method: 'POST',
          credentials: 'include',
        }
      );
      loadReviews();
    } catch (err) {
      console.error('Failed to mark helpful', err);
    }
  };

  const renderStars = (currentRating: number, interactive = false, onRate?: (r: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= currentRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'
            } ${interactive ? 'cursor-pointer hover:scale-110 transition' : ''}`}
            onClick={() => interactive && onRate?.(star)}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader className="w-6 h-6 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Stats */}
      {stats && (
        <div className="glass-panel p-6 rounded-xl">
          <div className="flex items-center gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold text-cyan-400">{stats.averageRating.toFixed(1)}</div>
              <div className="flex justify-center mt-2">{renderStars(Math.round(stats.averageRating))}</div>
              <div className="text-sm text-gray-400 mt-1">{stats.totalReviews} reviews</div>
            </div>
            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = stats.distribution[star] || 0;
                return (
                  <div key={star} className="flex items-center gap-3">
                    <span className="text-sm text-gray-400 w-8">{star} ★</span>
                    <progress
                      className="flex-1 h-2 [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-bar]:bg-gray-800 [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-cyan-400 [&::-moz-progress-bar]:rounded-full [&::-moz-progress-bar]:bg-cyan-400"
                      value={count}
                      max={Math.max(stats.totalReviews, 1)}
                      aria-label={`${star} star review count`}
                    />
                    <span className="text-sm text-gray-400 w-12">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Write Review Button */}
      {isEnrolled && !myReview && (
        <button
          onClick={() => setShowReviewForm(!showReviewForm)}
          className="w-full glass-panel px-4 py-3 rounded-lg text-cyan-400 hover:bg-cyan-400/10 transition"
        >
          Write a Review
        </button>
      )}

      {/* Review Form */}
      {showReviewForm && (
        <motion.form
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmitReview}
          className="glass-panel p-6 rounded-xl space-y-4"
        >
          <h3 className="text-lg font-semibold text-white">Share Your Experience</h3>
          
          <div>
            <label className="block text-sm text-gray-400 mb-2">Rating</label>
            {renderStars(rating, true, setRating)}
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Your Review</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell others about your experience with this course..."
              className="w-full bg-gray-900/50 border border-cyan-400/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 min-h-[120px]"
              minLength={10}
              maxLength={1000}
              required
            />
            <div className="text-xs text-gray-500 mt-1">{comment.length}/1000</div>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting || comment.length < 10}
              className="flex-1 bg-cyan-400 text-gray-900 px-4 py-2 rounded-lg font-semibold hover:bg-cyan-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
            <button
              type="button"
              onClick={() => setShowReviewForm(false)}
              className="px-4 py-2 border border-gray-600 rounded-lg text-gray-400 hover:bg-gray-800 transition"
            >
              Cancel
            </button>
          </div>
        </motion.form>
      )}

      {/* My Review */}
      {myReview && (
        <div className="glass-panel p-6 rounded-xl border-2 border-cyan-400/30">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className="text-white font-semibold">Your Review</h4>
              {renderStars(myReview.rating)}
            </div>
            {myReview.isVerified && (
              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                Verified Purchase
              </span>
            )}
          </div>
          <p className="text-gray-300">{myReview.comment}</p>
          <p className="text-sm text-gray-500 mt-2">
            {new Date(myReview.createdAt).toLocaleDateString()}
          </p>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white">Student Reviews</h3>
        {reviews.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No reviews yet. Be the first to review!</p>
        ) : (
          reviews.map((review) => (
            <motion.div
              key={review._id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-panel p-6 rounded-xl"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold">{review.studentId.name}</span>
                    {review.isVerified && (
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                        Verified
                      </span>
                    )}
                  </div>
                  {renderStars(review.rating)}
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-300 mb-3">{review.comment}</p>
              <button
                onClick={() => handleMarkHelpful(review._id)}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-cyan-400 transition"
              >
                <ThumbsUp className="w-4 h-4" />
                Helpful ({review.helpful})
              </button>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
