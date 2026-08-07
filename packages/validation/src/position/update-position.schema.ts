import { createPositionSchema } from "./create-position.schema.js";
import { z } from "zod";

export const updatePositionSchema = createPositionSchema.partial();

export type UpdatePositionInput = z.infer<
  typeof updatePositionSchema
>;