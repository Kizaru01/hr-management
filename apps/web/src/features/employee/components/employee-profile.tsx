import type { EmployeeDetails, ManagerOption } from "../types/employee";
import { EmployeeActions } from "./employee-actions";

interface EmployeeProfileProps {
  employee: EmployeeDetails;
  managerOptions: ManagerOption[];
}

export const EmployeeProfile = ({
  employee,
  managerOptions,
}: EmployeeProfileProps) => {
  const fullName = [employee.firstName, employee.middleName, employee.lastName]
    .filter(Boolean)
    .join(" ");

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{fullName}</h1>
        <p className="text-muted-foreground">{employee.employeeNumber}</p>
      </div>
      <EmployeeActions
        employeeId={employee.id}
        employmentStatus={employee.employmentStatus}
        managerOptions={managerOptions}
      />
      <div className="grid gap-4 rounded-xl border p-6 sm:grid-cols-2">
        <Info label="Email" value={employee.email} />
        <Info label="Phone" value={employee.phoneNumber} />
        <Info label="Department" value={employee.department.name} />
        <Info label="Position" value={employee.position.name} />
        <Info label="Branch" value={employee.branch?.name} />
        <Info label="Status" value={employee.employmentStatus} />
      </div>
    </section>
  );
};

const Info = ({ label, value }: { label: string; value?: string | null }) => (
  <div>
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="font-medium">{value ?? "—"}</p>
  </div>
);
