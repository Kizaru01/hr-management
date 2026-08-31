export interface EmployeeDocument {
  id: string;
  title: string;
  type: string;
  issuedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export interface ManagedEmployeeDocument extends EmployeeDocument {
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

export interface CreatedEmployeeDocument {
  id: string;
}

export interface DeactivatedEmployeeDocument {
  id: string;
  isActive: false;
}
