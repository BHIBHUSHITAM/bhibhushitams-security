import { Request, Response } from 'express';
import { courseReviewService } from './course-review.service';
import { z } from 'zod';

const createReviewSchema = z.object({
  courseId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().min(10).max(1000),
});

const updateReviewSchema = z.object({
  rating: z.number().min(1).max(5).optional(),
  comment: z.string().min(10).max(1000).optional(),
});

/**
 * Create a new review
 */
export async function createReview(req: Request, res: Response) {
  try {
    const parsed = createReviewSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ 
        message: 'Invalid input', 
        errors: parsed.error.flatten() 
      });
    }

    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const review = await courseReviewService.createReview({
      ...parsed.data,
      studentId: req.user.id,
    });

    return res.status(201).json({ review });
  } catch (error) {
    return res.status(400).json({ 
      message: error instanceof Error ? error.message : 'Failed to create review' 
    });
  }
}

/**
 * Get reviews for a course
 */
export async function getCourseReviews(req: Request, res: Response) {
  try {
    const { courseId } = req.params;
    if (typeof courseId !== 'string') {
      return res.status(400).json({ message: 'Invalid course ID' });
    }
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = parseInt(req.query.skip as string) || 0;

    const result = await courseReviewService.getCourseReviews(courseId, limit, skip);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to fetch reviews' 
    });
  }
}

/**
 * Get rating statistics for a course
 */
export async function getCourseRatingStats(req: Request, res: Response) {
  try {
    const { courseId } = req.params;
    if (typeof courseId !== 'string') {
      return res.status(400).json({ message: 'Invalid course ID' });
    }
    const stats = await courseReviewService.getCourseRatingStats(courseId);
    return res.status(200).json(stats);
  } catch (error) {
    return res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to fetch rating stats' 
    });
  }
}

/**
 * Get student's own review for a course
 */
export async function getMyReview(req: Request, res: Response) {
  try {
    const { courseId } = req.params;
    if (typeof courseId !== 'string') {
      return res.status(400).json({ message: 'Invalid course ID' });
    }
    
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const review = await courseReviewService.getStudentReview(courseId, req.user.id);
    return res.status(200).json({ review });
  } catch (error) {
    return res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to fetch review' 
    });
  }
}

/**
 * Update a review
 */
export async function updateReview(req: Request, res: Response) {
  try {
    const { reviewId } = req.params;
    if (typeof reviewId !== 'string') {
      return res.status(400).json({ message: 'Invalid review ID' });
    }
    const parsed = updateReviewSchema.safeParse(req.body);
    
    if (!parsed.success) {
      return res.status(400).json({ 
        message: 'Invalid input', 
        errors: parsed.error.flatten() 
      });
    }

    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const review = await courseReviewService.updateReview(
      reviewId,
      req.user.id,
      parsed.data
    );

    return res.status(200).json({ review });
  } catch (error) {
    return res.status(400).json({ 
      message: error instanceof Error ? error.message : 'Failed to update review' 
    });
  }
}

/**
 * Delete a review
 */
export async function deleteReview(req: Request, res: Response) {
  try {
    const { reviewId } = req.params;
    if (typeof reviewId !== 'string') {
      return res.status(400).json({ message: 'Invalid review ID' });
    }
    
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const result = await courseReviewService.deleteReview(reviewId, req.user.id);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ 
      message: error instanceof Error ? error.message : 'Failed to delete review' 
    });
  }
}

/**
 * Mark review as helpful
 */
export async function markHelpful(req: Request, res: Response) {
  try {
    const { reviewId } = req.params;
    if (typeof reviewId !== 'string') {
      return res.status(400).json({ message: 'Invalid review ID' });
    }
    const review = await courseReviewService.markHelpful(reviewId);
    return res.status(200).json({ review });
  } catch (error) {
    return res.status(400).json({ 
      message: error instanceof Error ? error.message : 'Failed to mark review as helpful' 
    });
  }
}
