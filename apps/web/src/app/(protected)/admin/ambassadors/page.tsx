import { AdminAmbassadorPanel } from '@/components/ambassadors/admin-ambassador-panel';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ambassador Management',
  description: 'Manage campus ambassador applications and profiles',
};

export default function AdminAmbassadorPage() {
  return <AdminAmbassadorPanel />;
}
