const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1';

export interface CourseReview {
  _id: string;
  courseId: string;
  studentId: { name: string };
  rating: number;
  comment: string;
  isVerified: boolean;
  helpful: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  distribution: Record<number, number>;
}

export interface CreateReviewInput {
  courseId: string;
  rating: number;
  comment: string;
}

export interface UpdateReviewInput {
  rating?: number;
  comment?: string;
}

/**
 * Create a new course review
 */
export async function createCourseReview(input: CreateReviewInput) {
  const response = await fetch(`${API_BASE_URL}/courses/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create review');
  }

  return response.json();
}

/**
 * Get reviews for a course
 */
export async function getCourseReviews(courseId: string, limit = 20, skip = 0) {
  const response = await fetch(
    `${API_BASE_URL}/courses/${courseId}/reviews?limit=${limit}&skip=${skip}`,
    {
      credentials: 'include',
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch reviews');
  }

  return response.json();
}

/**
 * Get rating statistics for a course
 */
export async function getCourseRatingStats(courseId: string): Promise<ReviewStats> {
  const response = await fetch(`${API_BASE_URL}/courses/${courseId}/reviews/stats`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch rating stats');
  }

  return response.json();
}

/**
 * Get my review for a course
 */
export async function getMyReview(courseId: string) {
  const response = await fetch(`${API_BASE_URL}/courses/${courseId}/reviews/my-review`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch your review');
  }

  return response.json();
}

/**
 * Update a review
 */
export async function updateCourseReview(reviewId: string, updates: UpdateReviewInput) {
  const response = await fetch(`${API_BASE_URL}/courses/reviews/${reviewId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update review');
  }

  return response.json();
}

/**
 * Delete a review
 */
export async function deleteCourseReview(reviewId: string) {
  const response = await fetch(`${API_BASE_URL}/courses/reviews/${reviewId}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete review');
  }

  return response.json();
}

/**
 * Mark a review as helpful
 */
export async function markReviewHelpful(reviewId: string) {
  const response = await fetch(`${API_BASE_URL}/courses/reviews/${reviewId}/helpful`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to mark review as helpful');
  }

  return response.json();
}
