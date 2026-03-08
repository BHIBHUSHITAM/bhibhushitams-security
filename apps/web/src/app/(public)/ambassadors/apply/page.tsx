import { AmbassadorApplicationForm } from '@/components/ambassadors/ambassador-application-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Apply for Campus Ambassador Program',
  description: 'Join our campus ambassador program and make a difference on campus',
};

export default function ApplyPage() {
  return <AmbassadorApplicationForm />;
}
