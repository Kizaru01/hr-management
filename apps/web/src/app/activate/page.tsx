import { ActivateAccountForm } from "@/features/auth/components/activate-account-form";

export default async function ActivatePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const token = typeof query.token === "string" ? query.token : "";

  return <ActivateAccountForm token={token} />;
}
