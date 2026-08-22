import { getBranches } from "@/features/branch/server/get-branches";
import { getDepartments } from "@/features/departments/server/get-departments";
import { EmployeeEditForm } from "@/features/employee/components/employee-edit-form";
import { getEmployee } from "@/features/employee/server/get-employee";

interface Props {
  params: Promise<{ id: string}>
}

export default async function EditEmployeePage({ params }: Props) {
  const { id } = await params;

  const [employee, departments, branches] = await Promise.all([
    getEmployee(id),
    getDepartments(),
    getBranches(),
  ]);

  const departmentOptions = departments.data.map((item) => ({
    label: item.name,
    value: item.id,
  }));

  const branchOptions = branches.data.map((item) => ({
    label: item.name,
    value: item.id,
  }));

  return (
    <EmployeeEditForm
      employee={employee.data}
      departments={departmentOptions}
      branches={branchOptions}
    />
  );
}