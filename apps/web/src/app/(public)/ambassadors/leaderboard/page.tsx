import { AmbassadorLeaderboard } from '@/components/ambassadors/ambassador-leaderboard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ambassador Leaderboard',
  description: 'See the top-performing campus ambassadors',
};

export default function LeaderboardPage() {
  return <AmbassadorLeaderboard />;
}
