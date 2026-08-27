import { EmployeeDocumentsList } from "@/features/employee-document/components/employee-documents-list";
import { getManagedEmployeeDocuments } from "@/features/employee-document/server/get-managed-employee-documents";
import { getEmployeeDocumentReferenceDate } from "@/features/employee-document/utils/employee-document-formatters";

export default async function DocumentsPage() {
  const response = await getManagedEmployeeDocuments();
  const documents = response.data;

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Documents</h1>
        <p className="mt-1 text-sm text-foreground/60">
          Review {documents.length} active employee
          {documents.length === 1 ? " document" : " documents"}. Uploads are
          managed from each employee profile.
        </p>
      </div>

      <EmployeeDocumentsList
        documents={documents}
        referenceDate={getEmployeeDocumentReferenceDate()}
        canDeactivate
        showEmployee
      />
    </section>
  );
}
