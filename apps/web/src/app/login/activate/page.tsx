import { redirect } from "next/navigation";

export default async function LegacyActivatePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const destination = new URLSearchParams();

  if (typeof query.token === "string") {
    destination.set("token", query.token);
  }

  redirect(`/activate${destination.size ? `?${destination}` : ""}`);
}
