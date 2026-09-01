import { getBranches } from "@/features/branch/server/get-branches";
import { getDepartments } from "@/features/departments/server/get-departments";
import { EmployeeEditForm } from "@/features/employee/components/employee-edit-form";
import { getEmployee } from "@/features/employee/server/get-employee";
import { PageHeader } from "@/components/ui/page-header";

interface Props {
  params: Promise<{ id: string }>;
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

  const fullName = [
    employee.data.firstName,
    employee.data.middleName,
    employee.data.lastName,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="page-stack mx-auto w-full max-w-5xl">
      <PageHeader
        title="Edit employee"
        description={`Update the employee record for ${fullName}.`}
      />
      <EmployeeEditForm
        employee={employee.data}
        departments={departmentOptions}
        branches={branchOptions}
      />
    </div>
  );
}
