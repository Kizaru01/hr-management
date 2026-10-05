import type { ListSearchParams } from "@/lib/list-query";
import { normalizeListUrl } from "@/lib/normalize-list-url";
import { normalizeBranchQuery } from "@/features/branch/utils/list-filters";
import { BranchManagement } from "@/features/branch/components/branch-management";
import { getBranches } from "@/features/branch/server/get-branches";

export default async function BranchesPage({
  searchParams,
}: {
  searchParams: Promise<ListSearchParams>;
}) {
  const raw = await searchParams;
  const query = normalizeBranchQuery(raw);
  normalizeListUrl("/branches", raw, query);
  const response = await getBranches(query);
  const noMatchingResults =
    Object.values(query).some(Boolean) &&
    response.data.length === 0 &&
    (await getBranches()).data.length > 0;

  return (
    <BranchManagement
      branches={response.data}
      query={query}
      noMatchingResults={noMatchingResults}
    />
  );
}
