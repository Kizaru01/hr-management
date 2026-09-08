import type { ListSearchParams } from "@/lib/list-query";
import { normalizeListUrl } from "@/lib/normalize-list-url";
import { normalizeDepartmentQuery } from "@/features/departments/utils/list-filters";
import { DepartmentManagement } from "@/features/departments/components/department-management";
import { getDepartments } from "@/features/departments/server/get-departments";
import { getEmployees } from "@/features/employee/server/get-employees";

export default async function DepartmentsPage({
  searchParams,
}: {
  searchParams: Promise<ListSearchParams>;
}) {
  const raw = await searchParams;
  const query = normalizeDepartmentQuery(raw);
  normalizeListUrl("/departments", raw, query);
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

  const filtered = Object.values(query).some(Boolean)
    ? await getDepartments(query)
    : departmentResponse;

  return (
    <DepartmentManagement
      departments={filtered.data}
      allDepartments={departmentResponse.data}
      query={query}
      noMatchingResults={
        filtered.data.length === 0 && departmentResponse.data.length > 0
      }
      departmentHeadOptions={departmentHeadOptions}
    />
  );
}
