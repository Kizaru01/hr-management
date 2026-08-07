export function getFullName(
  firstName: string,
  lastName: string,
  middleName?: string,
): string {
  return [firstName, middleName, lastName]
    .filter(Boolean)
    .join(" ");
}