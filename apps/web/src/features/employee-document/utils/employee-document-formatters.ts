const documentDateFormatter = new Intl.DateTimeFormat("en-PH", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "Asia/Manila",
});

export const formatEmployeeDocumentDate = (value: string | null) =>
  value ? documentDateFormatter.format(new Date(value)) : "—";
