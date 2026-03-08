import { UserModel } from '../users/user.model';
import { CourseModel } from '../courses/course.model';
import { CourseEnrollmentModel } from '../courses/course-enrollment.model';
import { InternshipModel } from '../internships/internship.model';
import { InternshipApplicationModel } from '../internships/internship-application.model';
import { JobModel } from '../jobs/job.model';
import { JobApplicationModel } from '../jobs/job-application.model';
import { EventModel } from '../events/event.model';
import { EventRegistrationModel } from '../events/event-registration.model';
import { CertificateModel } from '../certificates/certificate.model';
import { AmbassadorModel, AmbassadorApplicationModel } from '../ambassadors/ambassador.model';
import type { StudentDashboardStats, AdminDashboardStats } from '../../types/dashboard.types';

class DashboardService {
  // Completion-weighted points model inspired by common learning gamification systems.
  private readonly CREDIT_WEIGHTS = {
    courseCompleted: 100,
    internshipSelected: 120,
    jobAccepted: 140,
    eventAttended: 25,
    certificateEarned: 60,
    ambassadorEngagementMultiplier: 0.25,
  } as const;

  /**
   * Get student dashboard statistics
   */
  async getStudentDashboardStats(studentId: string): Promise<StudentDashboardStats> {
    const [
      coursesEnrolled,
      coursesCompleted,
      internshipsApplied,
      internshipsActive,
      jobsApplied,
      jobsAccepted,
      eventsRegistered,
      eventsAttended,
      certificates,
      ambassadorApp,
      ambassadorProfile,
    ] = await Promise.all([
      CourseEnrollmentModel.countDocuments({ studentId }),
      CourseEnrollmentModel.countDocuments({
        studentId,
        $or: [{ progressPercent: { $gte: 100 } }, { completedAt: { $exists: true, $ne: null } }],
      }),
      InternshipApplicationModel.countDocuments({ studentId }),
      InternshipApplicationModel.countDocuments({ studentId, status: 'selected' }),
      JobApplicationModel.countDocuments({ studentId }),
      JobApplicationModel.countDocuments({ studentId, status: 'accepted' }),
      EventRegistrationModel.countDocuments({ studentId }),
      EventRegistrationModel.countDocuments({ studentId, attended: true }),
      CertificateModel.countDocuments({ studentId, status: 'active' }),
      AmbassadorApplicationModel.findOne({ studentId }),
      AmbassadorModel.findOne({ studentId }),
    ]);

    // Completion-based automatic credits, recalculated on each request.
    const totalScore =
      coursesCompleted * this.CREDIT_WEIGHTS.courseCompleted +
      internshipsActive * this.CREDIT_WEIGHTS.internshipSelected +
      jobsAccepted * this.CREDIT_WEIGHTS.jobAccepted +
      eventsAttended * this.CREDIT_WEIGHTS.eventAttended +
      certificates * this.CREDIT_WEIGHTS.certificateEarned +
      Math.round(
        (ambassadorProfile?.engagementScore ?? 0) * this.CREDIT_WEIGHTS.ambassadorEngagementMultiplier
      );

    return {
      coursesEnrolled,
      coursesCompleted,
      internshipsApplied,
      internshipsActive,
      jobsApplied,
      jobsSaved: 0, // TODO: Implement job saving feature
      eventsRegistered,
      eventsAttended,
      certificatesEarned: certificates,
      ambassadorStatus: ambassadorApp?.status as any || 'none',
      ambassadorTier: ambassadorProfile?.tier,
      totalScore,
      scoreBreakdown: {
        courseCompletionCredits:
          coursesCompleted * this.CREDIT_WEIGHTS.courseCompleted,
        internshipSelectionCredits:
          internshipsActive * this.CREDIT_WEIGHTS.internshipSelected,
        jobAcceptanceCredits: jobsAccepted * this.CREDIT_WEIGHTS.jobAccepted,
        eventAttendanceCredits:
          eventsAttended * this.CREDIT_WEIGHTS.eventAttended,
        certificateCredits: certificates * this.CREDIT_WEIGHTS.certificateEarned,
        ambassadorCredits: Math.round(
          (ambassadorProfile?.engagementScore ?? 0) *
            this.CREDIT_WEIGHTS.ambassadorEngagementMultiplier
        ),
      },
    };
  }

  /**
   * Get admin dashboard statistics
   */
  async getAdminDashboardStats(): Promise<AdminDashboardStats> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalStudents,
      totalCompanies,
      activeCourses,
      totalEnrollments,
      activeInternships,
      totalInternshipApplications,
      activeJobs,
      totalJobApplications,
      upcomingEvents,
      totalEventRegistrations,
      activeAmbassadors,
      pendingAmbassadorApplications,
      certificatesIssued,
      recentSignups,
    ] = await Promise.all([
      UserModel.countDocuments({ role: 'student' }),
      UserModel.countDocuments({ role: 'company' }),
      CourseModel.countDocuments({ isPublished: true }),
      CourseEnrollmentModel.countDocuments(),
      InternshipModel.countDocuments({ status: 'open' }),
      InternshipApplicationModel.countDocuments(),
      JobModel.countDocuments({ status: 'active' }),
      JobApplicationModel.countDocuments(),
      EventModel.countDocuments({ 
        status: 'upcoming',
        startDate: { $gte: new Date() }
      }),
      EventRegistrationModel.countDocuments(),
      AmbassadorModel.countDocuments({ isActive: true }),
      AmbassadorApplicationModel.countDocuments({ status: 'pending' }),
      CertificateModel.countDocuments({ status: 'active' }),
      UserModel.countDocuments({ 
        createdAt: { $gte: thirtyDaysAgo }
      }),
    ]);

    return {
      totalStudents,
      totalCompanies,
      activeCourses,
      totalEnrollments,
      activeInternships,
      totalInternshipApplications,
      activeJobs,
      totalJobApplications,
      upcomingEvents,
      totalEventRegistrations,
      activeAmbassadors,
      pendingAmbassadorApplications,
      certificatesIssued,
      recentSignups,
    };
  }
}

export const dashboardService = new DashboardService();
