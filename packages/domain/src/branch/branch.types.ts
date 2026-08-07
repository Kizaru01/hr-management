export type BranchId = string;

export interface Branch {
  id: BranchId;
  name: string;
  address?: string;
}