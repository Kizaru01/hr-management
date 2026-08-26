import { PerformanceReviewsList } from "@/features/performance-review/components/performance-reviews-list";
import { getMyPerformanceReviews } from "@/features/performance-review/server/get-my-performance-reviews";

export default async function EmployeePerformanceReviewsPage() {
  const response = await getMyPerformanceReviews();

  return (
    <section className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-semibold">Performance Reviews</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View feedback and ratings from your completed performance reviews.
        </p>
      </div>

      <PerformanceReviewsList reviews={response.data} />
    </section>
  );
}
