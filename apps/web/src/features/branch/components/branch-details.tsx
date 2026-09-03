import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Feedback } from "@/components/ui/feedback";
import type { Branch } from "../types/branch";
import {
  formatBranchDate,
  formatBranchLocation,
} from "../utils/branch-formatters";

interface BranchDetailsProps {
  branch: Branch;
  onEdit: () => void;
  onRequestStatusChange: () => void;
}

export function BranchDetails({
  branch,
  onEdit,
  onRequestStatusChange,
}: BranchDetailsProps) {
  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-5">
        <p className="font-mono text-xs font-medium text-muted-foreground">
          {branch.code}
        </p>
        <h3 className="mt-1 break-words text-lg font-semibold">
          {branch.name}
        </h3>
        <Badge
          variant={branch.isActive ? "success" : "neutral"}
          className="mt-3"
        >
          {branch.isActive ? "Active" : "Inactive"}
        </Badge>
      </div>

      <dl className="grid gap-4">
        <Detail label="Location" value={formatBranchLocation(branch)} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Detail label="City" value={branch.city ?? "Not provided"} />
          <Detail
            label="Province"
            value={branch.province ?? "Not provided"}
          />
        </div>
      </dl>

      <section
        aria-labelledby="branch-attendance-location"
        className="border-t border-border pt-5"
      >
        <h3
          id="branch-attendance-location"
          className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
        >
          Attendance location
        </h3>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <Detail
            label="Latitude"
            value={formatCoordinate(branch.latitude)}
          />
          <Detail
            label="Longitude"
            value={formatCoordinate(branch.longitude)}
          />
          <Detail
            label="Allowed radius"
            value={
              branch.allowedRadius === null
                ? "Not provided"
                : `${branch.allowedRadius} meters`
            }
          />
        </dl>
      </section>

      <dl className="grid gap-4 border-t border-border pt-5 sm:grid-cols-2">
        <Detail
          label="Active employees"
          value={String(branch.activeEmployeeCount)}
        />
        <Detail label="Created" value={formatBranchDate(branch.createdAt)} />
        <Detail
          label="Last updated"
          value={formatBranchDate(branch.updatedAt)}
        />
      </dl>

      {branch.isActive && branch.activeEmployeeCount > 0 ? (
        <Feedback tone="warning">
          Reassign
          {branch.activeEmployeeCount === 1
            ? " the active employee"
            : " all active employees"} before deactivating this branch.
        </Feedback>
      ) : null}

      <div className="grid gap-2 border-t border-border pt-5 sm:grid-cols-2">
        <Button type="button" onClick={onEdit}>
          Edit branch
        </Button>
        <Button
          type="button"
          variant={branch.isActive ? "destructive" : "secondary"}
          onClick={onRequestStatusChange}
        >
          {branch.isActive ? "Deactivate" : "Reactivate"}
        </Button>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-2 break-words text-sm leading-6 [overflow-wrap:anywhere]">
        {value}
      </dd>
    </div>
  );
}

function formatCoordinate(value: number | null) {
  return value === null ? "Not provided" : value.toFixed(7);
}
