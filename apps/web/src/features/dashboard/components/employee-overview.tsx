import type { HrDashboardData } from '../types/dashboard';

interface EmployeeOverviewProps {
  employees: HrDashboardData['employees'];
  activeAnnouncements: number;
}

export const EmployeeOverview = ({
  employees,
  activeAnnouncements,
}: EmployeeOverviewProps) => {
  const items = [
    {
      label: 'Total',
      value: employees.total,
    },
    {
      label: 'Active',
      value: employees.active,
    },
    {
      label: 'Inactive',
      value: employees.inactive,
    },
    {
      label: 'Active Announcements',
      value: activeAnnouncements,
    },
  ];

  return (
    <div className="rounded-xl border p-5">
      <h2 className="font-semibold">
        Employee Overview
      </h2>

      <div className="mt-4 space-y-4">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between"
          >
            <span className="text-sm text-muted-foreground">
              {item.label}
            </span>

            <span className="font-medium">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};