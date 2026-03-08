import { AmbassadorListingPage } from '@/components/ambassadors/ambassador-listing-page';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Campus Ambassadors',
  description: 'Browse our campus ambassadors and learn about the program',
};

export default function AmbassadorsPage() {
  return <AmbassadorListingPage />;
}
