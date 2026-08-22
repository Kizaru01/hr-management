import { EmployeeProfile } from "@/features/employee/components/employee-profile";
import { getEmployee } from "@/features/employee/server/get-employee";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EmployeePage({ params }: Props) {
  const { id } = await params;
  const { data } = await getEmployee(id);

  return <EmployeeProfile employee={data} />;
}