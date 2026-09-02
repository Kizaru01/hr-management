import type { EmployeeListItem } from "../types/employee";
import { EmployeeRow } from "./employee-row";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TableShell } from "@/components/ui/table";

interface EmployeeTableProps {
  employees: EmployeeListItem[];
}

const headers = [
  "Employee",
  "Department",
  "Position",
  "Branch",
  "Status",
  "Action",
];

export const EmployeeTable = ({ employees }: EmployeeTableProps) => {
  if (employees.length === 0) {
    return (
      <EmptyState
        title="No employees found"
        description="Employee records will appear here once they are available."
      />
    );
  }

  return (
    <TableShell>
      <Table className="min-w-[760px]">
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {employees.map((employee) => (
            <EmployeeRow key={employee.id} employee={employee} />
          ))}
        </tbody>
      </Table>
    </TableShell>
  );
};
