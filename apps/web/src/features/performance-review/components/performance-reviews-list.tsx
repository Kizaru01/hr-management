import type { PerformanceReview } from "../types/performance-review";
import {
  formatPerformanceReviewDate,
  formatPerformanceReviewRole,
} from "../utils/performance-review-formatters";

interface PerformanceReviewsListProps {
  reviews: PerformanceReview[];
}

interface ReviewDetailProps {
  label: string;
  value: string;
  className?: string;
}

const ReviewDetail = ({ label, value, className }: ReviewDetailProps) => (
  <div className={className}>
    <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
    <dd className="mt-1 whitespace-pre-wrap text-sm leading-6">{value}</dd>
  </div>
);

export const PerformanceReviewsList = ({
  reviews,
}: PerformanceReviewsListProps) => {
  if (reviews.length === 0) {
    return;
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <article key={review.id} className="rounded-xl border p-6 shadow-sm">
          <div className="flex flex-col gap-2 border-b pb-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="font-semibold">
                Review from {formatPerformanceReviewDate(review.reviewDate)}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Reviewed by {review.reviewer.name} ·{" "}
                {formatPerformanceReviewRole(review.reviewer.role)}
              </p>
            </div>
            <p className="w-fit rounded-full bg-muted px-3 py-1 text-sm font-semibold">
              Rating: {review.rating}/5
            </p>
          </div>

          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <ReviewDetail label="Strengths" value={review.strengths ?? "—"} />
            <ReviewDetail
              label="Areas for improvement"
              value={review.improvements ?? "—"}
            />
            <ReviewDetail
              label="Comments"
              value={review.comments ?? "—"}
              className="sm:col-span-2"
            />
            <ReviewDetail
              label="Created date"
              value={formatPerformanceReviewDate(review.createdAt)}
            />
          </dl>
        </article>
      ))}
    </div>
  );
};
