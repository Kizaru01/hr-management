import { EmployeeTable } from "@/features/employee/components/employee-table";
import { getEmployees } from "@/features/employee/server/get-employees";

export default async function EmployeesPage() {
  const response = await getEmployees();

  const employees = response.data;

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Employees</h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage company employees.
          </p>
        </div>
      </div>

      <EmployeeTable employees={employees} />
    </section>
  );
}
