import { StudentAmbassadorDashboard } from '@/components/ambassadors/student-ambassador-dashboard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ambassador Dashboard',
  description: 'Track your ambassador application and progress',
};

export default function StudentAmbassadorPage() {
  return <StudentAmbassadorDashboard />;
}
