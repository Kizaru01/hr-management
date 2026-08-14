import { z } from "zod";
import { createShiftSchema } from "./create-shift.schema.js";

export const updateShiftSchema = createShiftSchema.partial();

export type UpdateShiftInput = z.infer<typeof updateShiftSchema>;
