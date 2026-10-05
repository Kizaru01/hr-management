import type { HrDashboardData } from "../types/dashboard";
import { Card, CardContent } from "@/components/ui/card";

interface EmployeeOverviewProps {
  employees: NonNullable<HrDashboardData["employees"]>;
}

export const EmployeeOverview = ({ employees }: EmployeeOverviewProps) => {
  const items = [
    {
      label: "Total",
      value: employees.total,
    },
    {
      label: "Active",
      value: employees.active,
    },
    {
      label: "Inactive",
      value: employees.inactive,
    },
    {
      label: "Other employment statuses",
      value: employees.other,
    },
  ];

  return (
    <Card>
      <CardContent>
        <h2 className="font-semibold">Employee Overview</h2>

        <div className="mt-4 divide-y divide-border">
          {items.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
            >
              <span className="text-sm text-muted-foreground">
                {item.label}
              </span>

              <span className="font-medium">{item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
