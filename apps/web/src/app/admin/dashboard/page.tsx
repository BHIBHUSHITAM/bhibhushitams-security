import { AdminDashboardComponent } from '@/components/dashboard/admin-dashboard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Platform analytics and management overview',
};

export default function AdminDashboardPage() {
  return <AdminDashboardComponent />;
}
