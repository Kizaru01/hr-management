// API messages are plain user-facing text, never diagnostic output.
export function safeMessage(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  const message = value.trim();
  // Credential field names are normal validation copy. Reject credential values
  // (e.g. "password=...") rather than every mention of the field.
  if (!message || message.length > 300 || /[\r\n<>]|(?:\bstack\b|traceback|exception|prisma|sqlstate|internal server|ECONN|ENOENT|node_modules|authorization|\bbearer\s+\S+|(?:password|secret|token)["']?\s*[:=])|[A-Za-z]:\\|\/(?:home|usr|var|app|src)\//i.test(message)) {
    return fallback;
  }
  return message;
}
