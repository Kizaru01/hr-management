import type { EmployeeDetails, ManagerOption } from "../types/employee";
import { EmployeeActions } from "./employee-actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

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
        <p className="mt-1 text-muted-foreground">{employee.employeeNumber}</p>
        <Badge
          variant={
            employee.employmentStatus === "active" ? "success" : "neutral"
          }
          className="mt-2 capitalize"
        >
          {employee.employmentStatus}
        </Badge>
      </div>
      <EmployeeActions
        employeeId={employee.id}
        employmentStatus={employee.employmentStatus}
        managerOptions={managerOptions}
      />
      <Card>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Info label="Email" value={employee.email} />
          <Info label="Phone" value={employee.phoneNumber} />
          <Info label="Department" value={employee.department.name} />
          <Info label="Position" value={employee.position.name} />
          <Info label="Branch" value={employee.branch?.name} />
          <Info label="Status" value={employee.employmentStatus} />
        </CardContent>
      </Card>
    </section>
  );
};

const Info = ({ label, value }: { label: string; value?: string | null }) => (
  <div>
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="font-medium">{value ?? "—"}</p>
  </div>
);
