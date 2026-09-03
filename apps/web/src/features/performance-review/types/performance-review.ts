export type PerformanceReviewRole =
  | "admin"
  | "hr"
  | "employee"
  | "manager";

export interface PerformanceReview {
  id: string;
  reviewDate: string;
  rating: number;
  strengths: string | null;
  improvements: string | null;
  comments: string | null;
  reviewer: {
    id: string;
    name: string;
    role: PerformanceReviewRole;
  };
  createdAt: string;
  updatedAt: string;
}

export interface TeamPerformanceReview extends PerformanceReview {
  employee: {
    id: string;
    employeeNumber: string;
    name: string;
  };
}

export interface CreatedPerformanceReview {
  id: string;
}
