import type { EmployeeListItem } from '../types/employee';
import { EmployeeRow } from './employee-row';


interface EmployeeTableProps {
  employees: EmployeeListItem[];
}

const headers = [
  'Employee',
  'Department',
  'Position',
  'Branch',
  'Status',
  'Action',
];

export const EmployeeTable = ({
  employees,
}: EmployeeTableProps) => (
  <div className="overflow-x-auto rounded-xl border">
    <table className="w-full text-sm">
      <thead className="border-b bg-muted/50">
        <tr>
          {headers.map((header) => (
            <th key={header} className="px-4 py-3 text-left">
              {header}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {employees.map((employee) => (
          <EmployeeRow
            key={employee.id}
            employee={employee}
          />
        ))}
      </tbody>
    </table>
  </div>
);