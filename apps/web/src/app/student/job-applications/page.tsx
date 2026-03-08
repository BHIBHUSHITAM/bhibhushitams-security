import { StudentJobApplicationsPanel } from '@/components/jobs/student-job-applications-panel';

export default function StudentJobApplicationsPage() {
  return (
    <div className="min-h-screen bg-dark py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <StudentJobApplicationsPanel />
      </div>
    </div>
  );
}
