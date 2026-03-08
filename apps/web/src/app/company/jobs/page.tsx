import { CompanyJobsPanel } from '@/components/jobs/company-jobs-panel';

export default function CompanyJobsPage() {
  return (
    <div className="min-h-screen bg-dark py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <CompanyJobsPanel />
      </div>
    </div>
  );
}
