export function getFullName(
  firstName: string,
  lastName: string,
  middleName?: string,
): string {
  return [firstName, middleName, lastName].filter(Boolean).join(" ");
}
export function normalizeName(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
