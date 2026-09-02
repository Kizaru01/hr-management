import { EmployeeTable } from "@/features/employee/components/employee-table";
import { getEmployees } from "@/features/employee/server/get-employees";
import { PageHeader } from "@/components/ui/page-header";

export default async function EmployeesPage() {
  const response = await getEmployees();

  const employees = response.data;

  return (
    <section className="page-stack">
      <PageHeader
        title="Employees"
        description="Manage company employee records and assignments."
      />

      <EmployeeTable employees={employees} />
    </section>
  );
}
