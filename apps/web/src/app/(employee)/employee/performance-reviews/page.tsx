import { PerformanceReviewsList } from "@/features/performance-review/components/performance-reviews-list";
import { getMyPerformanceReviews } from "@/features/performance-review/server/get-my-performance-reviews";
import { PageHeader } from "@/components/ui/page-header";

export default async function EmployeePerformanceReviewsPage() {
  const response = await getMyPerformanceReviews();

  return (
    <section className="page-stack mx-auto w-full max-w-6xl">
      <PageHeader
        title="Performance Reviews"
        description="View feedback and ratings from your completed performance reviews."
      />

      <PerformanceReviewsList reviews={response.data} />
    </section>
  );
}
