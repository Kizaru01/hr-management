import { z } from "zod";

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format.");

export const attendanceQuerySchema = z.object({
  date: dateSchema.optional(),
});

export type AttendanceQueryInput = z.infer<typeof attendanceQuerySchema>;

export const attendanceRangeQuerySchema = z
  .object({
    from: dateSchema,
    to: dateSchema,
  })
  .refine((data) => data.from <= data.to, {
    message: "From date cannot be after to date.",
    path: ["to"],
  });

export type AttendanceRangeQueryInput = z.infer<
  typeof attendanceRangeQuerySchema
>;
