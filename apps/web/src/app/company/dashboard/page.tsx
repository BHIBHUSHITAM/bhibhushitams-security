import { DashboardShell } from "@/components/auth/dashboard-shell";

export default function CompanyDashboardPage() {
  return (
    <DashboardShell
      role="company"
      title="Welcome Company"
      description="This protected area is only accessible to company and admin roles."
    />
  );
}
