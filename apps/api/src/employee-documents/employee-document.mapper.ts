interface EmployeeDocumentListSource {
  id: string;
  title: string;
  type: string;
  issuedAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
}

interface ManagedEmployeeDocumentListSource extends EmployeeDocumentListSource {
  employeeId: string;
  employee: {
    id: string;
    employeeNumber: string;
    firstName: string;
    middleName: string | null;
    lastName: string;
  };
}

export interface EmployeeDocumentListItem {
  id: string;
  title: string;
  type: string;
  issuedAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
}

export interface ManagedEmployeeDocumentListItem extends EmployeeDocumentListItem {
  documentId: string;
  employeeId: string;
  employee: {
    id: string;
    employeeNumber: string;
    firstName: string;
    middleName: string | null;
    lastName: string;
  };
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

export function mapManagedEmployeeDocumentListItem(
  document: ManagedEmployeeDocumentListSource,
): ManagedEmployeeDocumentListItem {
  return {
    ...mapEmployeeDocumentListItem(document),
    documentId: document.id,
    employeeId: document.employeeId,
    employee: {
      id: document.employee.id,
      employeeNumber: document.employee.employeeNumber,
      firstName: document.employee.firstName,
      middleName: document.employee.middleName,
      lastName: document.employee.lastName,
    },
  };
}
