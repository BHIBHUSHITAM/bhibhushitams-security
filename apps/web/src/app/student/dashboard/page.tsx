import { StudentDashboardComponent } from '@/components/dashboard/student-dashboard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Student Dashboard',
  description: 'Track your progress across all cybersecurity learning paths',
};

export default function StudentDashboardPage() {
  return <StudentDashboardComponent />;
}
