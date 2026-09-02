import { createPositionSchema } from "./create-position.schema.js";
import { z } from "zod";

export const updatePositionSchema = createPositionSchema
  .pick({
    name: true,
    description: true,
  })
  .partial()
  .strict();

export type UpdatePositionInput = z.infer<
  typeof updatePositionSchema
>;
