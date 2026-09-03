import { getBranches } from "@/features/branch/server/get-branches";
import { getDepartments } from "@/features/departments/server/get-departments";
import { EmployeeManagement } from "@/features/employee/components/employee-management";
import { getEmployees } from "@/features/employee/server/get-employees";

export default async function EmployeesPage() {
  const [employeeResponse, departmentResponse, branchResponse] =
    await Promise.all([getEmployees(), getDepartments(), getBranches()]);

  const departments = departmentResponse.data
    .filter((department) => department.isActive)
    .map((department) => ({
      label: `${department.name} (${department.code})`,
      value: department.id,
    }));
  const branches = branchResponse.data
    .filter((branch) => branch.isActive)
    .map((branch) => ({
      label: `${branch.name} (${branch.code})`,
      value: branch.id,
    }));

  return (
    <EmployeeManagement
      employees={employeeResponse.data}
      departments={departments}
      branches={branches}
    />
  );
}
