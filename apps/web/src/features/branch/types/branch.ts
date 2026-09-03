export interface Branch {
  id: string;
  code: string;
  name: string;
  address: string;
  city: string | null;
  province: string | null;
  latitude: number | null;
  longitude: number | null;
  allowedRadius: number | null;
  isActive: boolean;
  activeEmployeeCount: number;
  createdAt: string;
  updatedAt: string;
}
