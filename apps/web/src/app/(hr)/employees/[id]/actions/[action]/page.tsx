import Link from "next/link";
import { notFound } from "next/navigation";
import { UploadEmployeeDocumentForm } from "@/features/employee-document/components/upload-employee-document-form";
import {
  EmployeeRecordActionLinks,
  type EmployeeRecordAction,
  isEmployeeRecordAction,
} from "@/features/employee/components/employee-record-action-links";
import { getEmployee } from "@/features/employee/server/get-employee";
import { CreatePerformanceReviewForm } from "@/features/performance-review/components/create-performance-review-form";
import { AssignShiftForm } from "@/features/shift/components/assign-shift-form";
import { getShifts } from "@/features/shift/server/get-shifts";
import { PageHeader } from "@/components/ui/page-header";

interface EmployeeActionPageProps {
  params: Promise<{
    id: string;
    action: string;
  }>;
}

const actionDetails: Record<
  EmployeeRecordAction,
  { title: string; description: string }
> = {
  "upload-document": {
    title: "Upload document",
    description: "Add a document to this employee's active record.",
  },
  "assign-shift": {
    title: "Assign shift",
    description: "Add a non-overlapping work schedule for this employee.",
  },
  "create-review": {
    title: "Create performance review",
    description: "Record a dated performance rating and feedback.",
  },
};

export default async function EmployeeActionPage({
  params,
}: EmployeeActionPageProps) {
  const { id, action } = await params;

  if (!isEmployeeRecordAction(action)) {
    notFound();
  }

  const [employeeResponse, shiftsResponse] = await Promise.all([
    getEmployee(id),
    action === "assign-shift" ? getShifts() : Promise.resolve(null),
  ]);
  const employee = employeeResponse.data;
  const fullName = [employee.firstName, employee.middleName, employee.lastName]
    .filter(Boolean)
    .join(" ");
  const activeShiftOptions =
    shiftsResponse?.data
      .filter((shift) => shift.isActive)
      .map(({ id: shiftId, name, startTime, endTime }) => ({
        id: shiftId,
        name,
        startTime,
        endTime,
      })) ?? [];
  const details = actionDetails[action];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="space-y-4 border-b border-border pb-5">
        <Link
          href={`/employees/${encodeURIComponent(id)}`}
          className="inline-flex text-sm font-medium text-secondary-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          ← Back to employee record
        </Link>

        <PageHeader
          title={details.title}
          eyebrow={`${fullName} · ${employee.employeeNumber}`}
          description={details.description}
        />
      </header>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold">Other actions</h2>
        <EmployeeRecordActionLinks employeeId={id} currentAction={action} />
      </section>

      {action === "upload-document" ? (
        <UploadEmployeeDocumentForm employeeId={id} />
      ) : action === "assign-shift" ? (
        <AssignShiftForm employeeId={id} shifts={activeShiftOptions} />
      ) : (
        <CreatePerformanceReviewForm employeeId={id} />
      )}
    </div>
  );
}
