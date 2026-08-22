interface DashboardStatCardProps {
  label: string;
  value: number;
}

export const DashboardStatCard = ({
  label,
  value,
}: DashboardStatCardProps) => {
  return (
    <div className="rounded-xl border p-5">
      <p className="text-sm text-muted-foreground">
        {label}
      </p>

      <p className="mt-2 text-3xl font-semibold">
        {value}
      </p>
    </div>
  );
};