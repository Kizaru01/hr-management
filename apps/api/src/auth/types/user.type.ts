export interface AuthenticatedUser {
  id: string;
  email: string;
  role: 'admin' | 'hr' | 'employee' | 'manager';
}
