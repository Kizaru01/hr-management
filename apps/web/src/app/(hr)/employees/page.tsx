import type { ListSearchParams } from "@/lib/list-query";
import { normalizeListUrl } from "@/lib/normalize-list-url";
import { getBranches } from "@/features/branch/server/get-branches";
import { getDepartments } from "@/features/departments/server/get-departments";
import { EmployeeManagement } from "@/features/employee/components/employee-management";
import { getEmployees } from "@/features/employee/server/get-employees";
import { getDepartmentPositions } from "@/features/positions/server/get-department-positions";
import { normalizeEmployeeQuery } from "@/features/employee/utils/list-filters";

export default async function EmployeesPage({
  searchParams,
}: {
  searchParams: Promise<ListSearchParams>;
}) {
  const raw = await searchParams;
  const query = normalizeEmployeeQuery(raw);
  const [departmentResponse, branchResponse] = await Promise.all([
    getDepartments(),
    getBranches(),
  ]);
  if (!departmentResponse.data.some((item) => item.id === query.departmentId))
    query.departmentId = undefined;
  if (!branchResponse.data.some((item) => item.id === query.branchId))
    query.branchId = undefined;
  const positions = query.departmentId
    ? (await getDepartmentPositions(query.departmentId)).data
    : [];
  if (!positions.some((item) => item.id === query.positionId))
    query.positionId = undefined;
  normalizeListUrl("/employees", raw, query);
  const employeeResponse = await getEmployees(query);
  const hasFilters = Object.values(query).some(Boolean);
  const noMatchingResults =
    hasFilters &&
    employeeResponse.data.length === 0 &&
    (await getEmployees()).data.length > 0;
  const option = (item: { id: string; name: string; code: string }) => ({
    label: item.name + " (" + item.code + ")",
    value: item.id,
  });

  return (
    <EmployeeManagement
      employees={employeeResponse.data}
      departments={departmentResponse.data
        .filter((item) => item.isActive)
        .map(option)}
      branches={branchResponse.data.filter((item) => item.isActive).map(option)}
      filterDepartments={departmentResponse.data.map(option)}
      filterBranches={branchResponse.data.map(option)}
      filterPositions={positions.map((item) => ({
        value: item.id,
        label: item.name,
      }))}
      query={query}
      noMatchingResults={noMatchingResults}
    />
  );
}
