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

export interface RecentActivity {
  id: string;
  type: 'course' | 'internship' | 'job' | 'event' | 'certificate' | 'ambassador';
  title: string;
  description: string;
  date: Date;
}
