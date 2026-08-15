import { z } from "zod";
import { createHolidaySchema } from "./create-holliday.schema.js";

export const updateHolidaySchema = createHolidaySchema.partial();

export type UpdateHolidayInput = z.infer<typeof updateHolidaySchema>;
