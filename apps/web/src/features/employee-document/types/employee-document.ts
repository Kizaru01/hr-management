export interface EmployeeDocument {
  id: string;
  title: string;
  type: string;
  issuedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export interface CreatedEmployeeDocument {
  id: string;
}

export interface DeactivatedEmployeeDocument {
  id: string;
}
