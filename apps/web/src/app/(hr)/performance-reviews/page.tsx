import { EmployeeTable } from "@/features/employee/components/employee-table";
import { getEmployees } from "@/features/employee/server/get-employees";

export default async function PerformanceReviewsPage() {
  const response = await getEmployees();

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Performance Reviews</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Select an employee to view their review history or create a new
          performance review.
        </p>
      </div>

      <EmployeeTable employees={response.data} />
    </section>
  );
}
