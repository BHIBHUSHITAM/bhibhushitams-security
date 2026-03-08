import { Types } from 'mongoose';
import { CourseReviewModel } from './course-review.model';
import { CourseEnrollmentModel } from './course-enrollment.model';
import { CourseModel } from './course.model';

interface CreateReviewInput {
  courseId: string;
  studentId: string;
  rating: number;
  comment: string;
}

interface UpdateReviewInput {
  rating?: number;
  comment?: string;
}

class CourseReviewService {
  /**
   * Create a new course review
   */
  async createReview(input: CreateReviewInput) {
    const { courseId, studentId, rating, comment } = input;

    // Check if student is enrolled
    const enrollment = await CourseEnrollmentModel.findOne({
      courseId: new Types.ObjectId(courseId),
      studentId: new Types.ObjectId(studentId),
    });

    if (!enrollment) {
      throw new Error('You must be enrolled in this course to leave a review');
    }

    // Check if review already exists
    const existingReview = await CourseReviewModel.findOne({
      courseId: new Types.ObjectId(courseId),
      studentId: new Types.ObjectId(studentId),
    });

    if (existingReview) {
      throw new Error('You have already reviewed this course');
    }

    // Create review
    const review = await CourseReviewModel.create({
      courseId: new Types.ObjectId(courseId),
      studentId: new Types.ObjectId(studentId),
      rating,
      comment,
      isVerified: enrollment.completedAt ? true : false,
    });

    // Update course average rating
    await this.updateCourseAverageRating(courseId);

    return review;
  }

  /**
   * Get reviews for a course
   */
  async getCourseReviews(courseId: string, limit = 20, skip = 0) {
    const reviews = await CourseReviewModel.find({
      courseId: new Types.ObjectId(courseId),
    })
      .populate('studentId', 'name')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    const total = await CourseReviewModel.countDocuments({
      courseId: new Types.ObjectId(courseId),
    });

    return { reviews, total };
  }

  /**
   * Update a review
   */
  async updateReview(reviewId: string, studentId: string, updates: UpdateReviewInput) {
    const review = await CourseReviewModel.findOne({
      _id: new Types.ObjectId(reviewId),
      studentId: new Types.ObjectId(studentId),
    });

    if (!review) {
      throw new Error('Review not found or you are not authorized to update it');
    }

    if (updates.rating !== undefined) {
      review.rating = updates.rating;
    }
    if (updates.comment !== undefined) {
      review.comment = updates.comment;
    }

    await review.save();

    // Update course average rating
    await this.updateCourseAverageRating(review.courseId.toString());

    return review;
  }

  /**
   * Delete a review
   */
  async deleteReview(reviewId: string, studentId: string) {
    const review = await CourseReviewModel.findOne({
      _id: new Types.ObjectId(reviewId),
      studentId: new Types.ObjectId(studentId),
    });

    if (!review) {
      throw new Error('Review not found or you are not authorized to delete it');
    }

    const courseId = review.courseId.toString();
    await review.deleteOne();

    // Update course average rating
    await this.updateCourseAverageRating(courseId);

    return { message: 'Review deleted successfully' };
  }

  /**
   * Get student's review for a course
   */
  async getStudentReview(courseId: string, studentId: string) {
    return CourseReviewModel.findOne({
      courseId: new Types.ObjectId(courseId),
      studentId: new Types.ObjectId(studentId),
    }).lean();
  }

  /**
   * Mark review as helpful
   */
  async markHelpful(reviewId: string) {
    const review = await CourseReviewModel.findById(reviewId);
    if (!review) {
      throw new Error('Review not found');
    }

    review.helpful += 1;
    await review.save();

    return review;
  }

  /**
   * Update course average rating
   */
  private async updateCourseAverageRating(courseId: string) {
    const stats = await CourseReviewModel.aggregate([
      { $match: { courseId: new Types.ObjectId(courseId) } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    const course = await CourseModel.findById(courseId);
    if (course && stats.length > 0) {
      (course as any).averageRating = Math.round(stats[0].averageRating * 10) / 10;
      (course as any).totalReviews = stats[0].totalReviews;
      await course.save();
    }
  }

  /**
   * Get course rating statistics
   */
  async getCourseRatingStats(courseId: string) {
    const stats = await CourseReviewModel.aggregate([
      { $match: { courseId: new Types.ObjectId(courseId) } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
    ]);

    const total = await CourseReviewModel.countDocuments({
      courseId: new Types.ObjectId(courseId),
    });

    const avgStats = await CourseReviewModel.aggregate([
      { $match: { courseId: new Types.ObjectId(courseId) } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
        },
      },
    ]);

    return {
      averageRating: avgStats.length > 0 ? Math.round(avgStats[0].averageRating * 10) / 10 : 0,
      totalReviews: total,
      distribution: stats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {} as Record<number, number>),
    };
  }
}

export const courseReviewService = new CourseReviewService();
