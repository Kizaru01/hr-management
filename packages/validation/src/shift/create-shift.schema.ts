import { z } from "zod";

const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must be in HH:mm format.");

export const createShiftSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Shift name is required.")
    .max(100, "Shift name must not exceed 100 characters."),

  startTime: timeSchema,
  endTime: timeSchema,
});

export type CreateShiftInput = z.infer<typeof createShiftSchema>;
