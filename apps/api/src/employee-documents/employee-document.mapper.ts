interface EmployeeDocumentListSource {
  id: string;
  title: string;
  type: string;
  issuedAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
}

export interface EmployeeDocumentListItem {
  id: string;
  title: string;
  type: string;
  issuedAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
}

export function mapEmployeeDocumentListItem(
  document: EmployeeDocumentListSource,
): EmployeeDocumentListItem {
  return {
    id: document.id,
    title: document.title,
    type: document.type,
    issuedAt: document.issuedAt,
    expiresAt: document.expiresAt,
    createdAt: document.createdAt,
  };
}
