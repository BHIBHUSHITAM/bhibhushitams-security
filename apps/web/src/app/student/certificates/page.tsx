import { StudentCertificatesPanel } from '@/components/certificates/student-certificates-panel';

export default function StudentCertificatesPage() {
  return (
    <div className="min-h-screen bg-dark py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <StudentCertificatesPanel />
      </div>
    </div>
  );
}
