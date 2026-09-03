import { BranchManagement } from "@/features/branch/components/branch-management";
import { getBranches } from "@/features/branch/server/get-branches";

export default async function BranchesPage() {
  const response = await getBranches();

  return <BranchManagement branches={response.data} />;
}
