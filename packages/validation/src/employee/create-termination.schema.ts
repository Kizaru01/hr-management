import z from "zod";

export const terminateEmployeeSchema = z.object({
  terminationDate: z.iso
    .date("Termination date must use YYYY-MM-DD format.")
    .transform((date) => new Date(`${date}T00:00:00.000Z`)),

  reason: z.string().trim().min(3, "Termination reason is required.").max(500),
});

export type TerminateEmployeeInput = z.infer<typeof terminateEmployeeSchema>;
