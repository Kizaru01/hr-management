import { z } from "zod";

export const weekdaySchema = z.enum([
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
]);

export const assignShiftSchema = z
  .object({
    shiftId: z.string().min(1, "Shift is required."),

    workDays: z
      .array(weekdaySchema)
      .min(1, "At least one work day is required."),

    effectiveFrom: z.iso.date(
      "Effective start date must use YYYY-MM-DD format.",
    ),

    effectiveTo: z.iso
      .date("Effective end date must use YYYY-MM-DD format.")
      .optional(),
  })
  .refine(
    (data) => !data.effectiveTo || data.effectiveTo >= data.effectiveFrom,
    {
      message: "Effective end date cannot be before the start date.",
      path: ["effectiveTo"],
    },
  );

export type AssignShiftInput = z.infer<typeof assignShiftSchema>;
