import Link from 'next/link';
import type { EmployeeListItem } from '../types/employee';

interface EmployeeRowProps {
  employee: EmployeeListItem;
}

export const EmployeeRow = ({
  employee,
}: EmployeeRowProps) => {
  const name = [
    employee.firstName,
    employee.middleName,
    employee.lastName,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <tr className="border-b last:border-0">
      <td className="px-4 py-4">
        <p className="font-medium">{name}</p>
        <p className="text-xs text-muted-foreground">
          {employee.employeeNumber}
        </p>
      </td>

      <td className="px-4 py-4">{employee.department.name}</td>
      <td className="px-4 py-4">{employee.position.name}</td>
      <td className="px-4 py-4">{employee.branch?.name ?? '—'}</td>
      <td className="px-4 py-4 capitalize">
        {employee.employmentStatus}
      </td>

      <td className="px-4 py-4">
        <Link href={`/employees/${employee.id}`}>
          View
        </Link>
      </td>
    </tr>
  );
};