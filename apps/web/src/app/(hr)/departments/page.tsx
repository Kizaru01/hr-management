import { DepartmentManagement } from "@/features/departments/components/department-management";
import { getDepartments } from "@/features/departments/server/get-departments";
import { getEmployees } from "@/features/employee/server/get-employees";

export default async function DepartmentsPage() {
  const [departmentResponse, employeeResponse] = await Promise.all([
    getDepartments(),
    getEmployees(),
  ]);
  const departmentHeadOptions = employeeResponse.data
    .filter((employee) => employee.employmentStatus === "active")
    .map((employee) => {
      const name = [employee.firstName, employee.middleName, employee.lastName]
        .filter(Boolean)
        .join(" ");

      return {
        id: employee.id,
        employeeNumber: employee.employeeNumber,
        firstName: employee.firstName,
        middleName: employee.middleName,
        lastName: employee.lastName,
        label: `${name} · ${employee.employeeNumber}`,
      };
    });

  return (
    <DepartmentManagement
      departments={departmentResponse.data}
      departmentHeadOptions={departmentHeadOptions}
    />
  );
}
