import { EmployeeDocumentsList } from "@/features/employee-document/components/employee-documents-list";
import { getMyDocuments } from "@/features/employee-document/server/get-my-documents";
import { getEmployeeDocumentReferenceDate } from "@/features/employee-document/utils/employee-document-formatters";
import { PageHeader } from "@/components/ui/page-header";

export default async function EmployeeDocumentsPage() {
  const response = await getMyDocuments();

  return (
    <div className="page-stack mx-auto w-full max-w-6xl">
      <PageHeader
        title="Employee Documents"
        description="View and download documents shared with you."
      />

      <EmployeeDocumentsList
        documents={response.data}
        referenceDate={getEmployeeDocumentReferenceDate()}
      />
    </div>
  );
}
