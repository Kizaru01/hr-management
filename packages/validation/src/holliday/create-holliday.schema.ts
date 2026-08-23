import { z } from "zod";

export const createHolidaySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Holiday name must contain at least 2 characters.")
    .max(100, "Holiday name must not exceed 100 characters."),

  date: z.iso.date("Holiday date must use YYYY-MM-DD format."),
});

export type CreateHolidayInput = z.infer<typeof createHolidaySchema>;
