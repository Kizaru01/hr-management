import { EmployeeProfile } from "@/features/employee/components/employee-profile";
import { getEmployee } from "@/features/employee/server/get-employee";
import { getEmployees } from "@/features/employee/server/get-employees";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EmployeePage({ params }: Props) {
  const { id } = await params;

  const [employee, employees] = await Promise.all([
    getEmployee(id),
    getEmployees(),
  ]);

  const managerOptions = employees.data
    .filter((item) => item.id !== id && item.employmentStatus === "active")
    .map((item) => ({
      id: item.id,
      name: `${item.firstName} ${item.lastName}`,
    }));

  return (
    <EmployeeProfile employee={employee.data} managerOptions={managerOptions} />
  );
}
