import { EmployeeDocumentsList } from "@/features/employee-document/components/employee-documents-list";
import { getManagedEmployeeDocuments } from "@/features/employee-document/server/get-managed-employee-documents";
import { getEmployeeDocumentReferenceDate } from "@/features/employee-document/utils/employee-document-formatters";
import { PageHeader } from "@/components/ui/page-header";

export default async function DocumentsPage() {
  const response = await getManagedEmployeeDocuments();
  const documents = response.data;

  return (
    <section className="page-stack">
      <PageHeader
        title="Documents"
        description={`Review ${documents.length} active employee ${documents.length === 1 ? "document" : "documents"}. Uploads are managed from each employee profile.`}
      />

      <EmployeeDocumentsList
        documents={documents}
        referenceDate={getEmployeeDocumentReferenceDate()}
        canDeactivate
        showEmployee
      />
    </section>
  );
}
