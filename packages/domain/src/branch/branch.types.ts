export type BranchId = string;

export interface Branch {
  id: BranchId;
  code: string;
  name: string;
  address: string;
  city?: string | null;
  province?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  allowedRadius?: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
