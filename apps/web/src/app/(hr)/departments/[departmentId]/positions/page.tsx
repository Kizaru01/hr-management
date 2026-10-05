import type { ListSearchParams } from "@/lib/list-query";
import { normalizeListUrl } from "@/lib/normalize-list-url";
import { normalizePositionQuery } from "@/features/positions/utils/list-filters";
import type { PositionQueryInput } from "@hr-management/validation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { PositionManagement } from "@/features/positions/components/position-management";
import { getDepartmentPositions } from "@/features/positions/server/get-department-positions";
import { getDepartment } from "@/features/departments/server/get-department";
import { RequestError } from "@/lib/errors/http-errors";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";

interface DepartmentPositionsPageProps {
  searchParams: Promise<ListSearchParams>;
  params: Promise<{ departmentId: string }>;
}

export default async function DepartmentPositionsPage({
  params,
  searchParams,
}: DepartmentPositionsPageProps) {
  const { departmentId } = await params;
  const raw = await searchParams;
  const query = normalizePositionQuery(raw);
  normalizeListUrl(
    "/departments/" + encodeURIComponent(departmentId) + "/positions",
    raw,
    query,
  );
  const [departmentResponse, positionsResponse] = await loadDepartmentPositions(
    departmentId,
    query,
  );
  const department = departmentResponse.data;
  const noMatchingResults =
    Object.values(query).some(Boolean) &&
    positionsResponse.data.length === 0 &&
    (await getDepartmentPositions(departmentId)).data.length > 0;

  return (
    <div className="space-y-7">
      <header className="space-y-4">
        <Link
          href="/departments"
          className="inline-flex items-center gap-2 rounded-sm text-sm font-medium text-secondary-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <ArrowLeft aria-hidden="true" size={16} />
          Back to departments
        </Link>

        <PageHeader
          title={`${department.name} positions`}
          eyebrow={<span className="font-mono">{department.code}</span>}
          description="Manage the roles available within this department."
          actions={
            <Badge variant={department.isActive ? "success" : "neutral"}>
              Department {department.isActive ? "active" : "inactive"}
            </Badge>
          }
        />
      </header>

      <PositionManagement
        department={department}
        positions={positionsResponse.data}
        query={query}
        noMatchingResults={noMatchingResults}
      />
    </div>
  );
}

async function loadDepartmentPositions(
  departmentId: string,
  query: PositionQueryInput,
) {
  try {
    return await Promise.all([
      getDepartment(departmentId),
      getDepartmentPositions(departmentId, query),
    ]);
  } catch (error) {
    if (error instanceof RequestError && error.statusCode === 404) {
      notFound();
    }

    throw error;
  }
}
