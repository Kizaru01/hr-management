import { EmployeeTable } from "@/features/employee/components/employee-table";
import { getEmployees } from "@/features/employee/server/get-employees";
import { PageHeader } from "@/components/ui/page-header";

export default async function PerformanceReviewsPage() {
  const response = await getEmployees();

  return (
    <section className="page-stack">
      <PageHeader
        title="Performance Reviews"
        description="Select an employee to view their review history or create a new performance review."
      />

      <EmployeeTable employees={response.data} />
    </section>
  );
}
