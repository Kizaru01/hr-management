export const normalizeFieldErrors = (
  errors: Record<string, string[] | undefined>,
) =>
  Object.entries(errors).reduce<Record<string, string[]>>(
    (normalized, [field, messages]) => {
      if (messages) {
        normalized[field] = messages;
      }

      return normalized;
    },
    {},
  );
