import { authFetch, parseApiJson } from '@/lib/auth/http';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1';

export interface StudentDashboardStats {
  coursesEnrolled: number;
  coursesCompleted: number;
  internshipsApplied: number;
  internshipsActive: number;
  jobsApplied: number;
  jobsSaved: number;
  eventsRegistered: number;
  eventsAttended: number;
  certificatesEarned: number;
  ambassadorStatus?: 'none' | 'pending' | 'approved' | 'rejected' | 'active';
  ambassadorTier?: 'bronze' | 'silver' | 'gold' | 'platinum';
  totalScore: number;
  scoreBreakdown?: {
    courseCompletionCredits: number;
    internshipSelectionCredits: number;
    jobAcceptanceCredits: number;
    eventAttendanceCredits: number;
    certificateCredits: number;
    ambassadorCredits: number;
  };
}

export interface AdminDashboardStats {
  totalStudents: number;
  totalCompanies: number;
  activeCourses: number;
  totalEnrollments: number;
  activeInternships: number;
  totalInternshipApplications: number;
  activeJobs: number;
  totalJobApplications: number;
  upcomingEvents: number;
  totalEventRegistrations: number;
  activeAmbassadors: number;
  pendingAmbassadorApplications: number;
  certificatesIssued: number;
  recentSignups: number;
}

/**
 * Get student dashboard statistics
 */
export async function getStudentDashboard() {
  const response = await authFetch(`${API_BASE_URL}/dashboard/student`, {
    method: 'GET',
  });

  return parseApiJson<{ stats: StudentDashboardStats }>(response);
}

/**
 * Get admin dashboard statistics
 */
export async function getAdminDashboard() {
  const response = await authFetch(`${API_BASE_URL}/dashboard/admin`, {
    method: 'GET',
  });

  return parseApiJson<{ stats: AdminDashboardStats }>(response);
}
