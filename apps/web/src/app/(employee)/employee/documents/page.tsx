import { EmployeeDocumentsList } from "@/features/employee-document/components/employee-documents-list";
import { getMyDocuments } from "@/features/employee-document/server/get-my-documents";
import { getEmployeeDocumentReferenceDate } from "@/features/employee-document/utils/employee-document-formatters";

export default async function EmployeeDocumentsPage() {
  const response = await getMyDocuments();

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-semibold">Employee Documents</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View and download documents shared with you.
        </p>
      </div>

      <EmployeeDocumentsList
        documents={response.data}
        referenceDate={getEmployeeDocumentReferenceDate()}
      />
    </div>
  );
}
