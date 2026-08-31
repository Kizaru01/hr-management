import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { PositionManagement } from "@/features/positions/components/position-management";
import { getDepartmentPositions } from "@/features/positions/server/get-department-positions";
import { getDepartment } from "@/features/departments/server/get-department";
import { RequestError } from "@/lib/errors/http-errors";

interface DepartmentPositionsPageProps {
  params: Promise<{ departmentId: string }>;
}

export default async function DepartmentPositionsPage({
  params,
}: DepartmentPositionsPageProps) {
  const { departmentId } = await params;
  const [departmentResponse, positionsResponse] =
    await loadDepartmentPositions(departmentId);
  const department = departmentResponse.data;

  return (
    <div className="space-y-7">
      <header>
        <Link
          href="/departments"
          className="inline-flex items-center gap-2 rounded-sm text-sm font-medium text-foreground/65 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <ArrowLeft aria-hidden="true" size={16} />
          Back to departments
        </Link>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-xs font-medium text-foreground/55">
              {department.code}
            </p>
            <h1 className="mt-1 text-2xl font-semibold">
              {department.name} positions
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-foreground/60">
              Manage the roles available within this department.
            </p>
          </div>
          <span className="inline-flex w-fit rounded-full border border-foreground/20 bg-foreground/5 px-2 py-0.5 text-xs font-medium">
            Department {department.isActive ? "active" : "inactive"}
          </span>
        </div>
      </header>

      <PositionManagement
        department={department}
        positions={positionsResponse.data}
      />
    </div>
  );
}

async function loadDepartmentPositions(departmentId: string) {
  try {
    return await Promise.all([
      getDepartment(departmentId),
      getDepartmentPositions(departmentId),
    ]);
  } catch (error) {
    if (error instanceof RequestError && error.statusCode === 404) {
      notFound();
    }

    throw error;
  }
}
