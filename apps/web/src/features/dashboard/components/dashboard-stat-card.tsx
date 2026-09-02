interface DashboardStatCardProps {
  label: string;
  value: number;
}

export const DashboardStatCard = ({ label, value }: DashboardStatCardProps) => {
  return (
    <Card>
      <CardContent>
        <p className="text-sm text-muted-foreground">{label}</p>

        <p className="mt-2 text-2xl font-semibold leading-8">{value}</p>
      </CardContent>
    </Card>
  );
};
import { Card, CardContent } from "@/components/ui/card";
