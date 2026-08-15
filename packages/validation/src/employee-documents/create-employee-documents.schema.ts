import { z } from "zod";

export const createEmployeeDocumentSchema = z
  .object({
    title: z.string().trim().min(2, "Document title is required.").max(150),

    type: z.string().trim().min(2, "Document type is required.").max(50),

    fileUrl: z.url("Invalid file URL."),

    issuedAt: z.coerce.date().optional(),
    expiresAt: z.coerce.date().optional(),
  })
  .refine(
    (data) =>
      !data.issuedAt || !data.expiresAt || data.expiresAt >= data.issuedAt,
    {
      message: "Expiration date cannot be before issue date.",
      path: ["expiresAt"],
    },
  );

export type CreateEmployeeDocumentInput = z.infer<
  typeof createEmployeeDocumentSchema
>;
